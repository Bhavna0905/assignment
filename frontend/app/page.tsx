"use client";

import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ActionTiles from "@/components/ActionTiles";
import ApiStatusBanner from "@/components/ApiStatusBanner";
import DashboardSidebar, {
  type DashboardSection,
} from "@/components/DashboardSidebar";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import JoinModal from "@/components/JoinModal";
import MeetingList from "@/components/MeetingList";
import Navbar from "@/components/Navbar";
import ProfileCard from "@/components/ProfileCard";
import PromoBanner from "@/components/PromoBanner";
import ScheduleModal from "@/components/ScheduleModal";
import Toast from "@/components/Toast";
import UpcomingMeetingsCard from "@/components/UpcomingMeetingsCard";
import { api, setApiUserEmail } from "@/lib/api";
import { consumeFlash } from "@/lib/flash";
import type { Meeting, User } from "@/lib/types";

const MeetingsSection = dynamic(() => import("@/components/MeetingsSection"), {
  loading: () => <DashboardSkeleton />,
});

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [upcoming, setUpcoming] = useState<Meeting[]>([]);
  const [recent, setRecent] = useState<Meeting[]>([]);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [activeSection, setActiveSection] =
    useState<DashboardSection>("home");
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

  const bootstrap = useCallback(async () => {
    if (!session?.user?.email) return;

    setApiUserEmail(session.user.email);

    const synced = await api.syncUser({
      google_id: session.user.id ?? "",
      name: session.user.name ?? "User",
      email: session.user.email,
      avatar_url: session.user.image ?? undefined,
    });
    setUser(synced);
    const meetings = await api.getMeetings();
    setUpcoming(meetings.upcoming);
    setRecent(meetings.recent);
    setApiError(null);
  }, [session]);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.email) {
      return;
    }

    let cancelled = false;
    setBootstrapping(true);

    (async () => {
      try {
        await bootstrap();
      } catch (err) {
        if (!cancelled) {
          setApiError(
            err instanceof Error
              ? err.message
              : "Could not connect to the server."
          );
        }
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session, status, bootstrap]);

  const handleRetryApi = async () => {
    if (!session?.user?.email) return;
    setRetrying(true);
    try {
      await bootstrap();
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : "Could not connect to the server."
      );
    } finally {
      setRetrying(false);
    }
  };

  const handleNewMeeting = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const meeting = await api.createInstant();
      router.push(`/meeting/${meeting.meeting_code}`);
    } catch (err) {
      setFlash({
        message:
          err instanceof Error ? err.message : "Failed to create meeting.",
        variant: "error",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (code: string) => {
    try {
      const { ok } = await api.validateMeeting(code);
      if (!ok) {
        setFlash({ message: "Meeting not found", variant: "error" });
        return;
      }
      setJoinOpen(false);
      router.push(`/meeting/${code}`);
    } catch (err) {
      setFlash({
        message: err instanceof Error ? err.message : "Could not join meeting.",
        variant: "error",
      });
    }
  };

  const handleNavigate = useCallback((section: DashboardSection) => {
    setActiveSection(section);

    if (section === "scheduler") {
      setScheduleOpen(true);
    }
  }, []);

  const displayName = user?.name ?? session?.user?.name ?? "User";
  const displayEmail = user?.email ?? session?.user?.email;
  const displayAvatar = user?.avatar_url ?? session?.user?.image;
  const userKey = user?.id ?? session?.user?.email ?? "guest";

  const navProps = {
    onSchedule: () => {
      setActiveSection("meetings");
      setScheduleOpen(true);
    },
    onJoin: () => setJoinOpen(true),
    onHost: handleNewMeeting,
  };

  const isMeetingsView = activeSection === "meetings";
  const showHomeExtras = activeSection === "home";

  if (status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zoom-bg text-zoom-muted">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-zoom-bg text-zoom-text">
      <Navbar {...navProps} />
      {apiError && (
        <ApiStatusBanner
          message={apiError}
          onRetry={handleRetryApi}
          retrying={retrying}
        />
      )}
      {flash && (
        <Toast
          message={flash.message}
          variant={flash.variant}
          onDismiss={() => setFlash(null)}
        />
      )}

      <div className="flex flex-col pt-14 lg:flex-row lg:pt-[5.25rem]">
        <DashboardSidebar
          activeSection={activeSection}
          onNavigate={handleNavigate}
        />

        <div className="mx-auto flex min-w-0 w-full max-w-[1600px] flex-1 flex-col lg:flex-row">
          <main className="min-w-0 flex-1 px-3 py-5 pb-safe sm:px-6 sm:py-8">
            {isMeetingsView ? (
              <MeetingsSection
                displayName={displayName}
                userKey={userKey}
                upcoming={upcoming}
                recent={recent}
                onSchedule={() => setScheduleOpen(true)}
                onStartPersonalRoom={handleNewMeeting}
                startingPersonal={creating}
              />
            ) : (
              <>
                <ProfileCard
                  name={displayName}
                  email={displayEmail}
                  avatarUrl={displayAvatar}
                />

                {showHomeExtras && <PromoBanner />}

                <section id="dashboard-meetings" className="mt-8 scroll-mt-24">
                  <h2 className="mb-4 text-lg font-bold text-zoom-text">
                    Recent activity
                  </h2>
                  {bootstrapping ? (
                    <DashboardSkeleton />
                  ) : (
                    <MeetingList
                      upcoming={upcoming}
                      recent={recent}
                      hideUpcoming
                    />
                  )}
                </section>
              </>
            )}
          </main>

          {!isMeetingsView && (
            <aside className="w-full shrink-0 space-y-4 border-t border-zoom-border px-3 py-5 pb-safe sm:px-6 lg:w-[340px] lg:border-l lg:border-t-0 lg:py-8">
              <ActionTiles
                displayName={displayName}
                userKey={userKey}
                onNewMeeting={handleNewMeeting}
                onJoinMeeting={() => setJoinOpen(true)}
                onScheduleMeeting={() => setScheduleOpen(true)}
              />
              <UpcomingMeetingsCard upcoming={upcoming} />
            </aside>
          )}
        </div>
      </div>

      <JoinModal
        open={joinOpen}
        onClose={() => setJoinOpen(false)}
        onJoin={handleJoin}
      />

      <ScheduleModal
        open={scheduleOpen}
        onClose={() => {
          setScheduleOpen(false);
          if (activeSection === "scheduler") {
            setActiveSection("home");
          }
        }}
        onScheduled={async () => {
          try {
            await loadMeetings();
            setActiveSection("meetings");
          } catch (err) {
            setFlash({
              message:
                err instanceof Error
                  ? err.message
                  : "Meeting scheduled but list could not refresh.",
              variant: "error",
            });
            setActiveSection("meetings");
          }
        }}
      />
    </div>
  );
}
