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
    <div className="flex h-full min-h-0 w-full flex-1 flex-col gap-2 p-2 md:flex-row md:gap-2 md:p-3">
      <div className="min-h-[50vh] flex-1 overflow-hidden rounded-lg bg-black transition-all duration-300 md:min-h-0">
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
        />
      </div>
      <div className="flex h-[120px] shrink-0 flex-row gap-2 overflow-x-auto md:h-auto md:w-[120px] md:flex-col md:overflow-y-auto lg:w-[180px]">
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
  ) => <VideoTile key={key} small {...props} />;

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

  let gridClass =
    "grid h-full min-h-0 w-full flex-1 gap-2 p-2 sm:gap-3 sm:p-3 content-start sm:content-center items-stretch auto-rows-min sm:auto-rows-fr overflow-y-auto overscroll-contain";

  if (count === 1) {
    gridClass +=
      " grid-cols-1 place-items-center [&>*]:min-h-[min(50dvh,360px)] [&>*]:max-h-[70dvh] [&>*]:w-full [&>*]:max-w-3xl";
  } else if (count === 2) {
    gridClass +=
      " grid-cols-1 sm:grid-cols-2 [&>*]:min-h-[200px] sm:[&>*]:min-h-0";
  } else if (count <= 4) {
    gridClass += " grid-cols-2 [&>*]:min-h-[140px] sm:[&>*]:min-h-0";
  } else {
    gridClass +=
      " grid-cols-2 lg:grid-cols-3 [&>*]:min-h-[120px] sm:[&>*]:min-h-[140px]";
  }

  return (
    <div className={gridClass}>
      <VideoTile
        stream={localStream}
        name={localName}
        muted={isMuted}
        cameraOff={isCameraOff}
        isSharingScreen={isSharingScreen}
        isLocal
      />
      {Array.from(peers.entries()).map(([peerId, peer]) => (
        <VideoTile
          key={peerId}
          stream={peer.stream}
          name={peer.name}
          muted={peer.muted}
          cameraOff={peer.cameraOff}
          isSharingScreen={peer.screenSharing}
          isLocal={false}
          peerId={peerId}
          isPinned={pinnedPeerId === peerId}
          onTogglePin={onTogglePin}
          showPinMenu
        />
      ))}
    </div>
  );
}
