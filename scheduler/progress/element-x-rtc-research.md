# Element X MatrixRTC E2EE Implementation Research

**Research Date:** 2026-03-03  
**Repositories Examined:**
- https://github.com/element-hq/element-x-ios
- https://github.com/element-hq/element-x-android

## Executive Summary

Element X uses a **WebView-based calling architecture** that delegates most MatrixRTC E2EE functionality to the Element Call embedded web client. The native applications primarily handle UI integration, notifications, and lifecycle management, while encryption is handled at the web layer.

## Key Findings

### 1. Architecture Overview

**Element X Android:**
- Uses `element.call.embedded` library (version 0.17.0) from `io.element.android:element-call-embedded`
- Call functionality is implemented through WebView integration
- Native code handles notifications, foreground services, and UI chrome
- Core encryption logic is delegated to the embedded Element Call web application

**Element X iOS:**
- Similar WebView-based approach (structure suggests parallel implementation)
- Native Swift UI integration with underlying web-based calling

### 2. MatrixRTC E2EE Implementation Details

Based on code analysis, Element X appears to:

#### `io.element.call.encryption_keys` to-device messages:
- **Handled by:** Matrix Rust SDK (used by both platforms)
- **Location:** Not directly implemented in Element X native code
- **Processing:** Rust SDK handles Matrix protocol layer including to-device message reception and decryption
- **Bridge:** Messages are passed from Rust SDK to the embedded Element Call web component via JavaScript bridge

#### Audio Frame Encryption (SFrame):
- **Implementation:** Element Call web application (embedded via WebView)
- **Technology:** SFrame implementation in JavaScript/WebAssembly
- **Native Integration:** None visible in Element X repositories
- **Platform:** Runs within WebKit/Chrome WebView with access to WebRTC APIs

#### LiveKit SDK E2EE Settings:
- **Configuration:** Managed by Element Call web application
- **Settings:** Not directly configurable from native Element X code
- **Architecture:** Element Call web app configures LiveKit client with appropriate encryption settings

#### Key Format and Derivation:
- **Implementation:** Element Call web application
- **Storage:** Likely handled by Element Call's key management system
- **Format:** Standard SFrame key format (not exposed to native layer)

### 3. Code Evidence

#### Android Implementation:

**Build Dependencies:**
```kotlin
// features/call/impl/build.gradle.kts
implementation(libs.element.call.embedded)
```

**Key Files:**
- `features/call/impl/src/main/kotlin/io/element/android/features/call/impl/DefaultElementCallEntryPoint.kt`
- `features/call/impl/src/main/kotlin/io/element/android/features/call/impl/services/CallForegroundService.kt`
- `features/call/impl/src/main/kotlin/io/element/android/features/call/impl/data/WidgetMessage.kt`

**Widget Messaging Protocol:**
```kotlin
@Serializable
data class WidgetMessage(
    @SerialName("api") val direction: Direction,
    @SerialName("widgetId") val widgetId: String,
    @SerialName("requestId") val requestId: String,
    @SerialName("action") val action: Action,
    @SerialName("data") val data: JsonElement? = null,
)
```

**Dependency Definition:**
```toml
# gradle/libs.versions.toml
element_call_embedded = "io.element.android:element-call-embedded:0.17.0"
```

#### Matrix Rust SDK Integration:
```toml
matrix_sdk = "org.matrix.rustcomponents:sdk-android:26.03.1"
```

### 4. Encryption Flow (Inferred)

1. **Call Setup:**
   - Matrix Rust SDK handles room membership and signaling
   - Element Call web app is loaded in WebView
   - Native app passes room context to web component

2. **Key Exchange:**
   - Rust SDK receives `io.element.call.encryption_keys` to-device messages
   - Keys are passed to Element Call web component via JavaScript bridge
   - Element Call manages SFrame key derivation and distribution

3. **Media Encryption:**
   - WebView's WebRTC implementation handles media capture
   - Element Call applies SFrame encryption to audio/video frames
   - Encrypted frames are transmitted via LiveKit infrastructure

4. **Native Integration:**
   - Android: `CallForegroundService.kt` manages lifecycle
   - Communication via `WidgetMessage` protocol
   - Native UI handles call controls and status display

## Limitations of This Research

### Missing Implementation Details:

1. **SFrame Implementation Specifics:**
   - Actual encryption/decryption code is in Element Call web app (not examined)
   - Key derivation algorithms and formats not visible in Element X code
   - LiveKit E2EE configuration not exposed in native layer

2. **Key Management:**
   - Element Call's key storage and rotation mechanisms not accessible
   - Integration between Matrix to-device messages and SFrame keys not detailed
   - Cross-platform key synchronization approach unclear

3. **JavaScript Bridge Details:**
   - Specific API for passing encryption keys from native to web unclear
   - Security model for key transmission to WebView not analyzed
   - Element Call embedded library internals not examined

## Recommendations for Further Research

1. **Examine Element Call Web App:**
   - https://github.com/element-hq/element-call
   - Focus on SFrame implementation
   - LiveKit integration and E2EE configuration

2. **Matrix Rust SDK Investigation:**
   - https://github.com/matrix-org/matrix-rust-sdk
   - To-device message handling for `io.element.call.encryption_keys`
   - FFI layer for mobile integration

3. **Element Call Embedded Library:**
   - Source code for `io.element.android:element-call-embedded:0.17.0`
   - JavaScript bridge implementation
   - WebView security and key handling

## Conclusion

Element X implements MatrixRTC E2EE through a hybrid architecture where native apps provide UI and lifecycle management while delegating core cryptographic operations to a web-based Element Call component. The actual SFrame encryption, key derivation, and LiveKit E2EE configuration are handled by JavaScript code running in a WebView, making the implementation largely platform-agnostic but limiting direct access to encryption internals from native code.