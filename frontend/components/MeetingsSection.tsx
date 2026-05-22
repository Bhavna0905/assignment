"use client";

import {
  Calendar,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  HelpCircle,
  PackageOpen,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { getPersonalMeetingRoom } from "@/lib/personal-room";
import type { Meeting } from "@/lib/types";
import { formatMeetingDateTime, getMeetingInviteUrl } from "@/lib/utils";

type MeetingTab =
  | "upcoming"
  | "previous"
  | "personal-room"
  | "templates"
  | "agendas";

type AgendaFilter = "my" | "shared" | "trash";

const TABS: { id: MeetingTab; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "previous", label: "Previous" },
  { id: "personal-room", label: "Personal Room" },
  { id: "templates", label: "Meeting Templates" },
  { id: "agendas", label: "Meeting Agendas" },
];

function formatDateRangeInput(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

function toHtmlDate(mmddyyyy: string): string {
  const [mm, dd, yyyy] = mmddyyyy.split("-");
  if (!mm || !dd || !yyyy) return "";
  return `${yyyy}-${mm}-${dd}`;
}

function fromHtmlDate(iso: string): string {
  const [yyyy, mm, dd] = iso.split("-");
  if (!yyyy || !mm || !dd) return "";
  return `${mm}-${dd}-${yyyy}`;
}

function defaultDateRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - 3);
  return {
    from: formatDateRangeInput(from),
    to: formatDateRangeInput(to),
  };
}

interface MeetingsSectionProps {
  displayName: string;
  userKey: string;
  upcoming: Meeting[];
  recent: Meeting[];
  onSchedule: () => void;
  onStartPersonalRoom: () => void;
  startingPersonal?: boolean;
}

export default function MeetingsSection({
  displayName,
  userKey,
  upcoming,
  recent,
  onSchedule,
  onStartPersonalRoom,
  startingPersonal,
}: MeetingsSectionProps) {
  const [tab, setTab] = useState<MeetingTab>("upcoming");
  const [agendaFilter, setAgendaFilter] = useState<AgendaFilter>("my");
  const [agendaSearch, setAgendaSearch] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState(defaultDateRange);

  const personalRoom = useMemo(
    () => getPersonalMeetingRoom(userKey, displayName),
    [userKey, displayName]
  );

  const passcode = "123456";

  const copyText = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const filteredRecent = useMemo(() => {
    const from = new Date(dateRange.from);
    const to = new Date(dateRange.to);
    to.setHours(23, 59, 59, 999);
    return recent.filter((m) => {
      const d = new Date(m.scheduled_start ?? m.created_at);
      return d >= from && d <= to;
    });
  }, [recent, dateRange]);

  return (
    <div className="meetings-section">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-zoom-text sm:text-3xl">
          Meetings
        </h1>
        <div className="flex shrink-0">
          <button
            type="button"
            onClick={onSchedule}
            className="zoom-btn-primary inline-flex items-center gap-1 rounded-r-none pr-3"
          >
            + Schedule a Meeting
          </button>
          <button
            type="button"
            onClick={onSchedule}
            className="zoom-btn-primary rounded-l-none border-l border-white/25 px-2"
            aria-label="More schedule options"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        className="mt-6 flex gap-0 overflow-x-auto border-b border-zoom-border"
        role="tablist"
      >
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              tab === id
                ? "border-zoom-primary text-zoom-primary"
                : "border-transparent text-zoom-muted hover:text-zoom-text"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "upcoming" && (
          <UpcomingTab
            upcoming={upcoming}
            onSchedule={onSchedule}
            onCopy={copyText}
            copied={copied}
          />
        )}

        {tab === "previous" && (
          <PreviousTab
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            meetings={filteredRecent}
            onSchedule={onSchedule}
          />
        )}

        {tab === "personal-room" && (
          <PersonalRoomTab
            room={personalRoom}
            passcode={passcode}
            showPasscode={showPasscode}
            onTogglePasscode={() => setShowPasscode((s) => !s)}
            onCopy={copyText}
            copied={copied}
            onStart={onStartPersonalRoom}
            starting={startingPersonal}
          />
        )}

        {tab === "templates" && <TemplatesTab onSchedule={onSchedule} />}

        {tab === "agendas" && (
          <AgendasTab
            filter={agendaFilter}
            onFilterChange={setAgendaFilter}
            search={agendaSearch}
            onSearchChange={setAgendaSearch}
          />
        )}
      </div>
    </div>
  );
}

