#!/usr/bin/env python3
"""
Matrix Voice Chat Testing Script
Tests connectivity and functionality of the Matrix/LiveKit setup.
"""

import asyncio
import json
import sys
import aiohttp
from nio import AsyncClient, LoginResponse, RoomMessageText

# Configuration
HOMESERVER = "https://matrix3.aaroncollins.info"
USER_ID = "@testbot:matrix3.aaroncollins.info"
PASSWORD = "testbot123"
TEST_ROOM = "!7tIURiTxHg2V1hFKdWtw1yIjNiNP6IyImXXbaew2hcE"  # Test Room (created by testbot)

async def test_homeserver_reachable():
    """Test 1: Check if homeserver is reachable"""
    print("Test 1: Homeserver reachability...")
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{HOMESERVER}/_matrix/client/versions") as resp:
                if resp.status == 200:
                    data = await resp.json()
                    print(f"  ✅ Homeserver reachable, versions: {data.get('versions', [])[:3]}...")
                    return True
                else:
                    print(f"  ❌ Homeserver returned {resp.status}")
                    return False
    except Exception as e:
        print(f"  ❌ Failed to reach homeserver: {e}")
        return False

async def test_well_known():
    """Test 2: Check .well-known configuration"""
    print("Test 2: .well-known configuration...")
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{HOMESERVER}/.well-known/matrix/client") as resp:
                if resp.status == 200:
                    data = await resp.json()
                    has_livekit = "org.matrix.msc3401.call.focus" in data or "org.matrix.msc4143.rtc_foci" in data
                    if has_livekit:
                        focus = data.get("org.matrix.msc3401.call.focus", data.get("org.matrix.msc4143.rtc_foci", []))
                        print(f"  ✅ LiveKit focus configured: {focus}")
                        return True
                    else:
                        print(f"  ⚠️ No LiveKit focus in .well-known")
                        return False
                else:
                    print(f"  ❌ .well-known returned {resp.status}")
                    return False
    except Exception as e:
        print(f"  ❌ Failed to get .well-known: {e}")
        return False

async def test_livekit_endpoint():
    """Test 3: Check LiveKit WebSocket endpoint"""
    print("Test 3: LiveKit WebSocket endpoint...")
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get("https://livekit3.aaroncollins.info/") as resp:
                if resp.status == 200:
                    print(f"  ✅ LiveKit endpoint reachable (HTTP {resp.status})")
                    return True
                else:
                    print(f"  ❌ LiveKit endpoint returned {resp.status}")
                    return False
    except Exception as e:
        print(f"  ❌ Failed to reach LiveKit: {e}")
        return False

async def test_jwt_service():
    """Test 4: Check JWT service"""
    print("Test 4: JWT service...")
    try:
        async with aiohttp.ClientSession() as session:
            # POST to /sfu/get should work (even if we don't have valid auth)
            async with session.post(
                f"{HOMESERVER}/livekit-jwt-service/sfu/get",
                json={"room": "test", "openid_token": "invalid"}
            ) as resp:
                # 400/401/403 is expected without valid token, but not 404/500
                if resp.status in [200, 400, 401, 403]:
                    print(f"  ✅ JWT service responding (HTTP {resp.status} - expected without valid token)")
                    return True
                else:
                    print(f"  ⚠️ JWT service returned unexpected {resp.status}")
                    return False
    except Exception as e:
        print(f"  ❌ Failed to reach JWT service: {e}")
        return False

async def test_matrix_login():
    """Test 5: Test Matrix login"""
    print("Test 5: Matrix login...")
    client = AsyncClient(HOMESERVER, USER_ID)
    try:
        response = await client.login(PASSWORD)
        if isinstance(response, LoginResponse):
            print(f"  ✅ Login successful as {response.user_id}")
            await client.close()
            return True, client.access_token
        else:
            print(f"  ❌ Login failed: {response}")
            await client.close()
            return False, None
    except Exception as e:
        print(f"  ❌ Login error: {e}")
        await client.close()
        return False, None

async def test_room_access(access_token):
    """Test 6: Test room access"""
    print("Test 6: Room access...")
    client = AsyncClient(HOMESERVER, USER_ID)
    client.access_token = access_token
    client.user_id = USER_ID
    
    try:
        # Try to join the room
        response = await client.join(TEST_ROOM)
        if hasattr(response, 'room_id'):
            print(f"  ✅ Joined room {response.room_id}")
            await client.close()
            return True
        else:
            print(f"  ⚠️ Could not join room: {response}")
            await client.close()
            return False
    except Exception as e:
        print(f"  ❌ Room access error: {e}")
        await client.close()
        return False

async def test_send_message(access_token):
    """Test 7: Test sending a message"""
    print("Test 7: Send message...")
    client = AsyncClient(HOMESERVER, USER_ID)
    client.access_token = access_token
    client.user_id = USER_ID
    
    try:
        response = await client.room_send(
            TEST_ROOM,
            message_type="m.room.message",
            content={
                "msgtype": "m.text",
                "body": "🤖 Automated test message from Sophie's test script"
            }
        )
        if hasattr(response, 'event_id'):
            print(f"  ✅ Message sent: {response.event_id}")
            await client.close()
            return True
        else:
            print(f"  ❌ Failed to send message: {response}")
            await client.close()
            return False
    except Exception as e:
        print(f"  ❌ Send message error: {e}")
        await client.close()
        return False

async def main():
    print("=" * 60)
    print("Matrix Voice Chat - Automated Test Suite")
    print("=" * 60)
    print()
    
    results = {}
    
    # Run infrastructure tests
    results['homeserver'] = await test_homeserver_reachable()
    results['well_known'] = await test_well_known()
    results['livekit'] = await test_livekit_endpoint()
    results['jwt_service'] = await test_jwt_service()
    
    # Run Matrix client tests
    login_success, access_token = await test_matrix_login()
    results['login'] = login_success
    
    if access_token:
        results['room_access'] = await test_room_access(access_token)
        results['send_message'] = await test_send_message(access_token)
    else:
        results['room_access'] = False
        results['send_message'] = False
    
    # Summary
    print()
    print("=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {test}: {status}")
    
    print()
    print(f"Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️ Some tests failed - check logs above")
        return 1

if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
