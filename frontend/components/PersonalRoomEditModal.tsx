"use client";

import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import type { PersonalRoomSettings } from "@/lib/personal-room";

interface PersonalRoomEditModalProps {
  open: boolean;
  initial: PersonalRoomSettings;
  meetingIdDisplay: string;
  onClose: () => void;
  onSave: (settings: PersonalRoomSettings) => void;
}

export default function PersonalRoomEditModal({
  open,
  initial,
  meetingIdDisplay,
  onClose,
  onSave,
}: PersonalRoomEditModalProps) {
  const [topic, setTopic] = useState(initial.topic);
  const [passcode, setPasscode] = useState(initial.passcode);
  const [waitingRoom, setWaitingRoom] = useState(initial.waitingRoom);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setTopic(initial.topic);
    setPasscode(initial.passcode);
    setWaitingRoom(initial.waitingRoom);
    setError("");
  }, [open, initial]);

  if (!open) return null;

  const handleSave = () => {
    const trimmedTopic = topic.trim();
    if (!trimmedTopic) {
      setError("Topic is required.");
      return;
    }
    const trimmedPasscode = passcode.trim();
    if (trimmedPasscode.length < 4) {
      setError("Passcode must be at least 4 characters.");
      return;
    }
    if (trimmedPasscode.length > 32) {
      setError("Passcode must be 32 characters or fewer.");
      return;
    }
    onSave({
      topic: trimmedTopic,
      passcode: trimmedPasscode,
      waitingRoom,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center md:bg-black/50 md:p-4">
      <div
        className="flex max-h-[92dvh] w-full flex-col overflow-y-auto bg-zoom-card text-zoom-text shadow-zoom-md md:max-h-none md:max-w-lg md:rounded-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-pmi-title"
      >
        <div className="border-b border-zoom-border px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="mb-3 flex items-center gap-2 text-sm text-zoom-primary hover:underline md:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Meetings
          </button>
          <h2
            id="edit-pmi-title"
            className="text-lg font-bold text-zoom-text sm:text-xl"
          >
            Edit &apos;{initial.topic}&apos;
          </h2>
          <p className="mt-1 text-sm text-zoom-muted">
            Personal Meeting ID:{" "}
            <span className="font-mono text-zoom-text">{meetingIdDisplay}</span>
          </p>
        </div>

        <div className="space-y-5 px-4 py-5 sm:px-6">
          <label className="block text-sm font-semibold text-zoom-text">
            Topic
            <input
              type="text"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                setError("");
              }}
              className="zoom-input mt-1 min-h-[44px] w-full text-base"
              placeholder="Personal Meeting Room"
            />
          </label>

          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-zoom-text">
              Security
            </legend>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={passcode.length > 0}
                onChange={(e) => {
                  if (!e.target.checked) setPasscode("");
                  else if (!passcode) setPasscode("123456");
                }}
                className="mt-1 h-4 w-4 rounded border-zoom-border text-zoom-primary focus:ring-zoom-primary"
              />
              <span className="flex-1 text-sm text-zoom-muted">
                <span className="font-medium text-zoom-text">Passcode</span>
                <input
                  type="text"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setError("");
                  }}
                  className="zoom-input mt-2 w-full font-mono text-base"
                  placeholder="Enter passcode"
                  autoComplete="off"
                />
                <span className="mt-1 block text-xs">
                  Only users who have the invite link or passcode can join the
                  meeting
                </span>
              </span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={waitingRoom}
                onChange={(e) => setWaitingRoom(e.target.checked)}
                className="h-4 w-4 rounded border-zoom-border text-zoom-primary focus:ring-zoom-primary"
              />
              <span className="text-sm text-zoom-muted">
                <span className="font-medium text-zoom-text">Waiting room</span>
                <span className="mt-0.5 block text-xs">
                  Only users admitted by the host can join the meeting
                </span>
              </span>
            </label>
          </fieldset>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="mt-auto flex flex-col-reverse gap-2 border-t border-zoom-border px-4 py-4 sm:flex-row sm:justify-start sm:gap-3 sm:px-6">
          <button type="button" onClick={handleSave} className="zoom-btn-primary">
            Save
          </button>
          <button
            type="button"
            onClick={onClose}
            className="zoom-btn-outline"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
