"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getWsBase } from "@/lib/env";
import type { MeetingParticipant } from "@/lib/types";

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

export type PeerState = {
  name: string;
  stream: MediaStream | null;
  muted: boolean;
  cameraOff: boolean;
};

export function useWebRTC(
  meetingCode: string,
  displayName: string,
  enabled: boolean,
  isMeetingHost = false,
  onKicked?: () => void
) {
  const router = useRouter();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<Map<string, PeerState>>(new Map());
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isHost, setIsHost] = useState(isMeetingHost);
  const [participants, setParticipants] = useState<MeetingParticipant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const onKickedRef = useRef(onKicked);
  const [connectAttempt, setConnectAttempt] = useState(0);

  const pcMap = useRef<Map<string, RTCPeerConnection>>(new Map());
  const myPeerIdRef = useRef<string>("");
  const wsRef = useRef<WebSocket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const isMutedRef = useRef(false);
  const isCameraOffRef = useRef(false);
  const isSharingScreenRef = useRef(false);
  const cameraTrackRef = useRef<MediaStreamTrack | null>(null);
  const screenTrackRef = useRef<MediaStreamTrack | null>(null);

  const cleanup = useCallback(() => {
    pcMap.current.forEach((pc) => pc.close());
    pcMap.current.clear();
    screenTrackRef.current?.stop();
    screenTrackRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    cameraTrackRef.current = null;
    setLocalStream(null);
    if (wsRef.current) {
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }
    setPeers(new Map());
    myPeerIdRef.current = "";
    isMutedRef.current = false;
    isCameraOffRef.current = false;
    isSharingScreenRef.current = false;
    setIsMuted(false);
    setIsCameraOff(false);
    setIsSharingScreen(false);
  }, []);

  const broadcastState = useCallback(() => {
    wsRef.current?.send(
      JSON.stringify({
        type: "state",
        muted: isMutedRef.current,
        cameraOff: isSharingScreenRef.current
          ? false
          : isCameraOffRef.current,
      })
    );
  }, []);

  const replaceVideoTrackOnPeers = useCallback(
    async (track: MediaStreamTrack | null) => {
      await Promise.all(
        Array.from(pcMap.current.values()).map(async (pc) => {
          const sender = pc
            .getSenders()
            .find((s) => s.track?.kind === "video");
          if (sender) {
            await sender.replaceTrack(track);
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

  const ready = enabled && !!meetingCode && !!displayName;

  useEffect(() => {
    onKickedRef.current = onKicked;
  }, [onKicked]);

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

        localStreamRef.current = stream;
        cameraTrackRef.current = stream.getVideoTracks()[0] ?? null;
        setLocalStream(stream);
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
              setIsHost(Boolean(data.isHost));
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
    screenTrack.stop();
    screenTrackRef.current = null;
    isSharingScreenRef.current = false;
    setIsSharingScreen(false);

    const stream = localStreamRef.current;
    const cameraTrack = cameraTrackRef.current;
    if (stream) {
      stream.removeTrack(screenTrack);
      if (cameraTrack) {
        stream.addTrack(cameraTrack);
        cameraTrack.enabled = !isCameraOffRef.current;
        await replaceVideoTrackOnPeers(cameraTrack);
      } else {
        await replaceVideoTrackOnPeers(null);
      }
      refreshLocalStream();
    }

    broadcastState();
  }, [broadcastState, refreshLocalStream, replaceVideoTrackOnPeers]);

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
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      const screenTrack = screenStream.getVideoTracks()[0];
      if (!screenTrack) {
        screenStream.getTracks().forEach((t) => t.stop());
        return;
      }

      const stream = localStreamRef.current;
      const cameraTrack = cameraTrackRef.current;
      if (!stream) {
        screenTrack.stop();
        return;
      }

      if (cameraTrack && stream.getVideoTracks().includes(cameraTrack)) {
        stream.removeTrack(cameraTrack);
      }

      stream.addTrack(screenTrack);
      screenTrackRef.current = screenTrack;
      isSharingScreenRef.current = true;
      setIsSharingScreen(true);

      await replaceVideoTrackOnPeers(screenTrack);
      refreshLocalStream();
      broadcastState();

      screenTrack.onended = () => {
        if (isSharingScreenRef.current) {
          void stopScreenShare();
        }
      };
    } catch (err) {
      const name = err instanceof Error ? err.name : "";
      if (name !== "NotAllowedError") {
        setError("Could not share screen. Please try again.");
      }
    }
  }, [
    broadcastState,
    refreshLocalStream,
    replaceVideoTrackOnPeers,
    stopScreenShare,
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
    peers,
    isMuted,
    isCameraOff,
    isSharingScreen,
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
  };
}
