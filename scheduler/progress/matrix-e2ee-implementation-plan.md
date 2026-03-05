# Matrix E2EE Implementation Plan for Sophie

**Created:** 2026-03-03  
**Status:** Research Complete - Implementation Plan Ready  
**Priority:** P0 - Critical for Voice Bot Functionality

## Executive Summary

Sophie cannot decrypt Aaron's messages or audio because:
1. **No Megolm sessions** - Sophie's crypto store has ZERO inbound group sessions
2. **No device keys** - Sophie doesn't know about Aaron's devices
3. **No verification** - No trust relationship established
4. **MatrixRTC E2EE is separate** - Voice encryption uses a different key exchange (MSC4143)

## Root Cause Analysis

### Problem 1: "No Session Found" for Megolm

**What this means:**
- Encrypted room messages use Megolm (group encryption)
- Each sender creates a Megolm session and shares the key with room members
- Sophie doesn't have Aaron's Megolm session key
- **WHY:** Aaron's client hasn't shared keys with Sophie's device (possibly because Sophie's device isn't verified/trusted)

**Evidence from crypto store:**
```sql
sqlite3 sophie_matrix "SELECT COUNT(*) FROM megolminboundsessions"
-- Returns: 0
```

### Problem 2: MatrixRTC Voice Encryption Keys

**How MatrixRTC E2EE Works (per MSC4143):**
1. Each participant generates a 256-bit sender key
2. Keys are shared via encrypted `m.rtc.encryption_key` to-device messages
3. Keys are used for SFrame encryption of WebRTC audio/video
4. This is COMPLETELY SEPARATE from room Megolm encryption

