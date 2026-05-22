"use client";

import { Calendar, MessageCircle, Users, Video } from "lucide-react";
import {
  filterSearchItems,
  MOCK_CONTACTS,
  MOCK_MEETINGS,
  type NavTab,
} from "@/lib/zoom-mock-data";
import { useZoomStore } from "@/store/zoomStore";

const TAB_META: Record<
  NavTab,
  { title: string; subtitle: string; icon: typeof Video }
> = {
  home: {
    title: "Home",
    subtitle: "Your meetings and quick actions",
    icon: Video,
  },
  chat: {
    title: "Chat",
    subtitle: "Team messages and channels",
    icon: MessageCircle,
  },
  meetings: {
    title: "Meetings",
    subtitle: "Scheduled and past meetings",
    icon: Calendar,
  },
  contacts: {
    title: "Contacts",
    subtitle: "People in your organization",
    icon: Users,
  },
};

export default function TabContent() {
  const activeTab = useZoomStore((s) => s.activeTab);
  const searchQuery = useZoomStore((s) => s.searchQuery);
  const meta = TAB_META[activeTab];
  const Icon = meta.icon;

  const searchResults =
    searchQuery.trim().length > 0
      ? filterSearchItems(searchQuery, MOCK_CONTACTS, MOCK_MEETINGS)
      : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      {searchQuery.trim() && (
        <div className="zoom-search-results mb-8 rounded-lg border border-[#3D3D3D] bg-[#2D2D2D] p-4">
          <h3 className="text-sm font-semibold text-white">
            Search results for &quot;{searchQuery}&quot;
          </h3>
          {searchResults.length === 0 ? (
            <p className="mt-2 text-sm text-[#8C8C8C]">No matches found</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {searchResults.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-[#3D3D3D]"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {"title" in item ? item.title : item.name}
                    </p>
                    <p className="text-xs text-[#8C8C8C]">
                      {"email" in item
                        ? item.email
                        : `${item.code} · ${item.time}`}
                    </p>
                  </div>
                  <span className="text-xs capitalize text-[#0B5CFF]">
                    {item.type}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B5CFF]/20 text-[#0B5CFF]">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{meta.title}</h1>
          <p className="mt-1 text-[#8C8C8C]">{meta.subtitle}</p>
        </div>
      </div>

      {activeTab === "home" && <HomePanel />}
      {activeTab === "chat" && <ChatPanel />}
      {activeTab === "meetings" && <MeetingsPanel />}
      {activeTab === "contacts" && <ContactsPanel />}
    </div>
  );
}

function HomePanel() {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-[#3D3D3D] bg-[#2D2D2D] p-6 transition-shadow hover:shadow-lg">
        <h3 className="font-semibold text-white">Start a meeting</h3>
        <p className="mt-2 text-sm text-[#8C8C8C]">
          Use Host in the top bar to start with video, without video, or screen
          share only.
        </p>
      </div>
      <div className="rounded-xl border border-[#3D3D3D] bg-[#2D2D2D] p-6">
        <h3 className="font-semibold text-white">Join a meeting</h3>
        <p className="mt-2 text-sm text-[#8C8C8C]">
          Click Join and enter a meeting ID in xxx-xxxx-xxxx format.
        </p>
      </div>
    </div>
  );
}

function ChatPanel() {
  const chats = [
    { name: "Alex Rivera", preview: "Thanks for the update!", time: "2m" },
    { name: "Product Team", preview: "Sprint planning at 3pm", time: "1h" },
  ];
  return (
    <ul className="mt-8 divide-y divide-[#3D3D3D] rounded-xl border border-[#3D3D3D] bg-[#2D2D2D]">
      {chats.map((c) => (
        <li
          key={c.name}
          className="flex cursor-pointer items-center justify-between px-4 py-4 transition-colors hover:bg-[#3D3D3D]/50"
        >
          <div>
            <p className="font-medium text-white">{c.name}</p>
            <p className="text-sm text-[#8C8C8C]">{c.preview}</p>
          </div>
          <span className="text-xs text-[#8C8C8C]">{c.time}</span>
        </li>
      ))}
    </ul>
  );
}

function MeetingsPanel() {
  return (
    <ul className="mt-8 space-y-3">
      {MOCK_MEETINGS.map((m) => (
        <li
          key={m.id}
          className="flex items-center justify-between rounded-xl border border-[#3D3D3D] bg-[#2D2D2D] px-5 py-4 transition-colors hover:border-[#0B5CFF]/40"
        >
          <div>
            <p className="font-semibold text-white">{m.title}</p>
            <p className="text-sm text-[#8C8C8C]">
              {m.time} · {m.code}
            </p>
          </div>
          <button
            type="button"
            className="rounded-md bg-[#0B5CFF] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#0952d9]"
          >
            Start
          </button>
        </li>
      ))}
    </ul>
  );
}

function ContactsPanel() {
  return (
    <ul className="mt-8 grid gap-2 sm:grid-cols-2">
      {MOCK_CONTACTS.map((c) => (
        <li
          key={c.id}
          className="flex items-center gap-3 rounded-xl border border-[#3D3D3D] bg-[#2D2D2D] px-4 py-3 transition-colors hover:bg-[#3D3D3D]/80"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7C3AED] text-sm font-bold text-white">
            {c.name
              .split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-white">{c.name}</p>
            <p className="truncate text-xs text-[#8C8C8C]">{c.email}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
