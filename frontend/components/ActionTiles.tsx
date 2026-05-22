"use client";

import { Calendar, Plus, Video } from "lucide-react";

interface ActionTilesProps {
  onNewMeeting: () => void;
  onJoinMeeting: () => void;
  onScheduleMeeting: () => void;
}

interface TileProps {
  label: string;
  icon: React.ReactNode;
  bgClass: string;
  textClass: string;
  onClick?: () => void;
  disabled?: boolean;
}

function Tile({
  label,
  icon,
  bgClass,
  textClass,
  onClick,
  disabled,
}: TileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center gap-3 ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
    >
      <div
        className={`flex h-20 w-20 items-center justify-center rounded-2xl sm:h-24 sm:w-24 md:h-28 md:w-28 ${bgClass}`}
      >
        {icon}
      </div>
      <span className={`text-center text-xs font-medium sm:text-sm ${textClass}`}>
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
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 md:gap-8">
      <Tile
        label="New Meeting"
        bgClass="bg-[#F5A623]"
        textClass="text-[#1A1A1A] dark:text-[#F7F7F7]"
        icon={
          <Video
            className="h-8 w-8 text-white sm:h-10 sm:w-10"
            strokeWidth={1.5}
          />
        }
        onClick={onNewMeeting}
      />
      <Tile
        label="Join"
        bgClass="bg-[#2D8CFF]"
        textClass="text-[#1A1A1A] dark:text-[#F7F7F7]"
        icon={
          <Plus className="h-8 w-8 text-white sm:h-10 sm:w-10" strokeWidth={2} />
        }
        onClick={onJoinMeeting}
      />
      <Tile
        label="Schedule"
        bgClass="bg-[#0E71EB]"
        textClass="text-[#1A1A1A] dark:text-[#F7F7F7]"
        icon={
          <Calendar
            className="h-8 w-8 text-white sm:h-10 sm:w-10"
            strokeWidth={1.5}
          />
        }
        onClick={onScheduleMeeting}
      />
    </div>
  );
}
