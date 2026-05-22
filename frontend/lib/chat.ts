import type { ChatMessage } from "./types";

export function formatChatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function parseChatMessage(raw: unknown): ChatMessage | null {
  if (!raw || typeof raw !== "object") return null;
  const m = raw as Record<string, unknown>;
  if (
    typeof m.id !== "string" ||
    typeof m.senderPeerId !== "string" ||
    typeof m.senderName !== "string" ||
    typeof m.text !== "string" ||
    typeof m.timestamp !== "string"
  ) {
    return null;
  }
  return {
    id: m.id,
    senderPeerId: m.senderPeerId,
    senderName: m.senderName,
    text: m.text,
    timestamp: m.timestamp,
  };
}

export function parseChatMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => parseChatMessage(item))
    .filter((m): m is ChatMessage => m !== null);
}
