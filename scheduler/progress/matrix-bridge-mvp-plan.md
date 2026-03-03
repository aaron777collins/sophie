# Matrix Bridge MVP - Sophie Voice Bot Encryption Issues

**Created:** 2026-03-02
**Updated:** 2026-03-02 20:55 EST
**Status:** DIAGNOSED - Two separate E2EE issues found
**Project:** `/home/ubuntu/clawd/projects/element-secretary/`

---

## 🔴 THE ACTUAL PROBLEM

Looking at `/home/ubuntu/clawd/projects/element-secretary/sophie-voice.log`:

```
WARNING:nio.crypto.log:Received a undecryptable Megolm event from a unknown device: @aaron:matrix3.aaroncollins.info FMIMPTCEAL
WARNING:nio.crypto.log:Error decrypting megolm event, no session found with session id hxtyF0hD7RTvRuHVXCCwQK+LvewhBP9i6MiCcQxPF+Y
```

**Sophie CANNOT decrypt Aaron's messages because:**
1. Aaron's device (FMIMPTCEAL) is "unknown" to Sophie
2. No Megolm session keys exist to decrypt the messages
3. Sophie creates a NEW device ID every restart (WPBSPSQMCR, IIPYGMTAKY, etc.)

---

## 🔑 TWO SEPARATE E2EE ISSUES

### Issue 1: Room E2EE (Megolm/Olm) - Text Messages

**Problem:** Sophie can't read Aaron's encrypted text messages in rooms.

**Root Cause:**
- Sophie creates a **new device ID on every startup**
- Aaron's client never shares Megolm session keys with Sophie's new device
- Result: "no session found" errors

**Fix Required:**
1. **Persist device credentials** - Save device_id and crypto store between restarts
2. **Request keys from Aaron** - Call `client.request_room_keys()` or wait for key sharing
3. **Verify devices** - Aaron needs to verify Sophie's device so keys get shared

### Issue 2: MatrixRTC E2EE (SFrame) - Voice/Audio

**Problem:** Sophie can't decrypt Aaron's voice audio in calls.

**Root Cause (per MSC4143 research):**
- MatrixRTC uses `m.rtc.encryption_key` **to-device messages** for key exchange
- Keys are NOT in `m.rtc.member` state events (Element X does this correctly)
- Sophie may be expecting keys in the wrong place

**Fix Required:**
1. Listen for `m.rtc.encryption_key` to-device messages
2. Send encryption keys to ALL participants via encrypted to-device messages
3. Use SFrame with received keys for media decryption

---

## 📋 MSC4143 MatrixRTC E2EE Key Exchange

### How Element X Exchanges Keys (Authoritative)

**Keys are distributed via encrypted to-device messages:**

```json
{
  "type": "m.rtc.encryption_key",
  "content": {
    "room_id": "!roomId:matrix.org",
    "member_id": "DEVICEID_uuid",
    "media_key": {
      "index": 0,
      "key": "base64encodedkey"
    },
    "version": "0"
  }
}
```

**Flow:**
1. Participant joins call → publishes `m.rtc.member` state event
2. Generates 256-bit random key
3. Sends `m.rtc.encryption_key` to-device message to ALL other participants
4. Receives keys from others via to-device messages
5. Uses keys with SFrame to encrypt/decrypt media

**Key Rotation:**
- New key on participant join/leave
- 5 second grace period before switching

---

## ✅ FIXES NEEDED IN `sophie_voice_full.py`

### Fix 1: Persist Device Credentials

```python
# Instead of creating new device each time:
SESSION_FILE = "data/matrix_session.json"

async def restore_or_create_session():
    if os.path.exists(SESSION_FILE):
        with open(SESSION_FILE, 'r') as f:
            session = json.load(f)
        client = AsyncClient(
            homeserver=session['homeserver'],
            user=session['user_id'],
            device_id=session['device_id'],  # REUSE device
            store_path="data/crypto_store"   # PERSIST crypto store
        )
        client.restore_login(
            user_id=session['user_id'],
            device_id=session['device_id'],
            access_token=session['access_token']
        )
    else:
        # First time login
        client = AsyncClient(...)
        resp = await client.login(password=...)
        save_session(resp)
    return client
```

