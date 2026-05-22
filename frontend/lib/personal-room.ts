const PMI_STORAGE_PREFIX = "zoom-pmi-";

export function formatPmiDisplay(digits: string): string {
  const d = digits.replace(/\D/g, "");
  if (d.length === 10) {
    return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  }
  if (d.length === 11) {
    return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  }
  return digits;
}

export function getPersonalMeetingRoom(userKey: string, displayName: string) {
  if (typeof window === "undefined") {
    return {
      topic: `${displayName}'s Personal Meeting Room`,
      meetingId: "000 000 0000",
      meetingIdRaw: "0000000000",
      inviteUrl: "",
    };
  }

  const key = `${PMI_STORAGE_PREFIX}${userKey}`;
  let raw = localStorage.getItem(key);
  if (!raw) {
    raw = String(1000000000 + Math.floor(Math.random() * 9000000000));
    localStorage.setItem(key, raw);
  }

  const invitePath = raw.length === 10
    ? `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7)}`
    : raw;

  const origin = window.location.origin;

  return {
    topic: `${displayName}'s Personal Meeting Room`,
    meetingId: formatPmiDisplay(raw),
    meetingIdRaw: raw,
    inviteUrl: `${origin}/meeting/${invitePath}`,
  };
}
