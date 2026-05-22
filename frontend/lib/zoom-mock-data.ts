export type NavTab = "home" | "chat" | "meetings" | "contacts";

export interface MockContact {
  id: string;
  name: string;
  email: string;
  type: "contact";
}

export interface MockMeetingItem {
  id: string;
  title: string;
  code: string;
  time: string;
  type: "meeting";
}

export type SearchableItem = MockContact | MockMeetingItem;

export const MOCK_CONTACTS: MockContact[] = [
  { id: "c1", name: "Alex Rivera", email: "alex@company.com", type: "contact" },
  { id: "c2", name: "Bhavna Meemroth", email: "bhavna@company.com", type: "contact" },
  { id: "c3", name: "Chris Taylor", email: "chris@company.com", type: "contact" },
  { id: "c4", name: "Dana Kim", email: "dana@company.com", type: "contact" },
  { id: "c5", name: "Evan Brooks", email: "evan@company.com", type: "contact" },
];

export const MOCK_MEETINGS: MockMeetingItem[] = [
  {
    id: "m1",
    title: "Weekly Standup",
    code: "443-691-0106",
    time: "Today, 10:00 AM",
    type: "meeting",
  },
  {
    id: "m2",
    title: "Product Review",
    code: "824-117-9032",
    time: "Tomorrow, 2:30 PM",
    type: "meeting",
  },
  {
    id: "m3",
    title: "Client Demo",
    code: "555-202-8891",
    time: "Fri, 4:00 PM",
    type: "meeting",
  },
];

export const MOCK_NOTIFICATIONS = [
  {
    id: "n1",
    title: "Meeting starting soon",
    body: "Weekly Standup begins in 15 minutes",
    read: false,
    time: "5m ago",
  },
  {
    id: "n2",
    title: "New chat message",
    body: "Alex: Can you share the deck?",
    read: false,
    time: "1h ago",
  },
  {
    id: "n3",
    title: "Recording ready",
    body: "Product Review recording is available",
    read: true,
    time: "Yesterday",
  },
];

export const MOCK_USERS = [
  {
    id: "u1",
    name: "Bhavna Meemroth",
    email: "bhavna@zoomclone.local",
    initials: "BM",
  },
  {
    id: "u2",
    name: "Alex Rivera",
    email: "alex@zoomclone.local",
    initials: "AR",
  },
];

export const MEETING_ID_REGEX = /^\d{3}-\d{4}-\d{4}$/;

export function normalizeMeetingId(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 11) return "";
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}

export function isValidMeetingId(id: string): boolean {
  return MEETING_ID_REGEX.test(id.trim());
}

export function filterSearchItems(
  query: string,
  contacts: MockContact[],
  meetings: MockMeetingItem[]
): SearchableItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const items: SearchableItem[] = [...contacts, ...meetings];
  return items.filter((item) => {
    if (item.type === "contact") {
      return (
        item.name.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q)
      );
    }
    return (
      item.title.toLowerCase().includes(q) ||
      item.code.includes(q) ||
      item.time.toLowerCase().includes(q)
    );
  });
}
