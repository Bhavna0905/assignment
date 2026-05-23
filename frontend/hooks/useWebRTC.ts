"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getWsBase } from "@/lib/env";
import { parseChatMessage, parseChatMessages } from "@/lib/chat";
import type { ChatMessage, MeetingParticipant } from "@/lib/types";

function buildIceServers(): RTCIceServer[] {
  const servers: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];
  const turnUrl = process.env.NEXT_PUBLIC_TURN_URL;
  const turnUser = process.env.NEXT_PUBLIC_TURN_USERNAME;
  const turnCred = process.env.NEXT_PUBLIC_TURN_CREDENTIAL;
  if (turnUrl && turnUser && turnCred) {
    servers.push({ urls: turnUrl, username: turnUser, credential: turnCred });
  }
  return servers;
}

const ICE_SERVERS = buildIceServers();

/** Chrome/Edge options that improve tab and window picking in the native share dialog. */
function getDisplayMediaOptions(): DisplayMediaStreamOptions {
  return {
    video: {
      width: { max: 1920 },
      height: { max: 1080 },
      frameRate: { max: 30 },
    },
    audio: false,
    preferCurrentTab: false,
    selfBrowserSurface: "exclude",
    surfaceSwitching: "include",
  } as DisplayMediaStreamOptions;
}

function buildLocalPreviewStream(
  videoTrack: MediaStreamTrack | null,
  audioTracks: MediaStreamTrack[]
): MediaStream | null {
  const tracks = [
    ...(videoTrack ? [videoTrack] : []),
    ...audioTracks.filter((t) => t.readyState === "live"),
  ];
  return tracks.length > 0 ? new MediaStream(tracks) : null;
}

export type PeerState = {
  name: string;
  stream: MediaStream | null;
  muted: boolean;
  cameraOff: boolean;
  screenSharing: boolean;
};

