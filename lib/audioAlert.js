/**
 * Real-time Audio Engine for Admin Dashboard
 * Generates high-fidelity Cash Register chime & "Ka-Ching!" coins using Web Audio API
 * Fallback to HTML5 audio element (/sounds/cash-register.mp3)
 * Unlocks browser autoplay policy seamlessly on first user interaction.
 */

let audioCtx = null;
let isMutedState = false;
let isUnlocked = false;

export function initAudioOnUserGesture() {
  if (typeof window === 'undefined') return;

  const unlock = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        if (!audioCtx) {
          audioCtx = new AudioContextClass();
        }
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }
        isUnlocked = true;
      }
    } catch (e) {
      console.warn('AudioContext init warning:', e);
    }
  };

  ['click', 'touchstart', 'keydown'].forEach((eventName) => {
    window.addEventListener(eventName, unlock, { once: true, passive: true });
  });
}

/**
 * Synthesizes a crisp, celebratory cash-register "Ka-Ching!" sound
 */
export function playCashRegisterSound() {
  if (typeof window === 'undefined') return;
  if (isMutedState) return;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!audioCtx && AudioContextClass) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx) {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const now = audioCtx.currentTime;

      // 1. First Bell / Spring Strike (Mechanical Ding)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(987.77, now); // B5 note
      osc1.frequency.exponentialRampToValueAtTime(1318.51, now + 0.08); // E6 note

      gain1.gain.setValueAtTime(0.4, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // 2. High Shimmer Ring ("Ching!" high resonance)
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(2637.02, now + 0.07); // E7 high shimmer
      osc2.frequency.exponentialRampToValueAtTime(2093.00, now + 0.4);

      gain2.gain.setValueAtTime(0.001, now);
      gain2.gain.setValueAtTime(0.5, now + 0.07);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(now + 0.07);
      osc2.stop(now + 0.65);

      // 3. Coin Drop / Cash Register Drawer Slide (Rich Harmonic Texture)
      const osc3 = audioCtx.createOscillator();
      const gain3 = audioCtx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(1760.00, now + 0.12); // A6
      osc3.frequency.exponentialRampToValueAtTime(3520.00, now + 0.22); // A7

      gain3.gain.setValueAtTime(0.001, now);
      gain3.gain.setValueAtTime(0.35, now + 0.12);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc3.connect(gain3);
      gain3.connect(audioCtx.destination);
      osc3.start(now + 0.12);
      osc3.stop(now + 0.8);
      return;
    }
  } catch (err) {
    console.warn('Web Audio synthesis fallback:', err);
  }

  // HTML5 Audio Fallback
  try {
    const audio = new Audio('/sounds/cash-register.mp3');
    audio.volume = 0.8;
    audio.play().catch(() => {});
  } catch (e) {
    // Autoplay blocked
  }
}

export function setMuted(muted) {
  isMutedState = !!muted;
}

export function isMuted() {
  return isMutedState;
}
