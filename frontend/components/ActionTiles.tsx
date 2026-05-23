"use client";

import { Calendar, Copy, Plus, Video } from "lucide-react";
import { useMemo, useState } from "react";
import { getPersonalMeetingRoom } from "@/lib/personal-room";

interface ActionTilesProps {
  displayName: string;
  userKey: string;
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
      className="group flex flex-col items-center gap-2"
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-zoom transition-transform group-hover:scale-105 ${iconBg}`}
      >
        {icon}
      </div>
      <span className="text-center text-xs font-semibold text-zoom-text">
        {label}
      </span>
    </button>
  );
}

export default function ActionTiles({
  displayName,
  userKey,
  onNewMeeting,
  onJoinMeeting,
  onScheduleMeeting,
}: ActionTilesProps) {
  const [copied, setCopied] = useState(false);
  const personalRoom = useMemo(
    () => getPersonalMeetingRoom(userKey, displayName),
    [userKey, displayName]
  );

  const copyPmi = async () => {
    await navigator.clipboard.writeText(personalRoom.meetingIdRaw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="zoom-card p-5">
      <div className="flex items-center justify-center gap-6 sm:gap-8">
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

      <div className="mt-5 border-t border-zoom-border pt-4">
        <p className="text-sm font-bold text-zoom-text">Personal Meeting ID</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-mono text-sm text-zoom-text">
            {personalRoom.meetingId}
          </span>
          <button
            type="button"
            onClick={copyPmi}
            className="rounded p-1 text-zoom-primary transition-colors hover:bg-zoom-primary/10"
            aria-label="Copy Personal Meeting ID"
          >
            <Copy className="h-4 w-4" />
          </button>
          {copied && (
            <span className="text-xs font-medium text-green-600">Copied</span>
          )}
        </div>
      </div>
    </div>
  );
}
