from uuid import uuid4

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from app.ws.room_manager import PeerInfo, room_manager

router = APIRouter()


@router.websocket("/ws/{meeting_code}")
async def signaling_endpoint(
    websocket: WebSocket,
    meeting_code: str,
    name: str = Query(...),
    is_host: bool = Query(False),
):
    await websocket.accept()
    peer_id = str(uuid4())
    peer = PeerInfo(peer_id=peer_id, name=name, websocket=websocket)

    if is_host:
        room_manager.register_host(meeting_code, peer_id)

    host_peer_id = room_manager.get_host_peer_id(meeting_code)

    await websocket.send_json(
        {
            "type": "self",
            "peerId": peer_id,
            "isHost": room_manager.is_host_peer(meeting_code, peer_id),
            "hostPeerId": host_peer_id,
        }
    )

    existing = room_manager.get_peers(meeting_code)
    await websocket.send_json(
        {
            "type": "existing-peers",
            "peers": [
                {
                    "peerId": p.peer_id,
                    "name": p.name,
                    "muted": p.muted,
                    "cameraOff": p.camera_off,
                }
                for p in existing.values()
            ],
            "hostPeerId": host_peer_id,
        }
    )

    await room_manager.broadcast(
        meeting_code,
        {
            "type": "peer-joined",
            "peer": {"peerId": peer_id, "name": name},
        },
    )

    room_manager.add_peer(meeting_code, peer)

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")

            if msg_type in ("offer", "answer", "ice-candidate"):
                target_id = data.get("to")
                target_socket = room_manager.get_socket(meeting_code, target_id)
                if target_socket:
                    await target_socket.send_json({**data, "from": peer_id})

            elif msg_type == "state":
                peer.muted = data.get("muted", peer.muted)
                peer.camera_off = data.get("cameraOff", peer.camera_off)
                await room_manager.broadcast(
                    meeting_code,
                    {
                        "type": "peer-state",
                        "peerId": peer_id,
                        "muted": peer.muted,
                        "cameraOff": peer.camera_off,
                    },
                    exclude_peer_id=peer_id,
                )

            elif msg_type == "host-mute-all":
                if room_manager.is_host_peer(meeting_code, peer_id):
                    await room_manager.broadcast(
                        meeting_code,
                        {"type": "force-mute"},
                        exclude_peer_id=peer_id,
                    )

            elif msg_type == "host-remove-peer":
                target_id = data.get("targetPeerId")
                if (
                    room_manager.is_host_peer(meeting_code, peer_id)
                    and target_id
                    and target_id != peer_id
                ):
                    if await room_manager.kick_peer(meeting_code, target_id):
                        await room_manager.broadcast(
                            meeting_code,
                            {"type": "peer-left", "peerId": target_id},
                        )

    except WebSocketDisconnect:
        if room_manager.remove_peer(meeting_code, peer_id):
            await room_manager.broadcast(
                meeting_code,
                {
                    "type": "peer-left",
                    "peerId": peer_id,
                },
            )
