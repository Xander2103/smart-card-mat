let audioCtx = null;
let lastHoverAt = 0;

function getCtx() {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function tone({ freq = 440, type = 'sine', duration = 0.08, gain = 0.03, when = 0, attack = 0.005, release = 0.04 }) {
  const ctx = getCtx();
  if (!ctx) return 0;
  const now = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  amp.gain.setValueAtTime(0.0001, now);
  amp.gain.linearRampToValueAtTime(gain, now + attack);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + duration + release);
  osc.connect(amp);
  amp.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + release + 0.02);
  return duration + release;
}

export function playUiSound(name) {
  const ctx = getCtx();
  if (!ctx) return;

  if (name === 'hover') {
    const nowMs = Date.now();
    if (nowMs - lastHoverAt < 80) return;
    lastHoverAt = nowMs;
    tone({ freq: 720, type: 'sine', duration: 0.028, gain: 0.02, attack: 0.003, release: 0.022 });
    return;
  }

  if (name === 'click') {
    tone({ freq: 540, type: 'triangle', duration: 0.035, gain: 0.03, attack: 0.002, release: 0.028 });
    tone({ freq: 760, type: 'triangle', duration: 0.03, gain: 0.02, when: 0.015, attack: 0.002, release: 0.022 });
    return;
  }

  if (name === 'scan') {
    tone({ freq: 700, type: 'triangle', duration: 0.018, gain: 0.024, attack: 0.002, release: 0.015 });
    tone({ freq: 900, type: 'triangle', duration: 0.016, gain: 0.016, when: 0.02, attack: 0.002, release: 0.012 });
    return;
  }

  if (name === 'trickWin') {
    tone({ freq: 620, type: 'triangle', duration: 0.055, gain: 0.042 });
    tone({ freq: 880, type: 'triangle', duration: 0.07, gain: 0.034, when: 0.06 });
    return;
  }

  if (name === 'contractDone') {
    tone({ freq: 460, type: 'triangle', duration: 0.065, gain: 0.04 });
    tone({ freq: 580, type: 'triangle', duration: 0.065, gain: 0.032, when: 0.07 });
    tone({ freq: 760, type: 'triangle', duration: 0.075, gain: 0.03, when: 0.14 });
    return;
  }

  if (name === 'winner') {
    tone({ freq: 523.25, type: 'triangle', duration: 0.1, gain: 0.048 });
    tone({ freq: 659.25, type: 'triangle', duration: 0.1, gain: 0.046, when: 0.10 });
    tone({ freq: 783.99, type: 'triangle', duration: 0.11, gain: 0.044, when: 0.20 });
    tone({ freq: 1046.5, type: 'triangle', duration: 0.16, gain: 0.042, when: 0.32, release: 0.09 });
    return;
  }

  if (name === 'error') {
    tone({ freq: 240, type: 'sawtooth', duration: 0.05, gain: 0.032 });
    tone({ freq: 180, type: 'sawtooth', duration: 0.065, gain: 0.028, when: 0.05 });
    return;
  }

  if (name === 'disconnect') {
    tone({ freq: 300, type: 'sawtooth', duration: 0.055, gain: 0.036 });
    tone({ freq: 220, type: 'sawtooth', duration: 0.065, gain: 0.032, when: 0.06 });
    tone({ freq: 160, type: 'sawtooth', duration: 0.085, gain: 0.028, when: 0.13 });
  }
}