**Current Sophie Implementation Issues:**
- Sophie generates her own key correctly ✓
- Sophie publishes her key in `call.member` state event ✓
- Sophie tries to extract Aaron's key from `call.member` ✓
- **BUT:** Sophie sends unencrypted to-device messages (won't be accepted)
- **BUT:** Sophie may not have an Olm session with Aaron's device

### Problem 3: Device Trust/Verification

**Matrix E2EE Trust Model:**
- By default, clients don't share Megolm keys with unverified devices
- Aaron's Element X is likely configured to require verification
- Sophie's device (SOPHIEVOICE01) has never been verified by Aaron

**What verification requires:**
1. SAS (Short Authentication String) - interactive emoji comparison
2. Or cross-signing via the server (if user's master key is trusted)

---

## Implementation Plan

### Phase 1: Fix Megolm Key Exchange (Room Messages)

#### Step 1.1: Enable Proper Crypto Store Initialization

The current code creates the store but may not be persisting properly.

**Changes to `sophie_voice_full.py`:**

```python
# CRITICAL: Ensure we're using the same device_id as in session.json
# Current issue: session.json has SOPHIEVOICE01 but crypto store has different device IDs

async def start(self) -> bool:
    # Load session BEFORE creating client
    session_file = config.data_path / "session.json"
    crypto_store_path = config.data_path / "crypto_store"  # Use dedicated path
    
    saved_session = None
    if session_file.exists():
        with open(session_file) as f:
            saved_session = json.load(f)
        device_id = saved_session.get("device_id")
    else:
        device_id = "SOPHIEVOICE01"  # Fixed, predictable device ID
    
    # Create client with SAME device_id as saved
    matrix_config = AsyncClientConfig(
        store=SqliteStore,
        store_name=f"sophie_crypto_{device_id}",  # Include device_id in store name!
        encryption_enabled=True,
    )
    
    self.matrix_client = AsyncClient(
        config.matrix_homeserver,
        config.matrix_user,
        config=matrix_config,
        store_path=str(crypto_store_path),
        device_id=device_id,  # Must match!
    )
```

#### Step 1.2: Perform Full Crypto Sync on Startup

```python
async def _initialize_crypto(self):
    """Initialize crypto properly after login."""
    
    # 1. Upload device keys if not already done
    if self.matrix_client.should_upload_keys:
        logger.info("📤 Uploading device keys...")
        response = await self.matrix_client.keys_upload()
        logger.info(f"   Result: {type(response).__name__}")
    
    # 2. Query keys for all room members
    logger.info("🔑 Querying device keys for room members...")
    room = self.matrix_client.rooms.get(config.matrix_room_id)
    if room:
        user_ids = list(room.users.keys())
        response = await self.matrix_client.keys_query(users=user_ids)
        if isinstance(response, KeysQueryResponse):
            logger.info(f"   Got keys for {len(response.device_keys)} users")
    
    # 3. Claim one-time keys for users we don't have sessions with
    missing = self.matrix_client.get_missing_sessions(config.matrix_room_id)
    if missing:
        logger.info(f"🔑 Claiming one-time keys for {len(missing)} users...")
        await self.matrix_client.keys_claim(missing)
```

#### Step 1.3: Auto-Verify Aaron's Devices (Server-Side Solution)

Since we control the Synapse server, we can programmatically verify devices.

**Option A: Use Synapse Admin API to trust devices**

```bash
# On server: Get Aaron's devices
curl -X GET "https://matrix3.aaroncollins.info/_synapse/admin/v2/users/@aaron:matrix3.aaroncollins.info/devices" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Cross-sign Sophie's device with Aaron's account (requires admin)
```

**Option B: Programmatically verify in Sophie's client**

```python
async def _auto_verify_aaron_devices(self):
    """Automatically trust Aaron's devices (since we control the server)."""
    
    # Get Aaron's devices from the device store
    if hasattr(self.matrix_client, 'olm') and self.matrix_client.olm:
        device_store = self.matrix_client.olm.device_store
        
        for device in device_store.active_user_devices(config.aaron_user_id):
            if not self.matrix_client.olm.is_device_verified(device):
                logger.info(f"✅ Auto-verifying Aaron's device: {device.device_id}")
                self.matrix_client.verify_device(device)
```

**Option C: Set ignore_unverified_devices = True**

This allows messages to be sent to unverified devices (they still get keys).

```python
# When sending room messages or sharing keys
await self.matrix_client.room_send(
    room_id=room_id,
    message_type="m.room.message",
    content=content,
    ignore_unverified_devices=True  # This is the key!
)
```

### Phase 2: Fix MatrixRTC Key Exchange (Voice E2EE)

#### Step 2.1: Send Encrypted to-device Messages

The current implementation sends `m.rtc.encryption_key` but may not be using the encrypted Olm channel.

```python
async def _send_encryption_key_to_aaron(self):
    """Send our MatrixRTC E2EE key via encrypted to-device message."""
    
    if not self.presence.aaron_device_id:
        logger.warning("Cannot send key - don't know Aaron's device ID")
        return
    
    # The key content (MSC4143 format)
    key_content = {
        "room_id": config.matrix_room_id,
        "member_id": f"{self.device_id}_{secrets.token_hex(4)}",
        "media_key": {
            "index": 0,
            "key": self.our_e2ee_key_b64,
        },
        "version": "0"
    }
    
    # CRITICAL: Must send via encrypted channel!
    # Use the matrix-nio to_device method which handles encryption
    messages = {
        config.aaron_user_id: {
            self.presence.aaron_device_id: key_content
        }
    }
    
    # Check if we have an Olm session with Aaron's device
    if hasattr(self.matrix_client, 'olm') and self.matrix_client.olm:
        device = None
        try:
            device = self.matrix_client.olm.device_store[config.aaron_user_id][self.presence.aaron_device_id]
        except KeyError:
            logger.warning(f"⚠️ Don't have device info for {self.presence.aaron_device_id}")
            # Need to query keys first
            await self.matrix_client.keys_query()
        
        if device:
            session = self.matrix_client.olm.session_store.get(device.curve25519)
            if not session:
                logger.info(f"🔑 Creating Olm session with Aaron's device...")
                await self.matrix_client.keys_claim({config.aaron_user_id: [self.presence.aaron_device_id]})
    
    # Now send the to-device message
    response = await self.matrix_client.to_device(
        "m.rtc.encryption_key",  # or "org.matrix.msc4143.rtc.encryption_key" for unstable
        messages
    )
    logger.info(f"📤 Sent MatrixRTC encryption key: {response}")
```

#### Step 2.2: Properly Handle Received Keys

```python
async def _on_to_device_event(self, event):
    """Handle to-device events including encryption keys."""
    
    event_type = event.source.get("type", "")
    content = event.source.get("content", {})
    sender = event.source.get("sender", "")
    
    # MSC4143 MatrixRTC encryption key
    if event_type in ["m.rtc.encryption_key", "io.element.call.encryption_keys"]:
        logger.info(f"🔐 Received MatrixRTC key from {sender}")
        
        # Verify sender matches expected (Aaron)
        if sender != config.aaron_user_id:
            logger.warning(f"⚠️ Ignoring key from unexpected sender: {sender}")
            return
        
        # Extract key (handle different formats)
        media_key = content.get("media_key", {})
        key_b64 = media_key.get("key") or content.get("key")
        key_index = media_key.get("index", 0)
        member_id = content.get("member_id", "unknown")
        
        if key_b64:
            self.presence.aaron_e2ee_key = base64.b64decode(key_b64)
            logger.info(f"✅ Stored Aaron's key: index={key_index}, member={member_id}")
            
            # If we're already in a call, update the encryption
            if self.livekit_room and self.in_call:
                await self._update_e2ee_key(self.presence.aaron_e2ee_key)
```

### Phase 3: Server Configuration Fixes

#### Step 3.1: Verify Synapse E2EE Settings

Current Synapse config shows:
```yaml
experimental_features:
  msc3401_enabled: true  # MatrixRTC ✓
  msc4140_enabled: true  # Delayed events ✓
```

**Missing/Recommended settings:**
```yaml
# Add to homeserver.yaml if not present:
experimental_features:
  msc3401_enabled: true
  msc4140_enabled: true
  # For MSC4143 (MatrixRTC encryption)
  msc4143_enabled: true  # May need to check if supported
  
# E2EE room defaults (optional)
encryption_enabled_by_default_for_room_type: invite  # or 'all'
```

### Phase 4: Testing Strategy

#### Test 1: Verify Keys Are Being Uploaded

```python
# In Sophie startup:
logger.info(f"📊 Crypto status:")
logger.info(f"   Account shared: {self.matrix_client.olm.account.shared}")
logger.info(f"   Device keys uploaded: {self.matrix_client.olm.uploaded_key_count}")
logger.info(f"   Known devices: {len(list(self.matrix_client.olm.device_store))}")
```

#### Test 2: Verify Keys Query Worked

```python
# After keys_query:
device_store = self.matrix_client.olm.device_store
aaron_devices = list(device_store.active_user_devices(config.aaron_user_id))
logger.info(f"📱 Aaron's devices: {[d.device_id for d in aaron_devices]}")
for d in aaron_devices:
    logger.info(f"   {d.device_id}: verified={d.verified}, curve25519={d.curve25519[:20]}...")
```

#### Test 3: Verify Olm Sessions Exist

```python
session_store = self.matrix_client.olm.session_store
for device in aaron_devices:
    session = session_store.get(device.curve25519)
    if session:
        logger.info(f"✅ Have Olm session with {device.device_id}")
    else:
        logger.warning(f"❌ NO Olm session with {device.device_id}")
```

#### Test 4: Verify Megolm Sessions

```python
inbound_store = self.matrix_client.olm.inbound_group_store
room_sessions = list(inbound_store.get_all(config.matrix_room_id))
logger.info(f"🔐 Megolm sessions for room: {len(room_sessions)}")
```

---

## Implementation Priority Order

1. **IMMEDIATE:** Fix crypto store device_id mismatch
2. **IMMEDIATE:** Add proper `keys_query` and `keys_claim` on startup
3. **HIGH:** Implement auto-verification of Aaron's devices
4. **HIGH:** Use `ignore_unverified_devices=True` as fallback
5. **MEDIUM:** Implement proper MSC4143 key exchange for voice
6. **MEDIUM:** Add comprehensive crypto logging

## Code Changes Summary

### File: `/home/ubuntu/clawd/projects/element-secretary/sophie_voice_full.py`

```python
# Add imports
from nio import (
    AsyncClient,
    AsyncClientConfig,
    LoginResponse,
    RoomGetStateResponse,
    KeysQueryResponse,
    KeysClaimResponse,
)

# Add crypto initialization method
async def _initialize_crypto(self):
    """Full crypto initialization on startup."""
    
    # 1. Upload our device keys
    if self.matrix_client.should_upload_keys:
        logger.info("📤 Uploading device keys...")
        await self.matrix_client.keys_upload()
    
    # 2. Query keys for room members  
    room = self.matrix_client.rooms.get(config.matrix_room_id)
    if room:
        logger.info("🔑 Querying device keys...")
        await self.matrix_client.keys_query()
    
    # 3. Claim one-time keys for missing sessions
    missing = self.matrix_client.get_missing_sessions(config.matrix_room_id)
    if missing:
        logger.info(f"🔑 Claiming keys for {sum(len(v) for v in missing.values())} devices")
        await self.matrix_client.keys_claim(missing)
    
    # 4. Auto-verify Aaron's devices (CRITICAL)
    await self._auto_verify_aaron_devices()
    
    # 5. Log status
    await self._log_crypto_status()

async def _auto_verify_aaron_devices(self):
    """Auto-trust Aaron's devices since we control the server."""
    if not hasattr(self.matrix_client, 'olm') or not self.matrix_client.olm:
        return
        
    device_store = self.matrix_client.olm.device_store
    for device in device_store.active_user_devices(config.aaron_user_id):
        if not self.matrix_client.olm.is_device_verified(device):
            logger.info(f"✅ Auto-verifying: {device.device_id}")
            self.matrix_client.verify_device(device)

async def _log_crypto_status(self):
    """Log comprehensive crypto status."""
    if not hasattr(self.matrix_client, 'olm') or not self.matrix_client.olm:
        logger.warning("⚠️ Olm not initialized!")
        return
    
    olm = self.matrix_client.olm
    logger.info("📊 Crypto Status:")
    logger.info(f"   Account shared: {olm.account.shared}")
    logger.info(f"   Device ID: {self.device_id}")
    logger.info(f"   Keys uploaded: {olm.uploaded_key_count}")
    
    # Device store
    all_devices = list(olm.device_store)
    logger.info(f"   Known devices: {len(all_devices)}")
    
    # Aaron's devices specifically
    aaron_devices = list(olm.device_store.active_user_devices(config.aaron_user_id))
    logger.info(f"   Aaron's devices: {len(aaron_devices)}")
    for d in aaron_devices:
        verified = olm.is_device_verified(d)
        has_session = olm.session_store.get(d.curve25519) is not None
        logger.info(f"     {d.device_id}: verified={verified}, session={has_session}")
    
    # Megolm sessions
    sessions = list(olm.inbound_group_store)
    logger.info(f"   Megolm sessions: {len(sessions)}")

# Call in start() after login/restore:
async def start(self) -> bool:
    # ... existing login code ...
    
    # After sync:
    await self._initialize_crypto()
    
    return True
```

---

## Verification Checklist

- [ ] Sophie's device_id is consistent between session.json and crypto store
- [ ] Device keys are uploaded (`should_upload_keys == False` after startup)
- [ ] Aaron's devices are in Sophie's device store
- [ ] Olm sessions exist with Aaron's devices  
- [ ] Aaron's devices are marked as verified
- [ ] Megolm sessions are being received and stored
- [ ] MatrixRTC keys are exchanged via encrypted to-device
- [ ] Audio decryption works in LiveKit

---

## References

- **MSC4143 (MatrixRTC):** https://github.com/matrix-org/matrix-spec-proposals/pull/4143
- **matrix-nio crypto:** `/home/ubuntu/clawd/.venv-matrix/lib/python3.14/site-packages/nio/crypto/`
- **Sophie code:** `/home/ubuntu/clawd/projects/element-secretary/sophie_voice_full.py`
- **Synapse config:** `docker exec matrix-synapse cat /data/homeserver.yaml`

## Next Steps

1. Implement Phase 1 changes (crypto initialization)
2. Test with `python sophie_voice_full.py` and check logs
3. Have Aaron send a test message and verify Sophie can decrypt
4. Test voice call with E2EE enabled

---

## Progress Log

### 2026-03-03 00:30 EST - Research Phase Complete

**Research conducted:**

1. **Examined Sophie's current code** (`sophie_voice_full.py`)
   - Found: Code attempts E2EE but has gaps
   - Found: Uses `SqliteStore` for crypto
   - Found: Has to-device callback for encryption keys
   - Issue: No `keys_query()` or `keys_claim()` calls on startup

2. **Analyzed matrix-nio crypto implementation**
   - Read: `olm_machine.py` - Core E2EE logic (2000+ lines)
   - Read: `sessions.py` - Olm/Megolm session classes
   - Read: `device.py` - Device trust states
   - Key insight: `share_group_session()` requires verified devices OR `ignore_unverified_devices=True`

3. **Researched MSC4143 (MatrixRTC)**
   - Found full spec in PR #4143
   - Key points:
     - Each participant generates 256-bit sender key
     - Keys shared via encrypted `m.rtc.encryption_key` to-device
     - Uses SFrame for WebRTC media encryption
     - SEPARATE from room Megolm encryption

4. **Checked Synapse server config**
   - `msc3401_enabled: true` ✓ (MatrixRTC base)
   - `msc4140_enabled: true` ✓ (Delayed events)
   - No explicit MSC4143 flag found

5. **Inspected Sophie's crypto store**
   ```
   sqlite3 sophie_matrix "SELECT COUNT(*) FROM megolminboundsessions"
   → 0  (ZERO Megolm sessions!)
   
   sqlite3 sophie_matrix "SELECT * FROM devicekeys"
   → (empty - no device keys!)
   
   sqlite3 sophie_matrix "SELECT * FROM olmsessions"
   → (empty - no Olm sessions!)
   ```

**Root cause confirmed:**
- Sophie's crypto store is essentially empty
- She has never received keys from anyone
- Aaron's client won't share keys with unverified device
- The whole E2EE chain is broken from the start

**Deliverable created:**
- Comprehensive implementation plan with 4 phases
- Exact code changes needed
- Testing strategy
- Verification checklist

### 2026-03-03 16:15 EST - Implementation Phase Complete

**Implemented all required Matrix E2EE fixes in `sophie_voice_full.py`:**

1. ✅ **Added missing imports**: `KeysQueryResponse`, `KeysClaimResponse` from nio
2. ✅ **Added `_initialize_crypto()` method** that:
   - Uploads device keys if needed (`keys_upload()`)
   - Queries room member keys (`keys_query()`) for all room users
   - Claims one-time keys for missing sessions (`keys_claim()`)
   - Calls auto-verification and logging
3. ✅ **Added `_auto_verify_aaron_devices()` method** that:
   - Finds all Aaron's devices from device store
   - Auto-verifies any unverified devices using `verify_device()`
   - Logs verification status
4. ✅ **Added `_log_crypto_status()` method** that:
   - Logs account shared status, device ID, key upload status
   - Shows all known devices and Aaron's devices specifically
   - Displays Olm session status for each Aaron device
   - Shows Megolm session count for room message decryption
5. ✅ **Integrated `_initialize_crypto()` call** in `start()` method after sync

**Code changes preserve existing functionality** and only add the E2EE initialization logic.

**Config verification**: `config.aaron_user_id` is already defined as `@aaron:matrix3.aaroncollins.info`

### Next Steps: Testing and Validation

1. Test Sophie startup and check logs for crypto initialization
2. Verify Aaron's devices are auto-verified
3. Test encrypted message decryption
4. Test MatrixRTC voice E2EE

### Implementation Complete - Ready for Testing

---

## 2026-03-03 13:35-13:50 EST - MSC4143 Key Interception Fix (Sophie Main Session)

### Problem Discovered

After Sophie Bot's E2EE fixes, voice calls still had:
- Audio degrading to all zeros after first few frames
- "Aaron's call.member has no encryption_keys" warnings
- Logs showed: `Received unsupported Olm event of type io.element.call.encryption_keys`

### Root Cause: matrix-nio Drops MSC4143 Events

Matrix-nio's `_handle_olm_event()` in `olm_machine.py` only handles:
- `m.room_key`
- `m.forwarded_room_key`  
- `m.dummy`

For `io.element.call.encryption_keys` (MSC4143), it logs "unsupported" and returns `None`, meaning our callback never sees the keys!

### Fix Applied: Monkey-Patch matrix-nio

**File:** `/home/ubuntu/clawd/projects/element-secretary/sophie_voice_full.py`

Added after nio imports (lines 50-90):

```python
# Custom event class for MatrixRTC encryption keys
class MatrixRTCEncryptionKeysEvent(Event):
    """MSC4143 MatrixRTC encryption key event"""
    def __init__(self, sender: str, sender_key: str, payload: dict):
        self.sender = sender
        self.sender_key = sender_key
        self.type = payload.get("type", "io.element.call.encryption_keys")
        self.content = payload.get("content", {})
        self.keys = self.content.get("keys", [])

def _patched_handle_olm_event(original_func):
    """Wrapper to intercept MSC4143 encryption key events before nio drops them"""
    def wrapper(self, sender: str, sender_key: str, payload: dict):
        event_type = payload.get("type", "")
        if event_type in ("io.element.call.encryption_keys", "m.rtc.encryption_key"):
            return MatrixRTCEncryptionKeysEvent(sender, sender_key, payload)
        return original_func(self, sender, sender_key, payload)
    return wrapper

# Apply the patch
from nio.crypto import Olm
Olm._handle_olm_event = _patched_handle_olm_event(Olm._handle_olm_event)
```

### Key Format Discovery

Element X sends keys in **dict format**, not array:
```json
{
  "keys": {
    "index": 2,
    "key": "Ov7kAU6m+QjSVOzUtEwWaA=="
  },
  "member": {
    "claimed_device_id": "FMIMPTCEAL"
  },
  "room_id": "!iCDid0eGkre_...",
  "session": {
    "application": "m.call",
    "call_id": "",
    "scope": "m.room"
  }
}
```

Updated `_on_to_device_event()` to handle dict format:
```python
if isinstance(event.keys, dict):
    key_b64 = event.keys.get("key")
    key_index = event.keys.get("index", 0)
```

### Current Status

- ✅ Monkey-patch intercepts MSC4143 events (confirmed in logs)
- ✅ Key format identified (dict with "key" and "index")
- ✅ Extraction code fixed for dict format
- ⏳ **Awaiting test** to confirm key is stored and audio decrypts

### Verification Commands

```bash
# Check if keys are being intercepted
sudo journalctl -u sophie-voice -n 50 | grep -E "INTERCEPT|Stored|MSC4143"

# Check audio quality
sudo journalctl -u sophie-voice -n 50 | grep "Audio frames"

# Full recent logs
sudo journalctl -u sophie-voice --since "5 min ago" --no-pager
```

### What Should Happen After Fix

1. `🔑 INTERCEPTED MSC4143 encryption keys from @aaron`
2. `🔑 Processing MSC4143 encryption keys from @aaron`
3. `   Found dict format: index=N`
4. `✅ Stored Aaron's MatrixRTC E2EE key from intercepted event!`
5. `   Index: N, Size: 16 bytes`
6. Audio frames should have non-zero amplitude

### 2026-03-03 13:46-13:50 EST - E2EE Key Application Fix

**Problem:** Key was being stored but NOT applied to LiveKit!

```python
# BUG: e2ee_options created but never passed to connect()
e2ee_options = rtc.E2EEOptions(...)  # Created
await room.connect(options=rtc.RoomOptions(auto_subscribe=True))  # NOT passed!
```

**Fixes Applied:**

1. **Pass e2ee_options to connect():**
```python
room_options = rtc.RoomOptions(
    auto_subscribe=True,
    e2ee=e2ee_options,  # Now passed!
)
await room.connect(url, token, options=room_options)
```

2. **Dynamic key update when received via to-device:**
```python
# When key arrives after connection:
if self.livekit_room and self.in_call:
    e2ee_mgr = self.livekit_room.e2ee_manager
    e2ee_mgr.key_provider.set_shared_key(key, key_index)
```

**LiveKit E2EE API discovered:**
- `Room.e2ee_manager` - E2EE management
- `E2EEManager.key_provider` - Key provider access
- `KeyProvider.set_shared_key(key, index)` - Dynamic key update

### If Still Failing

Possible remaining issues:
1. **Key timing** - Key may arrive before Room is fully initialized
2. **Key format** - LiveKit may expect different key format than Matrix provides
3. **SFrame vs other** - Verify LiveKit is using SFrame encryption
4. **Key index mismatch** - Element X sends index=4, we may need index=0

---

## 2026-03-03 14:00+ EST - E2EE Incompatibility Discovery (Sophie Main Session)

### Key Finding: LiveKit E2EE vs Element X SFrame are INCOMPATIBLE

**LiveKit built-in E2EE:**
- Uses AES-128-GCM or AES-256-GCM encryption
- Key derivation with ratchet_salt (e.g., `b"LKFrameEncryptionKey"`)
- `encryption_type=1` (GCM)

**Element X MatrixRTC E2EE (MSC4143):**
- Uses **SFrame** encryption for WebRTC media
- Different key format and derivation
- Keys shared via encrypted to-device messages

**The Problem:**
Using LiveKit's built-in E2EE with Element X's key does NOT work because:
1. Different encryption algorithms (GCM vs SFrame)
2. Different key derivation
3. Different framing formats

### Fixes Applied So Far

1. ✅ **Key persistence fix:** Don't reset `aaron_e2ee_key = None` when call.member lacks keys
   (The key arrives via to-device, not call.member state)

2. ✅ **Wait loop for key:** Added 10s wait for encryption key before connecting to LiveKit
   (Key now arrives and is detected: `[current: True]`)

3. ✅ **Deprecated API fix:** Use `encryption=` instead of `e2ee=` in RoomOptions

4. 🔄 **TESTING: Disabled LiveKit E2EE** to see if audio works without it
   - If audio works: confirms encryption mismatch was the issue
   - If still zeros: Element X encrypts audio with SFrame at WebRTC layer

### Current Status

**Waiting for test:** Aaron needs to call Sophie to verify if disabling LiveKit E2EE allows audio to work.

### Next Steps Based on Test Results

**If audio works without LiveKit E2EE:**
- Element X may be falling back to unencrypted audio when Sophie doesn't publish encryption_keys
- Solution: Don't use LiveKit E2EE, let Element X handle encryption at the Matrix layer

**If audio is still zeros:**
- Element X IS encrypting audio with SFrame
- Options:
  1. Implement SFrame decryption in Sophie (complex)
  2. Configure Element X to disable call E2EE (if possible)
  3. Find a common encryption scheme both can use

### Technical Details: SFrame vs LiveKit E2EE

**SFrame (MSC4143):**
- Used by Element X for MatrixRTC media encryption
- Per-sender keys (each participant has their own key)
- Key index for ratcheting/rotation
- Encryption happens in the WebRTC pipeline

**LiveKit E2EE:**
- Uses shared symmetric keys
- GCM encryption mode
- Built into LiveKit SDK
- Different from SFrame
