"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ActionTiles from "@/components/ActionTiles";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import JoinModal from "@/components/JoinModal";
import MeetingList from "@/components/MeetingList";
import Navbar from "@/components/Navbar";
import ScheduleModal from "@/components/ScheduleModal";
import Toast from "@/components/Toast";
import { api, setApiUserEmail } from "@/lib/api";
import { consumeFlash } from "@/lib/flash";
import type { Meeting, User } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [upcoming, setUpcoming] = useState<Meeting[]>([]);
  const [recent, setRecent] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinOpen, setJoinOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [flash, setFlash] = useState<{
    message: string;
    variant: "error" | "success" | "info";
  } | null>(null);

  useEffect(() => {
    document.title = "Dashboard | Zoom Clone";
    const message = consumeFlash();
    if (message) {
      setFlash({ message: message.message, variant: message.type });
    }
  }, []);

  const loadMeetings = useCallback(async () => {
    const meetings = await api.getMeetings();
    setUpcoming(meetings.upcoming);
    setRecent(meetings.recent);
  }, []);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.email) {
      setLoading(false);
      return;
    }

    setApiUserEmail(session.user.email);

    api
      .syncUser({
        google_id: session.user.id ?? "",
        name: session.user.name ?? "User",
        email: session.user.email,
        avatar_url: session.user.image ?? undefined,
      })
      .then((synced) => {
        setUser(synced);
        return loadMeetings();
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session, status, loadMeetings]);

  const handleNewMeeting = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const meeting = await api.createInstant();
      router.push(`/meeting/${meeting.meeting_code}`);
    } catch {
      alert("Failed to create meeting. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (code: string) => {
    const { ok } = await api.validateMeeting(code);
    if (!ok) {
      alert("Meeting not found");
      return;
    }
    setJoinOpen(false);
    router.push(`/meeting/${code}`);
  };

  const greeting = user
    ? `Good morning, ${user.name}`
    : session?.user?.name
      ? `Good morning, ${session.user.name}`
      : "Zoom";

  if (status === "loading" || loading) {
    return (
      <>
        <Navbar />
        {flash && (
          <Toast
            message={flash.message}
            variant={flash.variant}
            onDismiss={() => setFlash(null)}
          />
        )}
        <main className="min-h-dvh bg-[#F7F7F7] pt-14 dark:bg-[#1A1A1A]">
          <div className="mx-auto w-full max-w-5xl px-3 py-5 pb-safe sm:px-6 sm:py-10 lg:max-w-6xl">
            <div className="mb-6 h-8 w-48 max-w-full animate-pulse rounded bg-[#E8E8ED] dark:bg-[#3D3D3D] sm:mb-8 sm:h-9 sm:w-64" />
            <div className="grid grid-cols-3 gap-3 sm:gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <div className="h-24 w-24 animate-pulse rounded-2xl bg-[#E8E8ED] dark:bg-[#3D3D3D] sm:h-28 sm:w-28" />
                  <div className="h-4 w-16 animate-pulse rounded bg-[#E8E8ED] dark:bg-[#3D3D3D]" />
                </div>
              ))}
            </div>
            <DashboardSkeleton />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      {flash && (
        <Toast
          message={flash.message}
          variant={flash.variant}
          onDismiss={() => setFlash(null)}
        />
      )}
      <main className="min-h-dvh bg-[#F7F7F7] pt-14 dark:bg-[#1A1A1A]">
        <div className="mx-auto w-full max-w-5xl px-3 py-5 pb-safe sm:px-6 sm:py-10 lg:max-w-6xl">
          <h1 className="mb-5 break-words text-lg font-semibold leading-snug text-[#1A1A1A] dark:text-[#F7F7F7] sm:mb-8 sm:text-2xl md:text-3xl">
            {greeting}
          </h1>

          <ActionTiles
            onNewMeeting={handleNewMeeting}
            onJoinMeeting={() => setJoinOpen(true)}
            onScheduleMeeting={() => setScheduleOpen(true)}
          />

          <MeetingList upcoming={upcoming} recent={recent} />
        </div>
      </main>

      <JoinModal
        open={joinOpen}
        onClose={() => setJoinOpen(false)}
        onJoin={handleJoin}
      />

      <ScheduleModal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        onScheduled={() => {
          loadMeetings();
        }}
      />
    </>
  );
}
