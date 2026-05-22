"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  MOCK_NOTIFICATIONS,
  MOCK_USERS,
  type NavTab,
} from "@/lib/zoom-mock-data";

export type AppView = "main" | "meeting";
export type MeetingEntryMode = "with-video" | "without-video" | "screen-only";

export interface ZoomSettings {
  general: {
    startWithVideo: boolean;
    muteOnJoin: boolean;
    showMeetingTime: boolean;
  };
  video: {
    deviceId: string;
    mirrorVideo: boolean;
    hdVideo: boolean;
  };
  audio: {
    deviceId: string;
    suppressNoise: boolean;
  };
  shareScreen: {
    shareSound: boolean;
    optimizeForVideo: boolean;
  };
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  read: boolean;
  time: string;
}

const defaultSettings: ZoomSettings = {
  general: {
    startWithVideo: true,
    muteOnJoin: false,
    showMeetingTime: true,
  },
  video: {
    deviceId: "",
    mirrorVideo: true,
    hdVideo: true,
  },
  audio: {
    deviceId: "",
    suppressNoise: true,
  },
  shareScreen: {
    shareSound: true,
    optimizeForVideo: false,
  },
};

type OpenPanel =
  | null
  | "host"
  | "join"
  | "profile"
  | "notifications"
  | "settings";

interface ZoomState {
  signedIn: boolean;
  userId: string;
  activeTab: NavTab;
  appView: AppView;
  searchQuery: string;
  openPanel: OpenPanel;
  notifications: NotificationItem[];
  notificationsOpened: boolean;
  settings: ZoomSettings;
  meetingId: string;
  joinWithoutAudio: boolean;
  joinWithoutVideo: boolean;
  meetingEntryMode: MeetingEntryMode;
  meetingCode: string;
  inMeetingMuted: boolean;
  inMeetingVideoOff: boolean;
  inMeetingSharing: boolean;

  setSignedIn: (v: boolean) => void;
  setUserId: (id: string) => void;
  setActiveTab: (tab: NavTab) => void;
  setAppView: (view: AppView) => void;
  setSearchQuery: (q: string) => void;
  setOpenPanel: (panel: OpenPanel) => void;
  togglePanel: (panel: Exclude<OpenPanel, null>) => void;
  markNotificationsRead: () => void;
  updateSettings: (patch: Partial<ZoomSettings>) => void;
  patchSettingsSection: <K extends keyof ZoomSettings>(
    section: K,
    patch: Partial<ZoomSettings[K]>
  ) => void;
  setMeetingId: (id: string) => void;
  setJoinWithoutAudio: (v: boolean) => void;
  setJoinWithoutVideo: (v: boolean) => void;
  startMeeting: (mode: MeetingEntryMode, code?: string) => void;
  leaveMeeting: () => void;
  setInMeetingMuted: (v: boolean) => void;
  setInMeetingVideoOff: (v: boolean) => void;
  setInMeetingSharing: (v: boolean) => void;
  signOut: () => void;
  switchAccount: () => void;
}

export const useZoomStore = create<ZoomState>()(
  persist(
    (set, get) => ({
      signedIn: true,
      userId: MOCK_USERS[0].id,
      activeTab: "home",
      appView: "main",
      searchQuery: "",
      openPanel: null,
      notifications: MOCK_NOTIFICATIONS.map((n) => ({ ...n })),
      notificationsOpened: false,
      settings: defaultSettings,
      meetingId: "",
      joinWithoutAudio: false,
      joinWithoutVideo: false,
      meetingEntryMode: "with-video",
      meetingCode: "",
      inMeetingMuted: false,
      inMeetingVideoOff: false,
      inMeetingSharing: false,

      setSignedIn: (v) => set({ signedIn: v }),
      setUserId: (id) => set({ userId: id }),
      setActiveTab: (tab) => set({ activeTab: tab, openPanel: null }),
      setAppView: (view) => set({ appView: view }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      setOpenPanel: (panel) => set({ openPanel: panel }),
      togglePanel: (panel) =>
        set((s) => ({
          openPanel: s.openPanel === panel ? null : panel,
        })),
      markNotificationsRead: () =>
        set((s) => ({
          notificationsOpened: true,
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),
      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),
      patchSettingsSection: (section, patch) =>
        set((s) => ({
          settings: {
            ...s.settings,
            [section]: { ...s.settings[section], ...patch },
          },
        })),
      setMeetingId: (id) => set({ meetingId: id }),
      setJoinWithoutAudio: (v) => set({ joinWithoutAudio: v }),
      setJoinWithoutVideo: (v) => set({ joinWithoutVideo: v }),
      startMeeting: (mode, code) => {
        const s = get();
        set({
          appView: "meeting",
          openPanel: null,
          meetingEntryMode: mode,
          meetingCode: code ?? (s.meetingId || "443-691-0106"),
          inMeetingMuted: s.joinWithoutAudio || s.settings.general.muteOnJoin,
          inMeetingVideoOff:
            mode === "without-video" ||
            mode === "screen-only" ||
            s.joinWithoutVideo ||
            !s.settings.general.startWithVideo,
          inMeetingSharing: mode === "screen-only",
        });
      },
      leaveMeeting: () =>
        set({
          appView: "main",
          inMeetingMuted: false,
          inMeetingVideoOff: false,
          inMeetingSharing: false,
        }),
      setInMeetingMuted: (v) => set({ inMeetingMuted: v }),
      setInMeetingVideoOff: (v) => set({ inMeetingVideoOff: v }),
      setInMeetingSharing: (v) => set({ inMeetingSharing: v }),
      signOut: () =>
        set({
          signedIn: false,
          openPanel: null,
          appView: "main",
        }),
      switchAccount: () => {
        const next =
          get().userId === MOCK_USERS[0].id
            ? MOCK_USERS[1].id
            : MOCK_USERS[0].id;
        set({ userId: next, openPanel: null });
      },
    }),
    {
      name: "zoom-desktop-settings",
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);

export function useUnreadNotificationCount() {
  return useZoomStore((s) =>
    s.notificationsOpened
      ? 0
      : s.notifications.filter((n) => !n.read).length
  );
}

export function useCurrentUser() {
  const userId = useZoomStore((s) => s.userId);
  return MOCK_USERS.find((u) => u.id === userId) ?? MOCK_USERS[0];
}
