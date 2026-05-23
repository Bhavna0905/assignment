"use client";

import type { ReactNode } from "react";
import type { PeerState } from "@/hooks/useWebRTC";
import VideoTile from "./VideoTile";

interface VideoGridProps {
  localStream: MediaStream | null;
  localCameraStream: MediaStream | null;
  localName: string;
  isMuted: boolean;
  isCameraOff: boolean;
  isSharingScreen: boolean;
  screenStream: MediaStream | null;
  screenSharingPeerId: string | null;
  peers: Map<string, PeerState>;
  myPeerId?: string;
  pinnedPeerId?: string | null;
  onTogglePin?: (peerId: string) => void;
}

function getParticipantGridLayout(count: number): {
  className: string;
  itemClass: (index: number) => string;
} {
  const base =
    "grid h-full min-h-0 w-full max-w-full flex-1 gap-1.5 p-1.5 sm:gap-2 sm:p-2";

  switch (count) {
    case 1:
      return {
        className: `${base} grid-cols-1 grid-rows-1`,
        itemClass: () => "min-h-0 h-full w-full",
      };
    case 2:
      return {
        className: `${base} grid-cols-1 grid-rows-2 sm:grid-cols-2 sm:grid-rows-1`,
        itemClass: () => "min-h-0 h-full w-full",
      };
    case 3:
      return {
        className: `${base} grid-cols-2 grid-rows-2 sm:grid-cols-3 sm:grid-rows-1`,
        itemClass: (index) =>
          index === 2
            ? "col-span-2 min-h-0 h-full w-full sm:col-span-1"
            : "min-h-0 h-full w-full",
      };
    case 4:
      return {
        className: `${base} grid-cols-2 grid-rows-2`,
        itemClass: () => "min-h-0 h-full w-full",
      };
    case 5:
    case 6:
      return {
        className: `${base} grid-cols-2 grid-rows-3 sm:grid-cols-3 sm:grid-rows-2`,
        itemClass: () => "min-h-0 h-full w-full",
      };
    default:
      return {
        className: `${base} grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 auto-rows-fr`,
        itemClass: () => "min-h-0 h-full w-full min-h-[120px] sm:min-h-0",
      };
  }
}

function SpotlightLayout({
  mainStream,
  mainName,
  mainMuted,
  mainCameraOff,
  mainIsScreen,
  mainIsLocal,
  mainPeerId,
  mainIsPinned,
  sidebarTiles,
  onTogglePin,
}: {
  mainStream: MediaStream | null;
  mainName: string;
  mainMuted: boolean;
  mainCameraOff: boolean;
  mainIsScreen?: boolean;
  mainIsLocal: boolean;
  mainPeerId?: string;
  mainIsPinned?: boolean;
  sidebarTiles: ReactNode;
  onTogglePin?: (peerId: string) => void;
}) {
  return (
    <div className="flex h-full min-h-0 w-full max-w-full flex-1 flex-col gap-1.5 p-1.5 sm:flex-row sm:gap-2 sm:p-2">
      <div className="min-h-0 flex-1 overflow-hidden rounded-lg bg-black">
        <VideoTile
          stream={mainStream}
          name={mainName}
          muted={mainMuted}
          cameraOff={mainCameraOff}
          isScreen={mainIsScreen}
          isLocal={mainIsLocal}
          peerId={mainPeerId}
          isPinned={mainIsPinned}
          onTogglePin={onTogglePin}
          showPinMenu={!mainIsScreen && !mainIsLocal}
          fill
        />
      </div>
      <div className="flex h-[22dvh] max-h-[28dvh] shrink-0 flex-row gap-1.5 overflow-x-auto overscroll-x-contain sm:h-auto sm:max-h-none sm:w-[100px] sm:flex-col sm:overflow-y-auto md:w-[120px] lg:w-[160px]">
        {sidebarTiles}
      </div>
    </div>
  );
}