function UpcomingTab({
  upcoming,
  onSchedule,
  onCopy,
  copied,
}: {
  upcoming: Meeting[];
  onSchedule: () => void;
  onCopy: (text: string, key: string) => void;
  copied: string | null;
}) {
  if (upcoming.length === 0) {
    return (
      <div className="max-w-3xl py-4">
        <h2 className="text-xl font-bold text-zoom-text">
          Welcome to Zoom Meetings!
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-zoom-muted">
          Schedule new and manage existing meetings all in one place. You are
          currently limited to 40 minutes per meeting. Upgrade now if you need
          more time.{" "}
          <button
            type="button"
            className="text-zoom-primary hover:underline"
          >
            Learn More
          </button>
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={onSchedule} className="zoom-btn-primary">
            Schedule a Meeting
          </button>
          <button type="button" className="zoom-btn-outline">
            Upgrade Now
          </button>
        </div>
        <CalendarPluginsFooter />
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {upcoming.map((meeting) => (
        <li key={meeting.id} className="zoom-card p-4">
          <h3 className="font-semibold text-zoom-text">{meeting.title}</h3>
          {meeting.scheduled_start && (
            <p className="mt-1 text-sm text-zoom-muted">
              {formatMeetingDateTime(meeting.scheduled_start)}
              {meeting.duration_minutes
                ? ` · ${meeting.duration_minutes} min`
                : ""}
            </p>
          )}
          <p className="mt-1 font-mono text-sm text-zoom-muted">
            {meeting.meeting_code}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={`/meeting/${meeting.meeting_code}`}
              className="zoom-btn-primary"
            >
              Start
            </Link>
            <button
              type="button"
              onClick={() =>
                onCopy(getMeetingInviteUrl(meeting.meeting_code), meeting.id)
              }
              className="zoom-btn-outline inline-flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              {copied === meeting.id ? "Copied!" : "Copy Invitation"}
            </button>
          </div>
        </li>
      ))}
      <CalendarPluginsFooter />
    </ul>
  );
}

function PreviousTab({
  dateRange,
  onDateRangeChange,
  meetings,
  onSchedule,
}: {
  dateRange: { from: string; to: string };
  onDateRangeChange: (r: { from: string; to: string }) => void;
  meetings: Meeting[];
  onSchedule: () => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-zoom-border bg-zoom-card px-3 py-2 text-sm text-zoom-text">
          <Calendar className="h-4 w-4 text-zoom-muted" />
          <input
            type="date"
            value={toHtmlDate(dateRange.from)}
            onChange={(e) => {
              const next = fromHtmlDate(e.target.value);
              if (next) onDateRangeChange({ ...dateRange, from: next });
            }}
            className="w-32 border-0 bg-transparent p-0 text-sm focus:outline-none focus:ring-0"
          />
          <span className="text-zoom-muted">to</span>
          <input
            type="date"
            value={toHtmlDate(dateRange.to)}
            onChange={(e) => {
              const next = fromHtmlDate(e.target.value);
              if (next) onDateRangeChange({ ...dateRange, to: next });
            }}
            className="w-32 border-0 bg-transparent p-0 text-sm focus:outline-none focus:ring-0"
          />
        </div>
        <button
          type="button"
          className="text-zoom-muted hover:text-zoom-text"
          aria-label="Date range help"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
        <p className="w-full text-xs text-zoom-muted sm:w-auto">
          {dateRange.from} to {dateRange.to}
        </p>
      </div>

      {meetings.length === 0 ? (
        <p className="mt-12 text-center text-sm text-zoom-muted">
          The user does not have any previous meetings. To schedule a new
          meeting click{" "}
          <button
            type="button"
            onClick={onSchedule}
            className="text-zoom-primary hover:underline"
          >
            Schedule a Meeting
          </button>
          .
        </p>
      ) : (
        <ul className="zoom-card mt-6 divide-y divide-zoom-border overflow-hidden">
          {meetings.map((meeting) => (
            <li
              key={meeting.id}
              className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-zoom-text">{meeting.title}</p>
                <p className="text-xs text-zoom-muted">
                  {formatMeetingDateTime(
                    meeting.scheduled_start ?? meeting.created_at
                  )}
                </p>
              </div>
              <span className="text-sm text-zoom-muted">Ended</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PersonalRoomTab({
  room,
  passcode,
  showPasscode,
  onTogglePasscode,
  onCopy,
  copied,
  onStart,
  starting,
}: {
  room: ReturnType<typeof getPersonalMeetingRoom>;
  passcode: string;
  showPasscode: boolean;
  onTogglePasscode: () => void;
  onCopy: (text: string, key: string) => void;
  copied: string | null;
  onStart: () => void;
  starting?: boolean;
}) {
  return (
    <div className="max-w-2xl">
      <h2 className="mb-4 text-sm font-semibold text-zoom-text">Details</h2>
      <dl className="space-y-4 text-sm">
        <div>
          <dt className="font-semibold text-zoom-text">Topic</dt>
          <dd className="mt-1 text-zoom-muted">{room.topic}</dd>
        </div>
        <div>
          <dt className="font-semibold text-zoom-text">Meeting ID</dt>
          <dd className="mt-1 font-mono text-zoom-text">{room.meetingId}</dd>
        </div>
        <div>
          <dt className="font-semibold text-zoom-text">Security</dt>
          <dd className="mt-2 space-y-2 text-zoom-muted">
            <p>
              Passcode:{" "}
              <span className="font-mono text-zoom-text">
                {showPasscode ? passcode : "********"}
              </span>{" "}
              <button
                type="button"
                onClick={onTogglePasscode}
                className="text-zoom-primary hover:underline"
              >
                {showPasscode ? "Hide" : "Show"}
              </button>
            </p>
            <p className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-green-600" />
              Everyone goes into the waiting room
            </p>
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-zoom-text">Invite Link</dt>
          <dd className="mt-1 flex flex-wrap items-center gap-2 break-all">
            <a
              href={room.inviteUrl}
              className="text-zoom-primary hover:underline"
            >
              {room.inviteUrl}
            </a>
            <button
              type="button"
              onClick={() => onCopy(room.inviteUrl, "pmi-link")}
              className="text-zoom-primary hover:text-zoom-primary-hover"
              aria-label="Copy invite link"
            >
              <Copy className="h-4 w-4" />
            </button>
            {copied === "pmi-link" && (
              <span className="text-xs text-green-600">Copied</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-zoom-text">Add to</dt>
          <dd className="mt-2 flex flex-wrap gap-4 text-zoom-primary">
            <span className="inline-flex items-center gap-1 hover:underline">
              Google Calendar <ExternalLink className="h-3 w-3" />
            </span>
            <span className="inline-flex items-center gap-1 hover:underline">
              Outlook Calendar (.ics) <ExternalLink className="h-3 w-3" />
            </span>
            <span className="inline-flex items-center gap-1 hover:underline">
              Yahoo Calendar <ExternalLink className="h-3 w-3" />
            </span>
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-zoom-text">Encryption</dt>
          <dd className="mt-1 flex items-center gap-1.5 text-zoom-muted">
            <Shield className="h-4 w-4 text-green-600" />
            Enhanced encryption
          </dd>
        </div>
      </dl>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onStart}
          disabled={starting}
          className="zoom-btn-primary min-w-[6rem]"
        >
          {starting ? "Starting…" : "Start"}
        </button>
        <button
          type="button"
          onClick={() =>
            onCopy(
              `Join: ${room.inviteUrl}\nMeeting ID: ${room.meetingId}`,
              "pmi-invite"
            )
          }
          className="zoom-btn-outline inline-flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          {copied === "pmi-invite" ? "Copied!" : "Copy Invitation"}
        </button>
        <button type="button" className="zoom-btn-outline">
          Edit
        </button>
      </div>
    </div>
  );
}

function TemplatesTab({ onSchedule }: { onSchedule: () => void }) {
  return (
    <div className="py-8 text-center">
      <PackageOpen
        className="mx-auto h-16 w-16 text-zoom-muted/60"
        strokeWidth={1.25}
      />
      <p className="mt-4 text-sm text-zoom-muted">
        No meeting templates yet.{" "}
        <button
          type="button"
          onClick={onSchedule}
          className="text-zoom-primary hover:underline"
        >
          Schedule a Meeting
        </button>{" "}
        to get started.
      </p>
    </div>
  );
}

function AgendasTab({
  filter,
  onFilterChange,
  search,
  onSearchChange,
}: {
  filter: AgendaFilter;
  onFilterChange: (f: AgendaFilter) => void;
  search: string;
  onSearchChange: (s: string) => void;
}) {
  const filters: { id: AgendaFilter; label: string }[] = [
    { id: "my", label: "My agendas" },
    { id: "shared", label: "Shared with me" },
    { id: "trash", label: "Trash" },
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {filters.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => onFilterChange(id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === id
                ? "bg-zoom-primary/15 text-zoom-primary"
                : "text-zoom-muted hover:text-zoom-text"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6 flex max-w-xl flex-col gap-2 sm:flex-row">
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search meeting name or ID"
          className="zoom-input flex-1"
        />
        <button type="button" className="zoom-btn-primary shrink-0 px-8">
          Search
        </button>
      </div>

      <div className="mt-16 flex flex-col items-center py-8">
        <div className="relative">
          <div className="h-24 w-28 rounded-lg bg-zoom-primary/20" />
          <PackageOpen className="absolute -right-2 -top-2 h-14 w-14 text-zoom-primary" />
        </div>
        <p className="mt-6 text-sm text-zoom-muted">No Data</p>
      </div>
    </div>
  );
}

function CalendarPluginsFooter() {
  return (
    <div className="mt-12 border-t border-zoom-border pt-8">
      <p className="text-sm text-zoom-muted">
        Save time by scheduling your meetings directly from your calendar.
      </p>
      <div className="mt-4 grid gap-6 sm:grid-cols-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-[#0078d4]/10 text-xs font-bold text-[#0078d4]">
            OL
          </div>
          <div>
            <p className="text-sm font-medium text-zoom-text">
              Microsoft Outlook Plugin
            </p>
            <button
              type="button"
              className="text-sm text-zoom-primary hover:underline"
            >
              Download
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-white shadow-sm ring-1 ring-zoom-border">
            <span className="text-lg font-bold text-[#4285F4]">G</span>
          </div>
          <div>
            <p className="text-sm font-medium text-zoom-text">
              Chrome Extension
            </p>
            <button
              type="button"
              className="text-sm text-zoom-primary hover:underline"
            >
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