### Fix 2: Handle to-device Key Messages

```python
# Register to-device handler
@client.on_to_device_event(m.rtc.encryption_key)
async def on_rtc_key(event):
    content = event.content
    member_id = content['member_id']
    key = base64.b64decode(content['media_key']['key'])
    key_index = content['media_key']['index']
    
    # Store key for SFrame decryption
    store_participant_key(member_id, key, key_index)
```

### Fix 3: Send Keys to All Participants

```python
async def send_encryption_keys(room_id, my_member_id, key, key_index):
    # Get all participants from m.rtc.member state events
    members = await get_call_members(room_id)
    
    for member in members:
        if member.user_id != my_user_id:
            await client.to_device(
                "m.rtc.encryption_key",
                {
                    member.user_id: {
                        member.device_id: {
                            "room_id": room_id,
                            "member_id": my_member_id,
                            "media_key": {
                                "index": key_index,
                                "key": base64.b64encode(key).decode()
                            },
                            "version": "0"
                        }
                    }
                },
                encrypted=True  # IMPORTANT: Use Olm encryption
            )
```

---

## 📊 Sub-Agent Research Summary

| Agent | Time | Finding |
|-------|------|---------|
| **element-send-research-1** | 142s | Element sends `{"msgtype":"m.text","body":"..."}` via PUT |
| **matrix-sdk-research** | 118s | SDK uses `client.sendEvent()`, simple txnId counter |
| **matrix-spec-research** | 115s | v3 API, auth via Bearer token |
| **element-e2ee-researcher** | ~5min | MSC4143: Keys via to-device, NOT state events |

---

## 🔄 Immediate Action Items

1. [x] **Fix device persistence** - DONE: Using consistent SOPHIEVOICE01 device ID
2. [x] **Add crypto store persistence** - DONE: Using existing matrix_store/sophie_matrix
3. [x] **Implement to-device key handler** - DONE: Enhanced handler for m.rtc.encryption_key
4. [x] **Send keys to participants** - DONE: Sends MSC4143 format to Aaron's device
5. [ ] **Test with Element X** - NEEDS TESTING: Aaron should verify Sophie's device

## ✅ FIXES APPLIED (2026-03-02 23:18 EST)

1. **Fixed crypto store path** - Was pointing to new empty `crypto_store/`, now using existing `matrix_store/`
2. **Fixed store name** - Using `sophie_matrix` to match existing DB file
3. **Fixed device ID persistence** - Consistent `SOPHIEVOICE01` device ID
4. **Enhanced to-device handler** - Now logs all key-related events
5. **Improved key sending** - Properly formatted MSC4143 key exchange

**Result:** No more "Creating new Olm account" or "undecryptable Megolm event" errors!

**Next step:** Aaron needs to verify Sophie's device (SOPHIEVOICE01) in Element X settings to enable key sharing.

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `/home/ubuntu/clawd/projects/element-secretary/sophie_voice_full.py` | Main voice bot |
| `/home/ubuntu/clawd/projects/element-secretary/matrix_e2ee_voice.py` | E2EE voice handling |
| `/home/ubuntu/clawd/projects/element-secretary/sophie-voice.log` | Current logs |
| `/home/ubuntu/clawd/matrix_message_sending_research.md` | Text message spec |

---

## 📚 References

- **MSC4143 (MatrixRTC):** https://github.com/matrix-org/matrix-spec-proposals/pull/4143
- **MSC3401 (Legacy):** https://github.com/matrix-org/matrix-spec-proposals/pull/3401  
- **matrix-nio Docs:** https://matrix-nio.readthedocs.io/
- **Element Web Source:** https://github.com/element-hq/element-web
- **Matrix JS SDK:** https://github.com/matrix-org/matrix-js-sdk

---

*Research conducted 2026-03-02 by 3 parallel sub-agents + E2EE specialist*
