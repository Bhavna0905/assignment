"use client";

import type { PeerState } from "@/hooks/useWebRTC";
import VideoTile from "./VideoTile";

interface VideoGridProps {
  localStream: MediaStream | null;
  localName: string;
  isMuted: boolean;
  isCameraOff: boolean;
  isSharingScreen: boolean;
  peers: Map<string, PeerState>;
}

export default function VideoGrid({
  localStream,
  localName,
  isMuted,
  isCameraOff,
  isSharingScreen,
  peers,
}: VideoGridProps) {
  const count = peers.size + 1;

  let gridClass =
    "grid h-full min-h-0 w-full flex-1 gap-2 p-2 sm:gap-3 sm:p-3 content-start sm:content-center items-stretch auto-rows-min sm:auto-rows-fr";

  if (count === 1) {
    gridClass +=
      " grid-cols-1 place-items-center [&>*]:min-h-[min(50dvh,360px)] [&>*]:max-h-[70dvh] [&>*]:w-full [&>*]:max-w-3xl";
  } else if (count === 2) {
    gridClass +=
      " grid-cols-1 min-[520px]:grid-cols-2 [&>*]:min-h-[200px] min-[520px]:[&>*]:min-h-0";
  } else if (count <= 4) {
    gridClass += " grid-cols-1 sm:grid-cols-2 [&>*]:min-h-[180px] sm:[&>*]:min-h-0";
  } else {
    gridClass +=
      " grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 [&>*]:min-h-[160px] sm:[&>*]:min-h-[140px]";
  }

  return (
    <div className={`${gridClass} overflow-y-auto overscroll-contain`}>
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
          isLocal={false}
        />
      ))}
    </div>
  );
}
