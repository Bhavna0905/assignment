"use client";

import { useZoomStore } from "@/store/zoomStore";
import LoggedOutView from "./LoggedOutView";
import MeetingRoom from "./MeetingRoom";
import SettingsModal from "./SettingsModal";
import TabContent from "./content/TabContent";
import ZoomNavbar from "./ZoomNavbar";

export default function ZoomApp() {
  const signedIn = useZoomStore((s) => s.signedIn);
  const appView = useZoomStore((s) => s.appView);

  return (
    <div className="min-h-dvh bg-[#1C1C1C]">
      <ZoomNavbar />
      <SettingsModal />

      <main className="pt-[6.75rem] md:pt-14">
        {!signedIn ? (
          <LoggedOutView />
        ) : appView === "meeting" ? (
          <MeetingRoom />
        ) : (
          <TabContent />
        )}
      </main>

      {/* Mobile search below navbar on small screens */}
      {signedIn && appView === "main" && <MobileSearchBar />}
    </div>
  );
}

function MobileSearchBar() {
  const searchQuery = useZoomStore((s) => s.searchQuery);
  const setSearchQuery = useZoomStore((s) => s.setSearchQuery);

  return (
    <div className="border-b border-[#3D3D3D] px-3 py-2 sm:hidden">
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search..."
        className="w-full rounded-md border border-[#3D3D3D] bg-[#2D2D2D] px-3 py-2 text-sm text-white placeholder:text-[#8C8C8C]"
      />
    </div>
  );
}
