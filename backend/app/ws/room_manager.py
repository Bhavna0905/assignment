from dataclasses import dataclass
from typing import Dict, List, Optional

from fastapi import WebSocket


@dataclass
class PeerInfo:
    peer_id: str
    name: str
    websocket: WebSocket
    muted: bool = False
    camera_off: bool = False
    screen_sharing: bool = False
    in_meeting_chat: bool = False


@dataclass
class ChatMessage:
    id: str
    sender_peer_id: str
    sender_name: str
    text: str
    timestamp: str


class RoomManager:
    def __init__(self):
        self._rooms: Dict[str, Dict[str, PeerInfo]] = {}
        self._host_peer_id: Dict[str, str] = {}
        self._chat_history: Dict[str, List[ChatMessage]] = {}

    def add_peer(self, code: str, peer: PeerInfo):
        if code not in self._rooms:
            self._rooms[code] = {}
        self._rooms[code][peer.peer_id] = peer

    def remove_peer(self, code: str, peer_id: str) -> bool:
        removed = False
        if code in self._rooms and peer_id in self._rooms[code]:
            del self._rooms[code][peer_id]
            removed = True
            if not self._rooms[code]:
                del self._rooms[code]
                self.clear_chat(code)
        if self._host_peer_id.get(code) == peer_id:
            del self._host_peer_id[code]
        return removed

    def clear_chat(self, code: str) -> None:
        self._chat_history.pop(code, None)

    def join_meeting_chat(self, code: str, peer_id: str) -> bool:
        peers = self._rooms.get(code, {})
        peer = peers.get(peer_id)
        if not peer:
            return False
        peer.in_meeting_chat = True
        return True

    def leave_meeting_chat(self, code: str, peer_id: str) -> None:
        peers = self._rooms.get(code, {})
        peer = peers.get(peer_id)
        if peer:
            peer.in_meeting_chat = False

    def get_chat_history(self, code: str) -> List[ChatMessage]:
        return list(self._chat_history.get(code, []))

    def add_chat_message(
        self, code: str, message: ChatMessage, max_history: int = 200
    ) -> None:
        if code not in self._chat_history:
            self._chat_history[code] = []
        self._chat_history[code].append(message)
        if len(self._chat_history[code]) > max_history:
            self._chat_history[code] = self._chat_history[code][-max_history:]

    def chat_message_to_dict(self, message: ChatMessage) -> dict:
        return {
            "id": message.id,
            "senderPeerId": message.sender_peer_id,
            "senderName": message.sender_name,
            "text": message.text,
            "timestamp": message.timestamp,
        }

    def register_host(self, code: str, peer_id: str) -> None:
        if code not in self._host_peer_id:
            self._host_peer_id[code] = peer_id

    def get_host_peer_id(self, code: str) -> Optional[str]:
        return self._host_peer_id.get(code)

    def is_host_peer(self, code: str, peer_id: str) -> bool:
        return self._host_peer_id.get(code) == peer_id

    def get_peers(self, code: str) -> Dict[str, PeerInfo]:
        return self._rooms.get(code, {})

    def get_socket(self, code: str, peer_id: str) -> Optional[WebSocket]:
        peers = self._rooms.get(code, {})
        peer = peers.get(peer_id)
        return peer.websocket if peer else None

    async def broadcast(self, code: str, message: dict, exclude_peer_id: str = None):
        peers = self.get_peers(code)
        for pid, peer in list(peers.items()):
            if pid != exclude_peer_id:
                try:
                    await peer.websocket.send_json(message)
                except Exception:
                    pass

    async def kick_peer(self, code: str, peer_id: str) -> bool:
        peers = self.get_peers(code)
        peer = peers.get(peer_id)
        if not peer:
            return False
        try:
            await peer.websocket.send_json(
                {"type": "kicked", "reason": "Removed by the host"}
            )
            await peer.websocket.close(code=4000, reason="Removed by host")
        except Exception:
            pass
        self.remove_peer(code, peer_id)
        return True


room_manager = RoomManager()
