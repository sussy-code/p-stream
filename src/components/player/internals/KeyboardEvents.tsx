import { useEffect, useRef, useState } from "react";

import { useCaptions } from "@/components/player/hooks/useCaptions";
import { useVolume } from "@/components/player/hooks/useVolume";
import { useOverlayRouter } from "@/hooks/useOverlayRouter";
import { useOverlayStack } from "@/stores/interface/overlayStack";
import { usePlayerStore } from "@/stores/player/store";
import { useSubtitleStore } from "@/stores/subtitles";
import { useEmpheralVolumeStore } from "@/stores/volume";

export function KeyboardEvents() {
  const router = useOverlayRouter("");
  const display = usePlayerStore((s) => s.display);
  const mediaProgress = usePlayerStore((s) => s.progress);
  const { isSeeking } = usePlayerStore((s) => s.interface);
  const mediaPlaying = usePlayerStore((s) => s.mediaPlaying);
  const time = usePlayerStore((s) => s.progress.time);
  const { setVolume, toggleMute } = useVolume();

  const { toggleLastUsed } = useCaptions();
  const setShowVolume = useEmpheralVolumeStore((s) => s.setShowVolume);
  const setDelay = useSubtitleStore((s) => s.setDelay);
  const delay = useSubtitleStore((s) => s.delay);
  const setShowDelayIndicator = useSubtitleStore(
    (s) => s.setShowDelayIndicator,
  );

  const [isRolling, setIsRolling] = useState(false);
  const volumeDebounce = useRef<ReturnType<typeof setTimeout> | undefined>();
  const subtitleDebounce = useRef<ReturnType<typeof setTimeout> | undefined>();

  const setCurrentOverlay = useOverlayStack((s) => s.setCurrentOverlay);

  const dataRef = useRef({
    setShowVolume,
    setVolume,
    toggleMute,
    setIsRolling,
    toggleLastUsed,
    display,
    mediaPlaying,
    mediaProgress,
    isSeeking,
    isRolling,
    time,
    router,
    setDelay,
    delay,
    setShowDelayIndicator,
    setCurrentOverlay,
  });
  useEffect(() => {
    dataRef.current = {
      setShowVolume,
      setVolume,
      toggleMute,
      setIsRolling,
      toggleLastUsed,
      display,
      mediaPlaying,
      mediaProgress,
      isSeeking,
      isRolling,
      time,
      router,
      setDelay,
      delay,
      setShowDelayIndicator,
      setCurrentOverlay,
    };
  }, [
    setShowVolume,
    setVolume,
    toggleMute,
    setIsRolling,
    toggleLastUsed,
    display,
    mediaPlaying,
    mediaProgress,
    isSeeking,
    isRolling,
    time,
    router,
    setDelay,
    delay,
    setShowDelayIndicator,
    setCurrentOverlay,
  ]);

  useEffect(() => {
    const keyEventHandler = (evt: KeyboardEvent) => {
      if (evt.target && (evt.target as HTMLInputElement).nodeName === "INPUT")
        return;

      const k = evt.key;
      const keyL = evt.key.toLowerCase();

      // Volume
      if (["ArrowUp", "ArrowDown", "m", "M"].includes(k)) {
        dataRef.current.setShowVolume(true);
        dataRef.current.setCurrentOverlay("volume");

        if (volumeDebounce.current) clearTimeout(volumeDebounce.current);
        volumeDebounce.current = setTimeout(() => {
          dataRef.current.setShowVolume(false);
          dataRef.current.setCurrentOverlay(null);
        }, 3e3);
      }
      if (k === "ArrowUp")
        dataRef.current.setVolume(
          (dataRef.current.mediaPlaying?.volume || 0) + 0.15,
        );
      if (k === "ArrowDown")
        dataRef.current.setVolume(
          (dataRef.current.mediaPlaying?.volume || 0) - 0.15,
        );
      if (keyL === "m") dataRef.current.toggleMute();

      // Video playback speed
      if (k === ">" || k === "<") {
        const options = [0.25, 0.5, 1, 1.5, 2];
        let idx = options.indexOf(dataRef.current.mediaPlaying?.playbackRate);
        if (idx === -1) idx = options.indexOf(1);
        const nextIdx = idx + (k === ">" ? 1 : -1);
        const next = options[nextIdx];
        if (next) dataRef.current.display?.setPlaybackRate(next);
      }

      // Video progress
      if (k === "ArrowRight")
        dataRef.current.display?.setTime(dataRef.current.time + 5);
      if (k === "ArrowLeft")
        dataRef.current.display?.setTime(dataRef.current.time - 5);
      if (keyL === "j")
        dataRef.current.display?.setTime(dataRef.current.time - 10);
      if (keyL === "l")
        dataRef.current.display?.setTime(dataRef.current.time + 10);
      if (k === "." && dataRef.current.mediaPlaying?.isPaused)
        dataRef.current.display?.setTime(dataRef.current.time + 1);
      if (k === "," && dataRef.current.mediaPlaying?.isPaused)
        dataRef.current.display?.setTime(dataRef.current.time - 1);

      // Utils
      if (keyL === "f") dataRef.current.display?.toggleFullscreen();
      if (k === " " || keyL === "k") {
        if (
          evt.target &&
          (evt.target as HTMLInputElement).nodeName === "BUTTON"
        ) {
          return;
        }

        const action = dataRef.current.mediaPlaying.isPaused ? "play" : "pause";
        dataRef.current.display?.[action]();
      }
      if (k === "Escape") dataRef.current.router.close();

      // captions
      if (keyL === "c") dataRef.current.toggleLastUsed().catch(() => {}); // ignore errors

      // Do a barrell roll!
      if (keyL === "r") {
        if (dataRef.current.isRolling || evt.ctrlKey || evt.metaKey) return;

        dataRef.current.setIsRolling(true);
        document.querySelector(".popout-location")?.classList.add("roll");
        document.body.setAttribute("data-no-scroll", "true");

        setTimeout(() => {
          document.querySelector(".popout-location")?.classList.remove("roll");
          document.body.removeAttribute("data-no-scroll");
          dataRef.current.setIsRolling(false);
        }, 1e3);
      }

      // Subtitle sync
      if (k === "[" || k === "]") {
        const change = k === "[" ? -0.5 : 0.5;
        dataRef.current.setDelay(dataRef.current.delay + change);
        dataRef.current.setShowDelayIndicator(true);
        dataRef.current.setCurrentOverlay("subtitle");

        if (subtitleDebounce.current) clearTimeout(subtitleDebounce.current);
        subtitleDebounce.current = setTimeout(() => {
          dataRef.current.setShowDelayIndicator(false);
          dataRef.current.setCurrentOverlay(null);
        }, 3000);
      }
    };
    window.addEventListener("keydown", keyEventHandler);

    return () => {
      window.removeEventListener("keydown", keyEventHandler);
    };
  }, []);

  return null;
}
