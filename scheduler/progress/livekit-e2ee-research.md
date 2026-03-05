# LiveKit E2EE Implementation Research for Matrix/Element Integration

*Research completed: 2026-03-03*

## Executive Summary

This research documents LiveKit's End-to-End Encryption (E2EE) implementation, specifically as used by Element Call for Matrix integration. Key findings show LiveKit uses a shared key approach with room-level encryption for both media tracks and data channels.

## 1. LiveKit Python SDK E2EE Implementation

### Key Findings from Python SDK

**Source**: `https://github.com/livekit/python-sdks/blob/main/examples/e2ee.py`

#### Basic Configuration
```python
# Shared key approach - must match across all clients
SHARED_KEY = b"livekitrocks"

# E2EE options configuration
e2ee_options = rtc.E2EEOptions()
e2ee_options.key_provider_options.shared_key = SHARED_KEY

# Connect with E2EE enabled
await room.connect(
    URL, TOKEN, 
    options=rtc.RoomOptions(auto_subscribe=True, e2ee=e2ee_options)
)
```

#### E2EE State Monitoring
```python
@room.on("e2ee_state_changed")
def on_e2ee_state_changed(participant: rtc.Participant, state: rtc.EncryptionState) -> None:
    logging.info("e2ee state changed: %s %s", participant.identity, state)
```

## 2. Element Call Implementation Analysis

### Dependencies and Versions
**Source**: `https://raw.githubusercontent.com/element-hq/element-call/livekit/package.json`

Element Call uses these LiveKit packages:
- `livekit-client`: ^2.13.0
- `@livekit/components-core`: ^0.12.0
- `@livekit/components-react`: ^2.0.0
- `@livekit/protocol`: ^1.42.2
- `@livekit/track-processors`: ^0.6.0 || ^0.7.1

### Matrix Integration
- Uses `matrix-js-sdk` from specific commit: `6e3efef0c5f660df47cf00874927dec1c75cc3cf`
- Implements MatrixRTC using LiveKit backend per MSC4195
- Has dedicated `e2ee` directory in source code (access restricted)

## 3. LiveKit E2EE Architecture Overview

**Source**: `https://docs.livekit.io/transport/encryption/`

### How E2EE Works in LiveKit

1. **Room-level encryption**: E2EE is enabled at the room level and automatically applied to all media tracks and data channels from all participants
2. **Client-side implementation**: Must be enabled within the LiveKit SDK for each participant
3. **Key distribution responsibility**: Users are responsible for securely generating, storing, and distributing encryption keys
4. **No server access**: Content remains fully encrypted from sender to receiver; LiveKit servers cannot access or modify the content

### Encryption Components

| Component | Description | Use Cases |
|-----------|-------------|-----------|
| **Media encryption** | Encrypts all audio and video tracks from all participants | Regulated industries, security-critical applications |
| **Data channel encryption** | Encrypts all text messages, byte streams, and data packets | Secure chat, private file sharing |

### Key Distribution Patterns

1. **Shared key approach**: Single key for the whole room (simplest implementation)
2. **Unique keys per participant**: Requires more sophisticated key distribution
3. **Key rotation**: During the lifetime of a single room (advanced use case)

## 4. Critical Implementation Details for Element/Matrix

### KeyProvider Configuration

Based on Python SDK example, the key configuration structure is:
```python
e2ee_options = rtc.E2EEOptions()
e2ee_options.key_provider_options.shared_key = SHARED_KEY
```

**Key Properties**:
- `shared_key`: The encryption key (bytes)
- Must be identical across all participants
- Typically generated server-side when room is created
- Distributed securely alongside access tokens

### Matrix-Specific Considerations

1. **MatrixRTC Backend Discovery**: Element Call uses MSC4143 for backend discovery via `.well-known/matrix/client`
2. **Backend Selection**: First participant defines which LiveKit backend to use via `foci_preferred` key
3. **Authorization Service**: Matrix-specific JWT authorization service handles LiveKit access tokens

### Data Channel Encryption

**Important Note**: LiveKit documentation indicates:
- Data channel encryption uses the `encryption` field for RoomOptions (newer approach)
- The `e2ee` field is deprecated and will be removed in next major version
- Signaling messages and API calls are NOT end-to-end encrypted (only TLS in transit)

## 5. Missing Information and Access Limitations

### Inaccessible Resources
1. **Element Call E2EE source code**: The `/src/e2ee/` directory exists but GitHub prevents direct access to files
2. **Test implementations**: `https://github.com/nicholasw-gc/matrix-lk-test` repository not found (404)
3. **Specific Element configuration**: Unable to access actual TypeScript implementation files

### Needed Research Areas
1. **Exact KeyProvider settings**: Need to see Element's actual implementation for:
   - `ratchet_salt` configuration
   - `encryption_type` settings
   - Key rotation mechanisms
2. **Matrix key derivation**: How Element derives LiveKit keys from Matrix encryption keys
3. **Key synchronization**: How Element handles key distribution across Matrix federation

## 6. Recommended Next Steps

### For Python Implementation with Matrix

1. **Start with shared key approach** based on Python SDK example
2. **Generate keys server-side** when creating Matrix RTC session
3. **Use Matrix's existing crypto infrastructure** for secure key distribution
4. **Monitor E2EE state changes** for debugging and user feedback

### Required Documentation Access

To complete this research, we need access to:
1. Element Call's actual E2EE implementation files (`/src/e2ee/` directory)
2. Element's LiveKit room configuration code
3. Matrix RTC authorization service implementation
4. Key derivation and distribution mechanisms

### Verification Approach

The exact Element Call settings can only be determined by:
1. Examining the actual Element Call source code implementation
2. Running Element Call with network monitoring to observe LiveKit configuration
3. Accessing Element's LiveKit integration documentation (if available)

## 7. Current Knowledge Gaps

**CRITICAL**: Without access to Element Call's actual implementation files, we cannot determine:
- The exact `ratchet_salt` configuration Element uses
- The specific `encryption_type` settings
- How Element handles key rotation
- How Matrix room encryption keys are mapped to LiveKit encryption keys
- The precise KeyProvider configuration parameters

## Conclusion

LiveKit provides robust E2EE capabilities using a shared key approach, but Element Call's specific implementation details remain inaccessible through public GitHub browsing. The research provides a solid foundation for understanding LiveKit E2EE architecture, but implementing Matrix/Element-compatible E2EE requires access to Element Call's actual source code or additional reverse engineering of their LiveKit configuration.