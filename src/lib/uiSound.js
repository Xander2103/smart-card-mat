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
    tone({ freq: 720, type: 'sine', duration: 0.025, gain: 0.012, attack: 0.003, release: 0.02 });
    return;
  }

  if (name === 'click') {
    tone({ freq: 540, type: 'triangle', duration: 0.03, gain: 0.018, attack: 0.002, release: 0.025 });
    tone({ freq: 760, type: 'triangle', duration: 0.028, gain: 0.012, when: 0.015, attack: 0.002, release: 0.02 });
    return;
  }

  if (name === 'trickWin') {
    tone({ freq: 620, type: 'triangle', duration: 0.05, gain: 0.028 });
    tone({ freq: 880, type: 'triangle', duration: 0.06, gain: 0.022, when: 0.06 });
    return;
  }

  if (name === 'contractDone') {
    tone({ freq: 460, type: 'triangle', duration: 0.06, gain: 0.026 });
    tone({ freq: 580, type: 'triangle', duration: 0.06, gain: 0.022, when: 0.07 });
    tone({ freq: 760, type: 'triangle', duration: 0.07, gain: 0.02, when: 0.14 });
    return;
  }

  if (name === 'winner') {
    tone({ freq: 523.25, type: 'triangle', duration: 0.09, gain: 0.03 });
    tone({ freq: 659.25, type: 'triangle', duration: 0.09, gain: 0.03, when: 0.10 });
    tone({ freq: 783.99, type: 'triangle', duration: 0.1, gain: 0.03, when: 0.20 });
    tone({ freq: 1046.5, type: 'triangle', duration: 0.14, gain: 0.028, when: 0.32, release: 0.08 });
    return;
  }

  if (name === 'error') {
    tone({ freq: 240, type: 'sawtooth', duration: 0.045, gain: 0.02 });
    tone({ freq: 180, type: 'sawtooth', duration: 0.06, gain: 0.018, when: 0.05 });
    return;
  }

  if (name === 'disconnect') {
    tone({ freq: 300, type: 'sawtooth', duration: 0.05, gain: 0.022 });
    tone({ freq: 220, type: 'sawtooth', duration: 0.06, gain: 0.02, when: 0.06 });
    tone({ freq: 160, type: 'sawtooth', duration: 0.08, gain: 0.018, when: 0.13 });
  }
}