export function useWebRTC(
  meetingCode: string,
  displayName: string,
  enabled: boolean,
  isMeetingHost = false,
  onKicked?: () => void,
  chatPanelOpen = false
) {
  const router = useRouter();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<Map<string, PeerState>>(new Map());
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [localCameraStream, setLocalCameraStream] = useState<MediaStream | null>(
    null
  );
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(isMeetingHost);
  const [participants, setParticipants] = useState<MeetingParticipant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [chatError, setChatError] = useState<string | null>(null);
  const [myPeerId, setMyPeerId] = useState("");
  const onKickedRef = useRef(onKicked);
  const chatPanelOpenRef = useRef(chatPanelOpen);
  const [connectAttempt, setConnectAttempt] = useState(0);

  const pcMap = useRef<Map<string, RTCPeerConnection>>(new Map());
  const myPeerIdRef = useRef<string>("");
  const wsRef = useRef<WebSocket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const isMutedRef = useRef(false);
  const isCameraOffRef = useRef(false);
  const isSharingScreenRef = useRef(false);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const cameraTrackRef = useRef<MediaStreamTrack | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const screenTrackRef = useRef<MediaStreamTrack | null>(null);

  const cleanup = useCallback(() => {
    pcMap.current.forEach((pc) => pc.close());
    pcMap.current.clear();
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;
    screenTrackRef.current = null;
    cameraStreamRef.current?.getTracks().forEach((t) => t.stop());
    cameraStreamRef.current = null;
    localStreamRef.current = null;
    cameraTrackRef.current = null;
    setLocalStream(null);
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "leave-meeting-chat" }));
      }
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }
    setPeers(new Map());
    setChatMessages([]);
    setChatUnreadCount(0);
    setChatError(null);
    setMyPeerId("");
    myPeerIdRef.current = "";
    isMutedRef.current = false;
    isCameraOffRef.current = false;
    isSharingScreenRef.current = false;
    setIsMuted(false);
    setIsCameraOff(false);
    setIsSharingScreen(false);
    setScreenStream(null);
    setLocalCameraStream(null);
    setActiveSpeaker(null);
  }, []);

  const syncLocalCameraPreview = useCallback(() => {
    const cameraTrack = cameraTrackRef.current;
    const audioTracks = cameraStreamRef.current?.getAudioTracks() ?? [];
    const preview = buildLocalPreviewStream(cameraTrack, audioTracks);
    setLocalCameraStream(preview);
  }, []);

  const broadcastState = useCallback(() => {
    wsRef.current?.send(
      JSON.stringify({
        type: "state",
        muted: isMutedRef.current,
        cameraOff: isSharingScreenRef.current
          ? false
          : isCameraOffRef.current,
        screenSharing: isSharingScreenRef.current,
      })
    );
  }, []);

  const findVideoSender = (pc: RTCPeerConnection): RTCRtpSender | undefined =>
    pc.getSenders().find((s) => s.track?.kind === "video") ??
    pc.getTransceivers().find((t) => t.sender.track?.kind === "video")?.sender;

  const replaceVideoTrackOnPeers = useCallback(
    async (track: MediaStreamTrack | null) => {
      const streamForTrack =
        localStreamRef.current ??
        cameraStreamRef.current ??
        (track ? new MediaStream([track]) : null);

      await Promise.all(
        Array.from(pcMap.current.values()).map(async (pc) => {
          const sender = findVideoSender(pc);
          if (!sender) {
            if (track && streamForTrack) {
              pc.addTrack(track, streamForTrack);
            }
            return;
          }
          try {
            await sender.replaceTrack(track);
          } catch {
            if (track && streamForTrack) {
              try {
                pc.removeTrack(sender);
              } catch {
                /* sender may already be removed */
              }
              pc.addTrack(track, streamForTrack);
            }
          }
        })
      );
    },
    []
  );

  const refreshLocalStream = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    setLocalStream(new MediaStream(stream.getTracks()));
  }, []);

  const applyScreenSharePreview = useCallback(
    (screenTrack: MediaStreamTrack) => {
      const audioTracks = cameraStreamRef.current?.getAudioTracks() ?? [];
      const preview = buildLocalPreviewStream(screenTrack, audioTracks);
      if (preview) {
        localStreamRef.current = preview;
        setLocalStream(new MediaStream(preview.getTracks()));
      }
    },
    []
  );

  const restoreCameraPreview = useCallback(() => {
    const cameraTrack = cameraTrackRef.current;
    const audioTracks = cameraStreamRef.current?.getAudioTracks() ?? [];
    const preview = buildLocalPreviewStream(cameraTrack, audioTracks);
    if (preview) {
      localStreamRef.current = preview;
      setLocalStream(new MediaStream(preview.getTracks()));
    }
  }, []);

  const ready = enabled && !!meetingCode && !!displayName;

  useEffect(() => {
    onKickedRef.current = onKicked;
  }, [onKicked]);

  useEffect(() => {
    chatPanelOpenRef.current = chatPanelOpen;
    if (chatPanelOpen) {
      setChatUnreadCount(0);
    }
  }, [chatPanelOpen]);

  const appendChatMessage = useCallback((message: ChatMessage) => {
    setChatMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev;
      return [...prev, message];
    });
  }, []);

  const joinMeetingChat = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "join-meeting-chat" }));
    }
  }, []);

  const leaveMeetingChat = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "leave-meeting-chat" }));
    }
  }, []);

  const sendChatMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed || wsRef.current?.readyState !== WebSocket.OPEN) return;
    setChatError(null);
    wsRef.current.send(
      JSON.stringify({ type: "send-message", text: trimmed })
    );
  }, []);

  useEffect(() => {
    const list: MeetingParticipant[] = [];
    if (myPeerIdRef.current) {
      list.push({
        peerId: myPeerIdRef.current,
        name: displayName,
        isLocal: true,
        muted: isMuted,
      });
    }
    peers.forEach((peer, peerId) => {
      list.push({
        peerId,
        name: peer.name,
        isLocal: false,
        muted: peer.muted,
      });
    });
    setParticipants(list);
  }, [peers, displayName, isMuted]);

  useEffect(() => {
    if (isSharingScreen) {
      setActiveSpeaker("local");
      return;
    }
    for (const [peerId, peer] of peers) {
      if (peer.screenSharing) {
        setActiveSpeaker(peerId);
        return;
      }
    }
    setActiveSpeaker(null);
  }, [isSharingScreen, peers]);

  const applyForceMute = useCallback(() => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track || isMutedRef.current) return;
    track.enabled = false;
    isMutedRef.current = true;
    setIsMuted(true);
    wsRef.current?.send(
      JSON.stringify({
        type: "state",
        muted: true,
        cameraOff: isSharingScreenRef.current
          ? false
          : isCameraOffRef.current,
        screenSharing: isSharingScreenRef.current,
      })
    );
  }, []);

  useEffect(() => {
    if (!ready) return;

    let cancelled = false;
    const wsBase = getWsBase();

    const run = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        cameraStreamRef.current = stream;
        localStreamRef.current = stream;
        cameraTrackRef.current = stream.getVideoTracks()[0] ?? null;
        setLocalStream(stream);
        setLocalCameraStream(stream);
        setError(null);

        const hostParam = isMeetingHost ? "&is_host=true" : "";
        const wsUrl = `${wsBase}/ws/${encodeURIComponent(meetingCode)}?name=${encodeURIComponent(displayName)}${hostParam}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        const createPC = (peerId: string): RTCPeerConnection => {
          const existing = pcMap.current.get(peerId);
          if (existing) {
            existing.close();
            pcMap.current.delete(peerId);
          }

          const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
          const currentStream = localStreamRef.current;
          if (currentStream) {
            currentStream
              .getTracks()
              .forEach((t) => pc.addTrack(t, currentStream));
          }

          pc.ontrack = (e) => {
            setPeers((prev) => {
              const next = new Map(prev);
              const p = next.get(peerId);
              next.set(peerId, {
                name: p?.name ?? "",
                stream: e.streams[0] ?? null,
                muted: p?.muted ?? false,
                cameraOff: p?.cameraOff ?? false,
                screenSharing: p?.screenSharing ?? false,
              });
              return next;
            });
          };

          pc.onicecandidate = (e) => {
            if (
              e.candidate &&
              ws.readyState === WebSocket.OPEN &&
              !cancelled
            ) {
              ws.send(
                JSON.stringify({
                  type: "ice-candidate",
                  to: peerId,
                  candidate: e.candidate,
                })
              );
            }
          };

          pc.onconnectionstatechange = () => {
            if (pc.connectionState === "failed") {
              pc.restartIce();
            }
          };

          pcMap.current.set(peerId, pc);
          return pc;
        };

        ws.onerror = () => {
          if (!cancelled) {
            setError("Could not connect to meeting server");
          }
        };

        ws.onclose = () => {
          if (!cancelled && wsRef.current === ws) {
            setError("Disconnected from meeting server.");
          }
        };

        ws.onmessage = async (event) => {
          if (cancelled) return;
          const data = JSON.parse(event.data as string);

          switch (data.type) {
            case "self":
              myPeerIdRef.current = data.peerId;
              setMyPeerId(data.peerId);
              setIsHost(Boolean(data.isHost));
              joinMeetingChat();
              break;

            case "chat-history":
              setChatMessages(parseChatMessages(data.messages));
              break;

            case "receive-message": {
              const message = parseChatMessage(data.message);
              if (message) {
                appendChatMessage(message);
                if (
                  !chatPanelOpenRef.current &&
                  message.senderPeerId !== myPeerIdRef.current
                ) {
                  setChatUnreadCount((n) => n + 1);
                }
              }
              break;
            }

            case "chat-error":
              setChatError(
                typeof data.error === "string"
                  ? data.error
                  : "Could not send message"
              );
              break;

            case "existing-peers":
              // Mesh rule: the newcomer always initiates offers to each existing peer.
              // Existing peers only answer. This prevents glare (simultaneous conflicting offers)
              // since exactly one side per pair is always the offerer.
              for (const peer of data.peers) {
                setPeers((prev) =>
                  new Map(prev).set(peer.peerId, {
                    name: peer.name,
                    stream: null,
                    muted: peer.muted,
                    cameraOff: peer.cameraOff,
                    screenSharing: Boolean(peer.screenSharing),
                  })
                );
                const pc = createPC(peer.peerId);
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                ws.send(
                  JSON.stringify({
                    type: "offer",
                    to: peer.peerId,
                    sdp: pc.localDescription,
                  })
                );
              }
              break;

            case "peer-joined":
              // Existing peer: wait for the newcomer's offer — do not create an offer here.
              setPeers((prev) =>
                new Map(prev).set(data.peer.peerId, {
                  name: data.peer.name,
                  stream: null,
                  muted: false,
                  cameraOff: false,
                  screenSharing: false,
                })
              );
              break;

            case "offer": {
              const pc = createPC(data.from);
              await pc.setRemoteDescription(
                new RTCSessionDescription(data.sdp)
              );
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              ws.send(
                JSON.stringify({
                  type: "answer",
                  to: data.from,
                  sdp: pc.localDescription,
                })
              );
              break;
            }

            case "answer": {
              const pc = pcMap.current.get(data.from);
              if (pc) {
                await pc.setRemoteDescription(
                  new RTCSessionDescription(data.sdp)
                );
              }
              break;
            }

            case "ice-candidate": {
              const pc = pcMap.current.get(data.from);
              if (pc && data.candidate) {
                await pc
                  .addIceCandidate(new RTCIceCandidate(data.candidate))
                  .catch(() => {});
              }
              break;
            }

            case "peer-left": {
              pcMap.current.get(data.peerId)?.close();
              pcMap.current.delete(data.peerId);
              setPeers((prev) => {
                const next = new Map(prev);
                next.delete(data.peerId);
                return next;
              });
              break;
            }

            case "peer-state":
              setPeers((prev) => {
                const next = new Map(prev);
                const p = next.get(data.peerId);
                if (p) {
                  next.set(data.peerId, {
                    ...p,
                    muted: data.muted,
                    cameraOff: data.cameraOff,
                    screenSharing: Boolean(data.screenSharing),
                  });
                }
                return next;
              });
              break;

            case "force-mute":
              applyForceMute();
              break;

            case "kicked":
              cancelled = true;
              cleanup();
              onKickedRef.current?.();
              break;

            default:
              break;
          }
        };
      } catch (err) {
        if (!cancelled) {
          const name = err instanceof Error ? err.name : "";
          if (name === "NotAllowedError" || name === "PermissionDeniedError") {
            setError("Camera/mic access denied. Allow permissions and try again.");
          } else {
            setError("Could not start camera/microphone.");
          }
        }
      }
    };

    run();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [
    ready,
    meetingCode,
    displayName,
    isMeetingHost,
    connectAttempt,
    cleanup,
    applyForceMute,
    joinMeetingChat,
    appendChatMessage,
  ]);

  const muteAllParticipants = useCallback(() => {
    if (!isHost) return;
    wsRef.current?.send(JSON.stringify({ type: "host-mute-all" }));
  }, [isHost]);

  const removeParticipant = useCallback(
    (peerId: string) => {
      if (!isHost || peerId === myPeerIdRef.current) return;
      wsRef.current?.send(
        JSON.stringify({ type: "host-remove-peer", targetPeerId: peerId })
      );
    },
    [isHost]
  );

  const retry = useCallback(() => {
    cleanup();
    setError(null);
    setConnectAttempt((n) => n + 1);
  }, [cleanup]);

  const toggleMic = useCallback(() => {
    const stream = localStreamRef.current;
    const track = stream?.getAudioTracks()[0];
    if (!track) return;

    const nextMuted = !isMutedRef.current;
    track.enabled = !nextMuted;
    isMutedRef.current = nextMuted;
    setIsMuted(nextMuted);

    broadcastState();
  }, [broadcastState]);

  const stopScreenShare = useCallback(async () => {
    const screenTrack = screenTrackRef.current;
    if (!screenTrack) return;

    screenTrack.onended = null;
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;
    screenTrackRef.current = null;
    isSharingScreenRef.current = false;
    setIsSharingScreen(false);
    setScreenStream(null);

    const cameraTrack = cameraTrackRef.current;
    if (cameraTrack) {
      cameraTrack.enabled = !isCameraOffRef.current;
      restoreCameraPreview();
      await replaceVideoTrackOnPeers(cameraTrack);
    } else {
      restoreCameraPreview();
      await replaceVideoTrackOnPeers(null);
    }

    syncLocalCameraPreview();
    broadcastState();
  }, [
    broadcastState,
    replaceVideoTrackOnPeers,
    restoreCameraPreview,
    syncLocalCameraPreview,
  ]);

  const toggleCamera = useCallback(() => {
    if (isSharingScreenRef.current) return;

    const cameraTrack = cameraTrackRef.current;
    if (!cameraTrack) return;

    const nextCameraOff = !isCameraOffRef.current;
    cameraTrack.enabled = !nextCameraOff;
    isCameraOffRef.current = nextCameraOff;
    setIsCameraOff(nextCameraOff);
    broadcastState();
  }, [broadcastState]);

  const toggleScreenShare = useCallback(async () => {
    if (isSharingScreenRef.current) {
      await stopScreenShare();
      setShareError(null);
      return;
    }

    const remoteSharer = Array.from(peers.entries()).find(
      ([, p]) => p.screenSharing
    );
    if (remoteSharer) {
      setShareError("Someone is already sharing");
      return;
    }

    try {
      if (!cameraStreamRef.current) {
        setError("Camera not ready. Wait a moment and try again.");
        return;
      }

      setShareError(null);
      const displayStream =
        await navigator.mediaDevices.getDisplayMedia(getDisplayMediaOptions());
      const screenTrack = displayStream.getVideoTracks()[0];
      if (!screenTrack) {
        displayStream.getTracks().forEach((t) => t.stop());
        setError("No video track from shared source. Try another tab or window.");
        return;
      }

      if ("contentHint" in screenTrack) {
        try {
          screenTrack.contentHint = "detail";
        } catch {
          /* unsupported in some browsers */
        }
      }

      screenStreamRef.current = displayStream;
      screenTrackRef.current = screenTrack;
      isSharingScreenRef.current = true;
      setIsSharingScreen(true);
      setScreenStream(displayStream);
      syncLocalCameraPreview();
      setError(null);

      applyScreenSharePreview(screenTrack);
      await replaceVideoTrackOnPeers(screenTrack);
      broadcastState();

      screenTrack.onended = () => {
        if (isSharingScreenRef.current) {
          void stopScreenShare();
        }
      };
    } catch (err) {
      const name = err instanceof Error ? err.name : "";
      if (name === "NotAllowedError" || name === "AbortError") {
        return;
      }
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Could not share screen. Pick a tab in the list, then click Share."
      );
    }
  }, [
    applyScreenSharePreview,
    broadcastState,
    peers,
    replaceVideoTrackOnPeers,
    stopScreenShare,
    syncLocalCameraPreview,
  ]);

  const leave = useCallback(async () => {
    if (isSharingScreenRef.current) {
      await stopScreenShare();
    }
    cleanup();
    router.push("/");
  }, [cleanup, router, stopScreenShare]);

  const canRetry =
    !!error &&
    (error.includes("meeting server") ||
      error.includes("Disconnected from meeting server"));

  return {
    localStream,
    localCameraStream,
    peers,
    isMuted,
    isCameraOff,
    isSharingScreen,
    isScreenSharing: isSharingScreen,
    screenStream,
    activeSpeaker,
    shareError,
    clearShareError: () => setShareError(null),
    isHost,
    participants,
    muteAllParticipants,
    removeParticipant,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    leave,
    error,
    retry,
    canRetry,
    myPeerId,
    chatMessages,
    chatUnreadCount,
    chatError,
    sendChatMessage,
    clearChatUnread: () => setChatUnreadCount(0),
  };
}