export default function VideoGrid({
  localStream,
  localCameraStream,
  localName,
  isMuted,
  isCameraOff,
  isSharingScreen,
  screenStream,
  screenSharingPeerId,
  peers,
  myPeerId = "",
  pinnedPeerId = null,
  onTogglePin,
}: VideoGridProps) {
  const count = peers.size + 1;
  const isLocalSharing = screenSharingPeerId === "local";
  const sharingPeer =
    screenSharingPeerId && !isLocalSharing
      ? peers.get(screenSharingPeerId)
      : null;

  const sidebarLocalStream = isSharingScreen
    ? localCameraStream ?? localStream
    : localStream;

  const renderSidebarTile = (
    key: string,
    props: React.ComponentProps<typeof VideoTile>
  ) => (
    <div
      key={key}
      className="h-full min-h-[88px] w-[min(42vw,140px)] shrink-0 sm:min-h-[72px] sm:w-full"
    >
      <VideoTile small fill {...props} />
    </div>
  );

  if (screenSharingPeerId) {
    const mainStream = isLocalSharing
      ? screenStream
      : sharingPeer?.stream ?? null;
    const mainName = isLocalSharing
      ? "Your Screen"
      : `${sharingPeer?.name ?? "Participant"}'s Screen`;

    return (
      <SpotlightLayout
        mainStream={mainStream}
        mainName={mainName}
        mainMuted={false}
        mainCameraOff={false}
        mainIsScreen
        mainIsLocal={isLocalSharing}
        sidebarTiles={
          <>
            {renderSidebarTile("local", {
              stream: sidebarLocalStream,
              name: localName,
              muted: isMuted,
              cameraOff: isCameraOff && !isSharingScreen,
              isLocal: true,
            })}
            {Array.from(peers.entries()).map(([peerId, peer]) => {
              const isSharer = peerId === screenSharingPeerId;
              return renderSidebarTile(peerId, {
                stream: isSharer ? null : peer.stream,
                name: peer.name,
                muted: peer.muted,
                cameraOff: isSharer || peer.cameraOff,
                isLocal: false,
                peerId,
                isPinned: pinnedPeerId === peerId,
                onTogglePin,
                showPinMenu: !isSharer,
              });
            })}
          </>
        }
        onTogglePin={onTogglePin}
      />
    );
  }

  if (pinnedPeerId) {
    const isPinnedLocal = Boolean(myPeerId && pinnedPeerId === myPeerId);
    const pinnedPeer = isPinnedLocal ? null : peers.get(pinnedPeerId);

    if (isPinnedLocal || pinnedPeer) {
      const mainStream = isPinnedLocal ? localStream : pinnedPeer?.stream ?? null;
      const mainName = isPinnedLocal ? localName : pinnedPeer?.name ?? "Participant";

      return (
        <SpotlightLayout
          mainStream={mainStream}
          mainName={mainName}
          mainMuted={isPinnedLocal ? isMuted : pinnedPeer?.muted ?? false}
          mainCameraOff={
            isPinnedLocal ? isCameraOff : pinnedPeer?.cameraOff ?? false
          }
          mainIsLocal={isPinnedLocal}
          mainPeerId={pinnedPeerId}
          mainIsPinned
          sidebarTiles={
            <>
              {!isPinnedLocal &&
                renderSidebarTile("local", {
                  stream: localStream,
                  name: localName,
                  muted: isMuted,
                  cameraOff: isCameraOff,
                  isSharingScreen: isSharingScreen,
                  isLocal: true,
                })}
              {Array.from(peers.entries()).map(([peerId, peer]) => {
                if (peerId === pinnedPeerId) return null;
                return renderSidebarTile(peerId, {
                  stream: peer.stream,
                  name: peer.name,
                  muted: peer.muted,
                  cameraOff: peer.cameraOff,
                  isSharingScreen: peer.screenSharing,
                  isLocal: false,
                  peerId,
                  onTogglePin,
                  showPinMenu: true,
                });
              })}
            </>
          }
          onTogglePin={onTogglePin}
        />
      );
    }
  }

  const { className: gridClass, itemClass } = getParticipantGridLayout(count);

  const tiles: React.ComponentProps<typeof VideoTile>[] = [
    {
      stream: localStream,
      name: localName,
      muted: isMuted,
      cameraOff: isCameraOff,
      isSharingScreen: isSharingScreen,
      isLocal: true,
      fill: true,
    },
    ...Array.from(peers.entries()).map(([peerId, peer]) => ({
      stream: peer.stream,
      name: peer.name,
      muted: peer.muted,
      cameraOff: peer.cameraOff,
      isSharingScreen: peer.screenSharing,
      isLocal: false,
      peerId,
      isPinned: pinnedPeerId === peerId,
      onTogglePin,
      showPinMenu: true,
      fill: true,
    })),
  ];

  return (
    <div className={gridClass}>
      {tiles.map((props, index) => (
        <div key={props.peerId ?? "local"} className={itemClass(index)}>
          <VideoTile {...props} />
        </div>
      ))}
    </div>
  );
}
