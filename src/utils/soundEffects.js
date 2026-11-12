/**
 * Sound Effects Engine using Web Audio API
 * Built-in synthesis for wheel ticks, tension music, and winner fanfares.
 * Zero external audio file dependencies, works on any modern browser.
 */

let audioCtx = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

export const soundEffects = {
  // Mechanical tick sound when peg strikes the flapper
  playTick(volume = 0.25) {
    try {
      const ctx = getAudioContext()
      if (!ctx) return

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      // High click that drops rapidly (wood / plastic pin strike)
      osc.type = 'triangle'
      const freq = 700 + Math.random() * 250
      osc.frequency.setValueAtTime(freq, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.03)

      gain.gain.setValueAtTime(volume, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.035)
    } catch (e) {
      // Audio autoplay policy fail-safe
    }
  },

  // Atmospheric suspense tension music for 6+ second spin
  startSpinMusic(durationMs = 6000) {
    const ctx = getAudioContext()
    if (!ctx) return () => {}

    try {
      const now = ctx.currentTime
      const durationSec = durationMs / 1000

      // Master tension gain
      const masterGain = ctx.createGain()
      masterGain.gain.setValueAtTime(0.01, now)
      masterGain.gain.linearRampToValueAtTime(0.18, now + 0.5)
      masterGain.gain.linearRampToValueAtTime(0.22, now + durationSec - 1.2)
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + durationSec)
      masterGain.connect(ctx.destination)

      // Tension riser oscillators (sub bass + harmonic drone)
      const droneOsc = ctx.createOscillator()
      droneOsc.type = 'sawtooth'
      droneOsc.frequency.setValueAtTime(55, now) // A1
      droneOsc.frequency.exponentialRampToValueAtTime(110, now + durationSec)

      // Low pass filter to create rich cinematic swell
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(240, now)
      filter.frequency.exponentialRampToValueAtTime(1200, now + durationSec - 0.5)

      droneOsc.connect(filter)
      filter.connect(masterGain)
      droneOsc.start(now)
      droneOsc.stop(now + durationSec)

      // Rhythmic anticipation pulse
      const pulseInterval = 120 // ms
      let pulseTime = now
      while (pulseTime < now + durationSec - 0.4) {
        const pulseOsc = ctx.createOscillator()
        const pulseGain = ctx.createGain()
        pulseOsc.type = 'sine'
        pulseOsc.frequency.setValueAtTime(220, pulseTime)
        pulseOsc.frequency.exponentialRampToValueAtTime(80, pulseTime + 0.06)

        pulseGain.gain.setValueAtTime(0.12, pulseTime)
        pulseGain.gain.exponentialRampToValueAtTime(0.001, pulseTime + 0.06)

        pulseOsc.connect(pulseGain)
        pulseGain.connect(masterGain)
        pulseOsc.start(pulseTime)
        pulseOsc.stop(pulseTime + 0.07)

        // Accelerate pulse rhythm over time
        const elapsed = pulseTime - now
        const accel = Math.max(0.05, 0.16 - (elapsed / durationSec) * 0.09)
        pulseTime += accel
      }

      return () => {
        try {
          masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
          setTimeout(() => droneOsc.stop(), 120)
        } catch (_) {}
      }
    } catch (e) {
      return () => {}
    }
  },

  // Celebratory victory fanfare chime when winning player is selected
  playWinnerFanfare() {
    try {
      const ctx = getAudioContext()
      if (!ctx) return

      const now = ctx.currentTime
      // Major chord triad notes: C5, E5, G5, C6
      const chord = [523.25, 659.25, 783.99, 1046.5]

      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now + idx * 0.08)

        gain.gain.setValueAtTime(0.001, now + idx * 0.08)
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.04)
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 1.2)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + idx * 0.08)
        osc.stop(now + idx * 0.08 + 1.3)
      })
    } catch (e) {}
  },
}

