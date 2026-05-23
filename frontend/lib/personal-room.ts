const PMI_STORAGE_PREFIX = "zoom-pmi-";
const PMI_SETTINGS_PREFIX = "zoom-pmi-settings-";

export type PersonalRoomSettings = {
  topic: string;
  passcode: string;
  waitingRoom: boolean;
};

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

function defaultTopic(displayName: string): string {
  return `${displayName}'s Personal Meeting Room`;
}

function settingsKey(userKey: string): string {
  return `${PMI_SETTINGS_PREFIX}${userKey}`;
}

export function getPersonalRoomSettings(
  userKey: string,
  displayName: string
): PersonalRoomSettings {
  const fallback: PersonalRoomSettings = {
    topic: defaultTopic(displayName),
    passcode: "123456",
    waitingRoom: true,
  };

  if (typeof window === "undefined") return fallback;

  try {
    const raw = localStorage.getItem(settingsKey(userKey));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<PersonalRoomSettings>;
    return {
      topic:
        typeof parsed.topic === "string" && parsed.topic.trim()
          ? parsed.topic.trim()
          : fallback.topic,
      passcode:
        typeof parsed.passcode === "string" && parsed.passcode.length > 0
          ? parsed.passcode
          : fallback.passcode,
      waitingRoom:
        typeof parsed.waitingRoom === "boolean"
          ? parsed.waitingRoom
          : fallback.waitingRoom,
    };
  } catch {
    return fallback;
  }
}

export function savePersonalRoomSettings(
  userKey: string,
  settings: PersonalRoomSettings
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(settingsKey(userKey), JSON.stringify(settings));
}

export type PersonalMeetingRoom = {
  topic: string;
  meetingId: string;
  meetingIdRaw: string;
  inviteUrl: string;
  passcode: string;
  waitingRoom: boolean;
};

export function getPersonalMeetingRoom(
  userKey: string,
  displayName: string
): PersonalMeetingRoom {
  const settings = getPersonalRoomSettings(userKey, displayName);

  if (typeof window === "undefined") {
    return {
      topic: settings.topic,
      meetingId: "000 000 0000",
      meetingIdRaw: "0000000000",
      inviteUrl: "",
      passcode: settings.passcode,
      waitingRoom: settings.waitingRoom,
    };
  }

  const key = `${PMI_STORAGE_PREFIX}${userKey}`;
  let raw = localStorage.getItem(key);
  if (!raw) {
    raw = String(1000000000 + Math.floor(Math.random() * 9000000000));
    localStorage.setItem(key, raw);
  }

  const invitePath =
    raw.length === 10
      ? `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7)}`
      : raw;

  const origin = window.location.origin;

  return {
    topic: settings.topic,
    meetingId: formatPmiDisplay(raw),
    meetingIdRaw: raw,
    inviteUrl: `${origin}/meeting/${invitePath}`,
    passcode: settings.passcode,
    waitingRoom: settings.waitingRoom,
  };
}
