from uuid import uuid4

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from app.ws.chat import new_message_id, utc_now_iso, validate_message
from app.ws.room_manager import ChatMessage, PeerInfo, room_manager

router = APIRouter()

MAX_CHAT_HISTORY = 200


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
                    "screenSharing": p.screen_sharing,
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
                peer.screen_sharing = data.get("screenSharing", peer.screen_sharing)
                await room_manager.broadcast(
                    meeting_code,
                    {
                        "type": "peer-state",
                        "peerId": peer_id,
                        "muted": peer.muted,
                        "cameraOff": peer.camera_off,
                        "screenSharing": peer.screen_sharing,
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

            elif msg_type == "join-meeting-chat":
                if room_manager.join_meeting_chat(meeting_code, peer_id):
                    history = room_manager.get_chat_history(meeting_code)
                    await websocket.send_json(
                        {
                            "type": "chat-history",
                            "messages": [
                                room_manager.chat_message_to_dict(m)
                                for m in history
                            ],
                        }
                    )

            elif msg_type == "send-message":
                if not room_manager.get_peers(meeting_code).get(peer_id):
                    await websocket.send_json(
                        {
                            "type": "chat-error",
                            "error": "Not in meeting room",
                        }
                    )
                    continue

                ok, sanitized, err = validate_message(data.get("text"))
                if not ok:
                    await websocket.send_json(
                        {"type": "chat-error", "error": err or "Invalid message"}
                    )
                    continue

                chat_msg = ChatMessage(
                    id=new_message_id(),
                    sender_peer_id=peer_id,
                    sender_name=peer.name,
                    text=sanitized,
                    timestamp=utc_now_iso(),
                )
                room_manager.add_chat_message(
                    meeting_code, chat_msg, max_history=MAX_CHAT_HISTORY
                )

                await room_manager.broadcast(
                    meeting_code,
                    {
                        "type": "receive-message",
                        "message": room_manager.chat_message_to_dict(chat_msg),
                    },
                )

            elif msg_type == "leave-meeting-chat":
                room_manager.leave_meeting_chat(meeting_code, peer_id)

    except WebSocketDisconnect:
        room_manager.leave_meeting_chat(meeting_code, peer_id)
        if room_manager.remove_peer(meeting_code, peer_id):
            await room_manager.broadcast(
                meeting_code,
                {
                    "type": "peer-left",
                    "peerId": peer_id,
                },
            )
