"use client";

/**
 * Tiny synthesised UI sounds. Nothing is fetched — each cue is an oscillator
 * with a fast envelope, so there are no assets and no load delay.
 *
 * The context is created lazily inside a real interaction, which is what
 * browser autoplay policy requires.
 */

export type Sound = "nav" | "project" | "back";

type Voice = {
  type: OscillatorType;
  from: number;
  to: number;
  dur: number;
  gain: number;
  cutoff: number;
  /** Shortest gap between two of these, in ms. Hover fires a lot. */
  throttle: number;
};

const VOICES: Record<Sound, Voice> = {
  nav: { type: "triangle", from: 660, to: 880, dur: 0.055, gain: 0.05, cutoff: 2600, throttle: 40 },
  project: { type: "sine", from: 430, to: 540, dur: 0.05, gain: 0.04, cutoff: 2000, throttle: 90 },
  back: { type: "sine", from: 540, to: 300, dur: 0.1, gain: 0.05, cutoff: 1800, throttle: 40 },
};

const STORAGE_KEY = "ac.sound.muted";

let ctx: AudioContext | null = null;
let muted = false;
let hydrated = false;
const lastPlayed: Partial<Record<Sound, number>> = {};
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    muted = window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    /* private mode, blocked storage — stay unmuted */
  }
}

function context(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

export function play(sound: Sound) {
  hydrate();
  if (muted) return;

  const voice = VOICES[sound];
  const now = Date.now();
  if (now - (lastPlayed[sound] ?? 0) < voice.throttle) return;
  lastPlayed[sound] = now;

  const ac = context();
  if (!ac) return;

  const t = ac.currentTime;
  const osc = ac.createOscillator();
  const filter = ac.createBiquadFilter();
  const gain = ac.createGain();

  osc.type = voice.type;
  osc.frequency.setValueAtTime(voice.from, t);
  osc.frequency.exponentialRampToValueAtTime(voice.to, t + voice.dur);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(voice.cutoff, t);

  // Exponential ramps cannot touch zero, hence the near-silent floor.
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(voice.gain, t + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + voice.dur);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ac.destination);
  osc.start(t);
  osc.stop(t + voice.dur + 0.03);
}

export function isMuted() {
  hydrate();
  return muted;
}

export function setMuted(next: boolean) {
  hydrate();
  muted = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function subscribeMuted(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}
