"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface MediaDeviceLists {
  videoInputs: MediaDeviceInfo[];
  audioInputs: MediaDeviceInfo[];
}

export function useMediaDevices(enabled = true) {
  const [devices, setDevices] = useState<MediaDeviceLists>({
    videoInputs: [],
    audioInputs: [],
  });
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled || typeof navigator === "undefined") return;
    try {
      const list = await navigator.mediaDevices.enumerateDevices();
      setDevices({
        videoInputs: list.filter((d) => d.kind === "videoinput"),
        audioInputs: list.filter((d) => d.kind === "audioinput"),
      });
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not list devices"
      );
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
    navigator.mediaDevices?.addEventListener("devicechange", refresh);
    return () => {
      navigator.mediaDevices?.removeEventListener("devicechange", refresh);
    };
  }, [refresh, enabled]);

  return { devices, error, refresh };
}

export function useCameraPreview(
  deviceId: string | undefined,
  enabled: boolean
) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<"idle" | "live" | "denied" | "error">(
    "idle"
  );

  useEffect(() => {
    if (!enabled) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setStatus("idle");
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        const constraints: MediaStreamConstraints = {
          video: deviceId ? { deviceId: { exact: deviceId } } : true,
          audio: false,
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setStatus("live");
      } catch (err) {
        if (cancelled) return;
        const name = err instanceof Error ? err.name : "";
        setStatus(name === "NotAllowedError" ? "denied" : "error");
      }
    };

    void run();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [deviceId, enabled]);

  return { videoRef, status };
}

export function useMicLevelMeter(deviceId: string | undefined, active: boolean) {
  const [level, setLevel] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active) {
      setLevel(0);
      return;
    }

    let cancelled = false;
    let stream: MediaStream | null = null;
    let audioCtx: AudioContext | null = null;

    const run = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: deviceId ? { deviceId: { exact: deviceId } } : true,
          video: false,
        });
        if (cancelled) return;

        audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);

        const tick = () => {
          if (cancelled) return;
          analyser.getByteFrequencyData(data);
          const avg = data.reduce((a, b) => a + b, 0) / data.length;
          setLevel(Math.min(100, Math.round((avg / 255) * 100 * 1.4)));
          rafRef.current = requestAnimationFrame(tick);
        };
        tick();
      } catch {
        if (!cancelled) setLevel(0);
      }
    };

    void run();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      stream?.getTracks().forEach((t) => t.stop());
      void audioCtx?.close();
      setLevel(0);
    };
  }, [deviceId, active]);

  return level;
}
