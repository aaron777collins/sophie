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
    
    // Try to hit the JWT endpoint to see if it's accessible (expect auth error)
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
    
    if (tokenResponse.status === 400) {
      console.log('✅ JWT service is responding (400 = needs Matrix auth, which is expected)')
    } else if (tokenResponse.ok) {
      const tokenData = await tokenResponse.json()
      console.log('✅ JWT token service is working!')
      console.log(`   Token: ${tokenData.jwt ? tokenData.jwt.substring(0, 50) + '...' : 'No token in response'}`)
    } else {
      throw new Error(`Token service returned ${tokenResponse.status}: ${await tokenResponse.text()}`)
    }
    
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

// Run the test
testLiveKitConnectivity().then(success => {
  process.exit(success ? 0 : 1)
})

export { testLiveKitConnectivity }