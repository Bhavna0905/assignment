"use client";

import { Calendar, Plus, Video } from "lucide-react";

interface ActionTilesProps {
  onNewMeeting: () => void;
  onJoinMeeting: () => void;
  onScheduleMeeting: () => void;
}

interface QuickActionProps {
  label: string;
  icon: React.ReactNode;
  iconBg: string;
  onClick?: () => void;
}

function QuickAction({ label, icon, iconBg, onClick }: QuickActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-1 flex-col items-center gap-2 rounded-xl p-3 transition-all duration-200 hover:bg-zoom-border/30"
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full shadow-zoom transition-transform duration-200 group-hover:scale-105 sm:h-14 sm:w-14 ${iconBg}`}
      >
        {icon}
      </div>
      <span className="text-center text-xs font-semibold text-zoom-text sm:text-sm">
        {label}
      </span>
    </button>
  );
}

export default function ActionTiles({
  onNewMeeting,
  onJoinMeeting,
  onScheduleMeeting,
}: ActionTilesProps) {
  return (
    <div className="zoom-card p-4 sm:p-5">
      <div className="flex items-stretch justify-between gap-1">
        <QuickAction
          label="Schedule"
          iconBg="bg-zoom-primary"
          icon={<Calendar className="h-6 w-6 text-white" strokeWidth={1.5} />}
          onClick={onScheduleMeeting}
        />
        <QuickAction
          label="Join"
          iconBg="bg-zoom-primary"
          icon={<Plus className="h-6 w-6 text-white" strokeWidth={2.5} />}
          onClick={onJoinMeeting}
        />
        <QuickAction
          label="Host"
          iconBg="bg-zoom-orange"
          icon={<Video className="h-6 w-6 text-white" strokeWidth={1.5} />}
          onClick={onNewMeeting}
        />
      </div>
    </div>
  );
}
