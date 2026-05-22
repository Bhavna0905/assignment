"use client";

import { useRef, useState } from "react";
import {
  Calendar,
  Home,
  MessageCircle,
  Monitor,
  Search,
  Settings,
  Users,
  Video,
} from "lucide-react";
import { useClickOutside } from "@/hooks/useClickOutside";
import {
  filterSearchItems,
  MOCK_CONTACTS,
  MOCK_MEETINGS,
  type NavTab,
} from "@/lib/zoom-mock-data";
import { useZoomStore } from "@/store/zoomStore";
import HostDropdown from "./dropdowns/HostDropdown";
import JoinDropdown from "./dropdowns/JoinDropdown";
import NotificationsDropdown from "./dropdowns/NotificationsDropdown";
import ProfileDropdown from "./dropdowns/ProfileDropdown";

const NAV_ITEMS: { id: NavTab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "meetings", label: "Meetings", icon: Video },
  { id: "contacts", label: "Contacts", icon: Users },
];

export default function ZoomNavbar() {
  const searchRef = useRef<HTMLDivElement>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  const activeTab = useZoomStore((s) => s.activeTab);
  const setActiveTab = useZoomStore((s) => s.setActiveTab);
  const searchQuery = useZoomStore((s) => s.searchQuery);
  const setSearchQuery = useZoomStore((s) => s.setSearchQuery);
  const setOpenPanel = useZoomStore((s) => s.setOpenPanel);
  const togglePanel = useZoomStore((s) => s.togglePanel);
  const startMeeting = useZoomStore((s) => s.startMeeting);
  const signedIn = useZoomStore((s) => s.signedIn);

  const results =
    searchQuery.trim().length > 0
      ? filterSearchItems(searchQuery, MOCK_CONTACTS, MOCK_MEETINGS)
      : [];

  useClickOutside(searchRef, () => setSearchFocused(false), searchFocused);

  const handleShareScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      stream.getTracks().forEach((t) => {
        t.onended = () => useZoomStore.getState().leaveMeeting();
      });
      startMeeting("screen-only");
    } catch {
      /* cancelled */
    }
  };

  if (!signedIn) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-[#3D3D3D] bg-[#1C1C1C]">
        <div className="flex h-full items-center px-4">
          <span className="text-xl font-bold text-[#0B5CFF]">zoom</span>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-[#3D3D3D] bg-[#1C1C1C]">
      <div className="flex h-full items-center gap-2 px-3 sm:gap-4 sm:px-4">
        {/* Left: logo + search */}
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-6">
          <span className="shrink-0 text-xl font-bold tracking-tight text-[#0B5CFF]">
            zoom
          </span>

          <div ref={searchRef} className="relative hidden min-w-0 flex-1 sm:block sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C8C8C]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              placeholder="Search contacts and meetings"
              className="w-full rounded-md border border-[#3D3D3D] bg-[#2D2D2D] py-2 pl-9 pr-3 text-sm text-white placeholder:text-[#8C8C8C] focus:border-[#0B5CFF] focus:outline-none focus:ring-1 focus:ring-[#0B5CFF]"
            />
            {searchFocused && searchQuery.trim() && (
              <div className="absolute left-0 right-0 top-full z-[150] mt-1 max-h-64 overflow-y-auto rounded-lg border border-[#3D3D3D] bg-[#2D2D2D] py-1 shadow-xl">
                {results.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-[#8C8C8C]">
                    No results
                  </p>
                ) : (
                  results.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSearchFocused(false);
                        if (item.type === "meeting") setActiveTab("meetings");
                        else setActiveTab("contacts");
                      }}
                      className="flex w-full flex-col px-3 py-2 text-left hover:bg-[#3D3D3D]"
                    >
                      <span className="text-sm text-white">
                        {"title" in item ? item.title : item.name}
                      </span>
                      <span className="text-xs text-[#8C8C8C]">
                        {"email" in item ? item.email : item.code}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center: nav tabs */}
        <nav className="hidden items-center gap-1 md:flex lg:gap-2">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`relative flex flex-col items-center px-3 py-1 transition-colors ${
                  active ? "text-[#0B5CFF]" : "text-[#8C8C8C] hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} />
                <span className="mt-0.5 text-[11px] font-medium">{label}</span>
                {active && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-[#0B5CFF]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: actions */}
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("meetings")}
            className="hidden rounded-md p-2 text-[#8C8C8C] transition-colors hover:bg-[#3D3D3D] hover:text-white sm:block"
            title="Schedule"
          >
            <Calendar className="h-5 w-5" />
            <span className="sr-only">Schedule</span>
          </button>

          <button
            type="button"
            onClick={() => void handleShareScreen()}
            className="hidden rounded-md px-2 py-1.5 text-sm text-white transition-colors hover:bg-[#3D3D3D] lg:block"
          >
            Share Screen
          </button>

          <JoinDropdown />
          <HostDropdown />

          <NotificationsDropdown />

          <button
            type="button"
            onClick={() => togglePanel("settings")}
            className="rounded-md p-2 text-[#8C8C8C] transition-colors hover:bg-[#3D3D3D] hover:text-white"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>

          <ProfileDropdown />
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="flex border-t border-[#3D3D3D] md:hidden">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex flex-1 flex-col items-center py-2 ${
                active ? "text-[#0B5CFF]" : "text-[#8C8C8C]"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px]">{label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
