"use client";

import { useRef } from "react";
import { Bell } from "lucide-react";
import { useClickOutside } from "@/hooks/useClickOutside";
import {
  useUnreadNotificationCount,
  useZoomStore,
} from "@/store/zoomStore";
import DropdownPanel from "../DropdownPanel";

export default function NotificationsDropdown() {
  const ref = useRef<HTMLDivElement>(null);
  const openPanel = useZoomStore((s) => s.openPanel);
  const togglePanel = useZoomStore((s) => s.togglePanel);
  const setOpenPanel = useZoomStore((s) => s.setOpenPanel);
  const notifications = useZoomStore((s) => s.notifications);
  const markNotificationsRead = useZoomStore((s) => s.markNotificationsRead);
  const unread = useUnreadNotificationCount();

  const open = openPanel === "notifications";

  useClickOutside(ref, () => {
    if (open) setOpenPanel(null);
  }, open);

  const handleOpen = () => {
    if (!open) markNotificationsRead();
    togglePanel("notifications");
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={handleOpen}
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        className="relative rounded-md p-2 text-[#8C8C8C] transition-colors hover:bg-[#3D3D3D] hover:text-white"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0B5CFF] px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <DropdownPanel open={open} className="w-80 max-h-96 overflow-hidden p-0">
        <div className="border-b border-[#3D3D3D] px-4 py-3">
          <h3 className="text-sm font-semibold text-white">Notifications</h3>
        </div>
        <ul className="max-h-72 overflow-y-auto">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`border-b border-[#3D3D3D]/60 px-4 py-3 last:border-0 ${
                !n.read ? "bg-[#0B5CFF]/10" : ""
              }`}
            >
              <p className="text-sm font-medium text-white">{n.title}</p>
              <p className="mt-0.5 text-xs text-[#8C8C8C]">{n.body}</p>
              <p className="mt-1 text-[10px] text-[#8C8C8C]">{n.time}</p>
            </li>
          ))}
        </ul>
      </DropdownPanel>
    </div>
  );
}
