"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Meeting } from "@/lib/types";
import { getMeetingInviteUrl } from "@/lib/utils";

interface ScheduleModalProps {
  open: boolean;
  onClose: () => void;
  onScheduled: (meeting: Meeting) => void;
}

const DURATIONS = [15, 30, 45, 60, 90];
const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

type TimePeriod = "AM" | "PM";

function build24HourTime(
  hour12: number,
  minute: number,
  period: TimePeriod
): string {
  let hours = hour12 % 12;
  if (period === "PM") hours += 12;
  return `${String(hours).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function todayDateString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function ScheduleModal({
  open,
  onClose,
  onScheduled,
}: ScheduleModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [period, setPeriod] = useState<TimePeriod>("AM");
  const [duration, setDuration] = useState(30);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [scheduledMeeting, setScheduledMeeting] = useState<Meeting | null>(
    null
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setDate("");
      setHour("");
      setMinute("");
      setPeriod("AM");
      setDuration(30);
      setError("");
      setSubmitting(false);
      setScheduledMeeting(null);
      setCopied(false);
    }
  }, [open]);

  if (!open) return null;

  const inviteUrl = scheduledMeeting
    ? getMeetingInviteUrl(scheduledMeeting.meeting_code)
    : "";

  const handleSchedule = async () => {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!date || hour === "" || minute === "") {
      setError("Date and start time are required.");
      return;
    }

    const time24 = build24HourTime(Number(hour), Number(minute), period);
    const scheduledStart = new Date(`${date}T${time24}`);
    if (Number.isNaN(scheduledStart.getTime())) {
      setError("Invalid date or time.");
      return;
    }

    if (scheduledStart.getTime() <= Date.now()) {
      setError("Please choose a date and time in the future.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const meeting = await api.scheduleMeeting({
        title: title.trim(),
        description: description.trim() || undefined,
        scheduled_start: scheduledStart.toISOString(),
        duration_minutes: duration,
      });
      setScheduledMeeting(meeting);
      onScheduled(meeting);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to schedule meeting. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div className="max-h-[92dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-2xl bg-white px-4 py-5 shadow-xl sm:rounded-lg sm:px-6 sm:py-6 dark:bg-[#2C2C2C]">
        <h2 className="text-lg font-semibold text-[#1A1A1A] sm:text-xl dark:text-[#F7F7F7]">
          Schedule a meeting
        </h2>

        {scheduledMeeting ? (
          <div className="mt-4">
            <p className="text-sm text-[#747487]">
              Meeting scheduled. Share this invite link:
            </p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                readOnly
                value={inviteUrl}
                className="min-w-0 flex-1 rounded-md border border-[#E0E0E0] bg-[#F7F7F7] px-3 py-2 text-sm text-[#1A1A1A] dark:border-[#3D3D3D] dark:bg-[#1A1A1A] dark:text-[#F7F7F7]"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 rounded-md bg-[#2D8CFF] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0E71EB] sm:py-2"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="mt-2 font-mono text-sm text-[#747487]">
              ID: {scheduledMeeting.meeting_code}
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md bg-[#2D8CFF] px-4 py-2 text-sm font-medium text-white hover:bg-[#0E71EB]"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-4 space-y-4">
              <label className="block text-sm text-[#747487]">
                Title *
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[#E0E0E0] bg-white px-3 py-2.5 text-base text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#2D8CFF] sm:py-2 sm:text-sm dark:border-[#3D3D3D] dark:bg-[#1A1A1A] dark:text-[#F7F7F7]"
                />
              </label>
              <label className="block text-sm text-[#747487]">
                Description
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1 w-full resize-y rounded-md border border-[#E0E0E0] bg-white px-3 py-2.5 text-base text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#2D8CFF] sm:py-2 sm:text-sm dark:border-[#3D3D3D] dark:bg-[#1A1A1A] dark:text-[#F7F7F7]"
                />
              </label>
              <div className="grid grid-cols-1 gap-4">
                <label className="block text-sm text-[#747487]">
                  Date *
                  <input
                    type="date"
                    value={date}
                    min={todayDateString()}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#E0E0E0] bg-white px-3 py-2.5 text-base text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#2D8CFF] sm:py-2 sm:text-sm dark:border-[#3D3D3D] dark:bg-[#1A1A1A] dark:text-[#F7F7F7]"
                  />
                </label>
                <div className="block text-sm text-[#747487]">
                  <span>Start time *</span>
                  <div className="mt-1 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:grid-cols-[1fr_auto_1fr_auto]">
                    <select
                      value={hour}
                      onChange={(e) => setHour(e.target.value)}
                      aria-label="Hour"
                      className="min-w-0 w-full rounded-md border border-[#E0E0E0] bg-white px-2 py-2.5 text-base text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#2D8CFF] sm:py-2 sm:text-sm dark:border-[#3D3D3D] dark:bg-[#1A1A1A] dark:text-[#F7F7F7]"
                    >
                      <option value="">Hour</option>
                      {HOURS_12.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                    <span className="text-center text-[#747487]">:</span>
                    <select
                      value={minute}
                      onChange={(e) => setMinute(e.target.value)}
                      aria-label="Minute"
                      className="min-w-0 w-full rounded-md border border-[#E0E0E0] bg-white px-2 py-2.5 text-base text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#2D8CFF] sm:py-2 sm:text-sm dark:border-[#3D3D3D] dark:bg-[#1A1A1A] dark:text-[#F7F7F7]"
                    >
                      <option value="">Min</option>
                      {MINUTES.map((m) => (
                        <option key={m} value={m}>
                          {String(m).padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                    <select
                      value={period}
                      onChange={(e) => setPeriod(e.target.value as TimePeriod)}
                      aria-label="AM or PM"
                      className="col-span-3 w-full rounded-md border border-[#E0E0E0] bg-white px-2 py-2.5 text-base text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#2D8CFF] sm:col-span-1 sm:w-auto sm:min-w-[5rem] sm:py-2 sm:text-sm dark:border-[#3D3D3D] dark:bg-[#1A1A1A] dark:text-[#F7F7F7]"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>
              <label className="block text-sm text-[#747487]">
                Duration
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="mt-1 w-full rounded-md border border-[#E0E0E0] bg-white px-3 py-2.5 text-base text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#2D8CFF] sm:py-2 sm:text-sm dark:border-[#3D3D3D] dark:bg-[#1A1A1A] dark:text-[#F7F7F7]"
                >
                  {DURATIONS.map((m) => (
                    <option key={m} value={m}>
                      {m} minutes
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {error && (
              <p className="mt-3 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <div className="mt-6 flex flex-col-reverse gap-2 pb-safe sm:flex-row sm:justify-end sm:gap-3 sm:pb-0">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md px-4 py-3 text-sm font-medium text-[#747487] hover:bg-[#F7F7F7] dark:hover:bg-[#3D3D3D] sm:py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSchedule}
                disabled={submitting}
                className="rounded-md bg-[#0E71EB] px-4 py-3 text-sm font-medium text-white hover:bg-[#2D8CFF] disabled:opacity-60 sm:py-2"
              >
                {submitting ? "Scheduling…" : "Schedule"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
