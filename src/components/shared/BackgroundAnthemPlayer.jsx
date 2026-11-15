import React, { useEffect, useRef } from 'react';

export const ANTHEM_AUDIO_URL =
  '/assets/aistudio/Jessie_Ware_-_Mirage__Don_t_Stop___Lyrics___XafRI1Np87c__874a844f.mp3';

// Perceived ~40% loudness across mobile (iOS/Android via Web Audio GainNode) & desktop
export const ANTHEM_GAIN = 0.22;

export function BackgroundAnthemPlayer() {
  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const sourceConnectedRef = useRef(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = ANTHEM_GAIN;
    audio.muted = false;
    audio.loop = true;

    const ensureWebAudioGain = () => {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx || !audioRef.current) return;

        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioCtx();
        }

        if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume().catch(() => {});
        }

        if (!sourceConnectedRef.current) {
          const source = audioCtxRef.current.createMediaElementSource(audioRef.current);
          const gainNode = audioCtxRef.current.createGain();
          gainNode.gain.value = ANTHEM_GAIN;
          source.connect(gainNode);
          gainNode.connect(audioCtxRef.current.destination);
          gainNodeRef.current = gainNode;
          sourceConnectedRef.current = true;
          // Keep element volume at 1.0 once GainNode controls attenuation so desktop doesn't double-attenuate
          audioRef.current.volume = 1.0;
        } else if (gainNodeRef.current) {
          gainNodeRef.current.gain.value = ANTHEM_GAIN;
        }
      } catch {
        // Fallback to standard HTMLAudioElement.volume if Web Audio is blocked
        if (audioRef.current) {
          audioRef.current.volume = ANTHEM_GAIN;
        }
      }
    };

    const enforceVolume = () => {
      if (!audioRef.current) return;
      if (sourceConnectedRef.current && gainNodeRef.current) {
        gainNodeRef.current.gain.value = ANTHEM_GAIN;
      } else {
        audioRef.current.volume = ANTHEM_GAIN;
      }
    };

    const tryPlay = () => {
      if (!audioRef.current) return;
      enforceVolume();
      audioRef.current.muted = false;
      audioRef.current.loop = true;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            ensureWebAudioGain();
            enforceVolume();
          })
          .catch(() => {
            // Will unlock on first user interaction
          });
      }
    };

    const handleUserGesture = () => {
      if (!audioRef.current) return;
      ensureWebAudioGain();
      enforceVolume();
      if (audioRef.current.paused) {
        tryPlay();
      }
    };

    audio.addEventListener('play', enforceVolume);
    audio.addEventListener('loadedmetadata', enforceVolume);

    tryPlay();

    window.addEventListener('pointerdown', handleUserGesture, { passive: true });
    window.addEventListener('pointerup', handleUserGesture, { passive: true });
    window.addEventListener('click', handleUserGesture, { passive: true });
    window.addEventListener('touchstart', handleUserGesture, { passive: true });
    window.addEventListener('touchend', handleUserGesture, { passive: true });
    window.addEventListener('keydown', handleUserGesture, { passive: true });

    return () => {
      audio.removeEventListener('play', enforceVolume);
      audio.removeEventListener('loadedmetadata', enforceVolume);
      window.removeEventListener('pointerdown', handleUserGesture);
      window.removeEventListener('pointerup', handleUserGesture);
      window.removeEventListener('click', handleUserGesture);
      window.removeEventListener('touchstart', handleUserGesture);
      window.removeEventListener('touchend', handleUserGesture);
      window.removeEventListener('keydown', handleUserGesture);
    };
  }, []);

  return (
    <audio
      ref={audioRef}
      src={ANTHEM_AUDIO_URL}
      loop
      autoPlay
      preload="auto"
    />
  );
}

export default BackgroundAnthemPlayer;
