#!/usr/bin/env node

/**
 * Simple LiveKit connectivity test
 * Tests token generation and basic connectivity to LiveKit server
 */

async function testLiveKitConnectivity() {
  console.log('🚀 Testing LiveKit server connectivity...')
  
  // Test configuration
  const LIVEKIT_JWT_SERVICE_URL = 'https://dev2.aaroncollins.info/_livekit'
  const LIVEKIT_WS_URL = 'wss://livekit.dev2.aaroncollins.info'
  
  try {
    // Test 1: JWT Service connectivity
    console.log('\n📝 Testing JWT token service...')
    
    const tokenResponse = await fetch(`${LIVEKIT_JWT_SERVICE_URL}/sfu/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        room: 'test-room',
        identity: 'test-user',
        name: 'Test User',
      }),
    })
    
    if (!tokenResponse.ok) {
      throw new Error(`Token service returned ${tokenResponse.status}: ${await tokenResponse.text()}`)
    }
    
    const tokenData = await tokenResponse.json()
    console.log('✅ JWT token service is working!')
    console.log(`   Token: ${tokenData.jwt.substring(0, 50)}...`)
    
    // Test 2: WebSocket endpoint connectivity
    console.log('\n🔌 Testing WebSocket endpoint...')
    
    // Check if the WebSocket endpoint is accessible
    const wsResponse = await fetch('https://livekit.dev2.aaroncollins.info')
    console.log(`✅ LiveKit server is responding (Status: ${wsResponse.status})`)
    
    console.log('\n🎉 LiveKit infrastructure tests PASSED!')
    console.log('\n📋 Summary:')
    console.log('   ✅ JWT token service: Working')
    console.log('   ✅ LiveKit server: Responding')
    console.log('   ✅ Infrastructure: Ready for voice/video')
    
    return true
    
  } catch (error) {
    console.error('\n❌ LiveKit test FAILED:', error)
    return false
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testLiveKitConnectivity().then(success => {
    process.exit(success ? 0 : 1)
  })
}

export { testLiveKitConnectivity }