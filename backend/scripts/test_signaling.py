"""Simulates two browser tabs for WebSocket signaling verification."""
import asyncio
import json

from websockets.asyncio.client import connect


async def recv_json(ws):
    raw = await ws.recv()
    return json.loads(raw)


async def main():
    uri_base = "ws://127.0.0.1:8000/ws/test-room"

    async with connect(f"{uri_base}?name=Alice") as alice:
        alice_self = await recv_json(alice)
        alice_existing = await recv_json(alice)
        assert alice_self["type"] == "self" and alice_self.get("peerId")
        assert alice_existing == {"type": "existing-peers", "peers": []}
        print("Alice:", alice_self, alice_existing)

        alice_id = alice_self["peerId"]

        async with connect(f"{uri_base}?name=Bob") as bob:
            bob_self = await recv_json(bob)
            bob_existing = await recv_json(bob)
            assert bob_self["type"] == "self"
            assert bob_existing["type"] == "existing-peers"
            assert len(bob_existing["peers"]) == 1
            assert bob_existing["peers"][0]["peerId"] == alice_id
            assert bob_existing["peers"][0]["name"] == "Alice"
            print("Bob:", bob_self, bob_existing)

            bob_id = bob_self["peerId"]

            alice_joined = await recv_json(alice)
            assert alice_joined["type"] == "peer-joined"
            assert alice_joined["peer"]["peerId"] == bob_id
            assert alice_joined["peer"]["name"] == "Bob"
            print("Alice received peer-joined:", alice_joined)

            offer = {"type": "offer", "to": alice_id, "sdp": {"test": 1}}
            await bob.send(json.dumps(offer))
            relayed = await recv_json(alice)
            assert relayed["type"] == "offer"
            assert relayed["from"] == bob_id
            assert relayed["to"] == alice_id
            assert relayed["sdp"] == {"test": 1}
            print("Alice received relayed offer:", relayed)

    print("All signaling checks passed.")


if __name__ == "__main__":
    asyncio.run(main())
