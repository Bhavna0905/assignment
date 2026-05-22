export function getMeetingInviteUrl(code: string): string {
  const base =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/meeting/${code}`;
}

export function parseMeetingCode(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  try {
    if (trimmed.includes("/")) {
      const url = new URL(
        trimmed.startsWith("http") ? trimmed : `https://${trimmed}`
      );
      const segment = url.pathname.split("/").filter(Boolean).pop();
      return segment ?? trimmed;
    }
  } catch {
    // not a URL — treat as raw code
  }
  return trimmed;
}

export function formatMeetingDateTime(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
