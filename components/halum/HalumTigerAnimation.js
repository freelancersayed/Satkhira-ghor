'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { TIGER_LOTTIE_STATES } from './halumLottieData';

// Dynamically import Lottie without SSR
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

/**
 * HalumTigerAnimation
 * Handles character states across the 4-step user journey:
 * - 'greeting' (Step 1): বাঘটি হাত নেড়ে মুচকি হাসবে (waving paw, cheerful wink, welcome greeting)
 * - 'listening' (Step 2): একটু সামনে ঝুঁকে কান খাড়া করে শোনার ভঙ্গি (perked ears, tilted head, curious wide eyes)
 * - 'dancing' / 'happy' (Step 3): খুশি হয়ে নাচবে, মধুর বোতলের দিকে আঙুল দিয়ে ইশারা করবে (celebration bounce, pointing paw, honey jar)
 * - 'saluting' (Step 4): স্যালুট করবে ও হাসবে (proud salute paw at brow, thank you posture)
 * - 'talking': Animated mouth speaking in sync with speech/typing
 * - 'idle': Gentle breathing & periodic blinking
 * 
 * Supports both high-fidelity SVG Vector animation and Lottie animation.
 */
export default function HalumTigerAnimation({
  state = 'idle',
  className = '',
  onClick,
  animationType = 'vector', // 'vector' | 'lottie'
}) {
  const [blink, setBlink] = useState(false);

  // Periodic natural blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 200);
    }, 4000);
    return () => clearInterval(blinkInterval);
  }, []);

  const isDancing = state === 'happy' || state === 'dancing';
  const isListening = state === 'listening';
  const isSaluting = state === 'saluting';
  const isGreeting = state === 'greeting';

  return (
    <div
      onClick={onClick}
      className={`relative select-none cursor-pointer group transition-transform duration-300 ${className} ${
        isDancing
          ? 'animate-bounce'
          : isListening
          ? '-rotate-3 scale-105'
          : isSaluting
          ? 'hover:scale-105'
          : 'hover:scale-105'
      }`}
      title="হালুম ভাই (Halum Bhai) - কথা বলতে ক্লিক করুন"
      aria-label="হালুম ভাই AI শপিং সহকারী"
    >
      {/* ── Glow / Backdrop Aura ── */}
      <div className={`absolute inset-0 rounded-full blur-md group-hover:blur-lg transition-all scale-105 ${
        isSaluting
          ? 'bg-gradient-to-tr from-emerald-400/50 via-teal-400/40 to-amber-300/40'
          : isDancing
          ? 'bg-gradient-to-tr from-amber-400/60 via-yellow-400/50 to-orange-400/40'
          : 'bg-gradient-to-tr from-amber-400/40 via-emerald-400/30 to-amber-300/40'
      }`} />

      {/* ── Tiger Character Vector Canvas (Crisp 2D Cartoon / Lottie) ── */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-b from-[#FEF3C7] to-[#FDE68A] p-1.5 shadow-xl border-2 border-[#FAB116] flex items-center justify-center overflow-hidden">
        {animationType === 'lottie' ? (
          <div className="w-full h-full flex items-center justify-center">
            <Lottie
              animationData={TIGER_LOTTIE_STATES[state] || TIGER_LOTTIE_STATES.idle}
              loop={true}
              autoplay={true}
              className="w-full h-full"
            />
          </div>
        ) : (
        <svg
          viewBox="0 0 120 120"
          className={`w-full h-full transform transition-transform duration-300 ${
            isListening ? 'translate-y-0.5 scale-105' : ''
          }`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background Forest Aura */}
          <circle cx="60" cy="60" r="54" fill="#FEF9E7" />

          {/* ── Tiger Ears ── */}
          {/* Left Ear - perked up high when listening */}
          <g className={`transition-transform duration-300 origin-[35px_30px] ${
            isListening
              ? '-rotate-12 translate-y-[-2px]'
              : state === 'talking'
              ? 'animate-pulse'
              : ''
          }`}>
            <circle cx="32" cy="30" r="14" fill="#E86A1E" stroke="#1F2937" strokeWidth="2.5" />
            <circle cx="32" cy="30" r="8" fill="#FCA5A5" />
          </g>
          {/* Right Ear - perked up when listening */}
          <g className={`transition-transform duration-300 origin-[85px_30px] ${
            isListening
              ? 'rotate-12 translate-y-[-2px]'
              : state === 'talking'
              ? 'animate-pulse'
              : ''
          }`}>
            <circle cx="88" cy="30" r="14" fill="#E86A1E" stroke="#1F2937" strokeWidth="2.5" />
            <circle cx="88" cy="30" r="8" fill="#FCA5A5" />
          </g>

          {/* ── Tiger Head ── */}
          <circle cx="60" cy="62" r="38" fill="#F59E0B" stroke="#1F2937" strokeWidth="2.5" />

          {/* ── Royal Bengal Tiger Stripes on Forehead ── */}
          <path d="M60 28 L60 38" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
          <path d="M52 32 L46 38" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M68 32 L74 38" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" />

          {/* Side Stripes (Cheeks) */}
          <path d="M26 56 L34 58" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M25 64 L33 64" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M94 56 L86 58" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M95 64 L87 64" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" />

          {/* White Muzzle/Cheeks */}
          <ellipse cx="48" cy="72" rx="14" ry="11" fill="#FFFFFF" />
          <ellipse cx="72" cy="72" rx="14" ry="11" fill="#FFFFFF" />

          {/* Rosy Cheeks */}
          <circle cx="36" cy="72" r="5" fill="#F87171" opacity="0.4" />
          <circle cx="84" cy="72" r="5" fill="#F87171" opacity="0.4" />

          {/* ── Eyes ── */}
          {blink ? (
            /* Closed Blinking Eyes */
            <>
              <path d="M42 56 Q48 62 54 56" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M66 56 Q72 62 78 56" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" fill="none" />
            </>
          ) : isDancing || isSaluting ? (
            /* Starry Happy Cheerful Eyes (Step 3 & 4) */
            <>
              <path d="M42 58 Q48 50 54 58" stroke="#1F2937" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              <path d="M66 58 Q72 50 78 58" stroke="#1F2937" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              <circle cx="48" cy="51" r="1.5" fill="#FAB116" />
              <circle cx="72" cy="51" r="1.5" fill="#FAB116" />
            </>
          ) : isGreeting ? (
            /* Winking Greeting Eye (Step 1) */
            <>
              <ellipse cx="48" cy="56" rx="6" ry="7" fill="#1F2937" />
              <circle cx="46" cy="54" r="2.5" fill="#FFFFFF" />
              <path d="M66 56 Q72 61 78 56" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" fill="none" />
            </>
          ) : isListening ? (
            /* Wide Curious Attentive Eyes (Step 2 - Listening pose) */
            <>
              <ellipse cx="48" cy="55" rx="6.5" ry="7.5" fill="#1F2937" />
              <circle cx="46" cy="53" r="2.8" fill="#FFFFFF" />
              <circle cx="50" cy="56" r="1.2" fill="#FFFFFF" />

              <ellipse cx="72" cy="55" rx="6.5" ry="7.5" fill="#1F2937" />
              <circle cx="70" cy="53" r="2.8" fill="#FFFFFF" />
              <circle cx="74" cy="56" r="1.2" fill="#FFFFFF" />
            </>
          ) : (
            /* Normal Friendly Eyes (Idle) */
            <>
              <ellipse cx="48" cy="56" rx="5.5" ry="6.5" fill="#1F2937" />
              <circle cx="46" cy="54" r="2.2" fill="#FFFFFF" />
              <circle cx="49.5" cy="57" r="1" fill="#FFFFFF" />

              <ellipse cx="72" cy="56" rx="5.5" ry="6.5" fill="#1F2937" />
              <circle cx="70" cy="54" r="2.2" fill="#FFFFFF" />
              <circle cx="73.5" cy="57" r="1" fill="#FFFFFF" />
            </>
          )}

          {/* Eyebrows */}
          <path
            d={isListening ? "M42 45 Q47 42 53 45" : "M43 47 Q48 45 53 47"}
            stroke="#1F2937"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d={isListening ? "M67 45 Q73 42 78 45" : "M67 47 Q72 45 77 47"}
            stroke="#1F2937"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* ── Cute Pink Tiger Nose ── */}
          <path d="M56 65 L64 65 L60 70 Z" fill="#E11D48" stroke="#1F2937" strokeWidth="1.5" strokeLinejoin="round" />

          {/* ── Mouth with Dynamic State ── */}
          {state === 'talking' ? (
            /* Open animated mouth */
            <g className="animate-pulse">
              <path d="M54 71 C54 78, 66 78, 66 71 Z" fill="#BE123C" stroke="#1F2937" strokeWidth="2" />
              <path d="M57 74 Q60 77 63 74" fill="#F43F5E" />
            </g>
          ) : isDancing || isSaluting ? (
            /* Big Joyful Smile (Step 3 & 4) */
            <path d="M51 71 Q60 82 69 71" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" fill="#BE123C" />
          ) : isListening ? (
            /* Attentive slight "O" listening mouth (Step 2) */
            <circle cx="60" cy="74" r="3" fill="#BE123C" stroke="#1F2937" strokeWidth="1.5" />
          ) : (
            /* Friendly Kitten/Tiger Smirk */
            <g>
              <path d="M60 70 L60 73" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
              <path d="M53 73 Q60 76 60 73 Q60 76 67 73" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* Whiskers */}
          <line x1="32" y1="70" x2="20" y2="68" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="32" y1="74" x2="20" y2="76" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="88" y1="70" x2="100" y2="68" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="88" y1="74" x2="100" y2="76" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />

          {/* ── Satkhira Ghor Green Bandana / Chef Scarf ── */}
          <path d="M38 90 C48 97, 72 97, 82 90 L85 96 C72 104, 48 104, 35 96 Z" fill="#016831" stroke="#014D24" strokeWidth="1.5" />
          <circle cx="60" cy="97" r="4.5" fill="#FAB116" stroke="#014D24" strokeWidth="1" />
          <path d="M58 96 L62 96 M60 94 L60 98" stroke="#1F2937" strokeWidth="1" strokeLinecap="round" />

          {/* ── Animated Gestures / Paws ── */}
          {/* Step 1: Greeting Waving Paw */}
          {isGreeting && (
            <g className="animate-bounce origin-[95px_85px]">
              <circle cx="95" cy="85" r="9" fill="#F59E0B" stroke="#1F2937" strokeWidth="2" />
              <circle cx="95" cy="87" r="4.5" fill="#FFFFFF" />
              {/* Paw pads */}
              <circle cx="90" cy="81" r="2" fill="#FFFFFF" />
              <circle cx="95" cy="79" r="2" fill="#FFFFFF" />
              <circle cx="100" cy="81" r="2" fill="#FFFFFF" />
            </g>
          )}

          {/* Step 3: Dancing & Pointing Paw towards Honey Jar / Order Button */}
          {isDancing && (
            <>
              {/* Honey Jar in Left Hand */}
              <g transform="translate(14, 74)">
                <rect x="0" y="4" width="16" height="18" rx="4" fill="#FAB116" stroke="#1F2937" strokeWidth="1.5" />
                <rect x="3" y="0" width="10" height="4" rx="2" fill="#E86A1E" stroke="#1F2937" strokeWidth="1.2" />
                <text x="3" y="16" fontSize="9" fill="#1F2937" fontWeight="bold">🍯</text>
              </g>

              {/* Pointing Paw on the Right */}
              <g className="animate-pulse origin-[92px_80px]">
                <circle cx="94" cy="82" r="8" fill="#F59E0B" stroke="#1F2937" strokeWidth="2" />
                {/* Pointing index finger */}
                <path d="M96 78 L104 74 L98 83" fill="#F59E0B" stroke="#1F2937" strokeWidth="1.5" strokeLinejoin="round" />
                <circle cx="92" cy="82" r="3" fill="#FFFFFF" />
                <text x="100" y="70" fontSize="8">✨</text>
              </g>
            </>
          )}

          {/* Step 4: Saluting Paw (স্যালুট করবে - Salute pose at forehead) */}
          {isSaluting && (
            <g className="origin-[85px_45px]">
              {/* Raised arm path towards forehead */}
              <path d="M88 75 Q96 60 90 44 L80 44" stroke="#F59E0B" strokeWidth="7" strokeLinecap="round" />
              <path d="M88 75 Q96 60 90 44 L80 44" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              {/* Saluting Paw at brow */}
              <ellipse cx="80" cy="44" rx="6" ry="4" fill="#F59E0B" stroke="#1F2937" strokeWidth="1.5" />
              <ellipse cx="80" cy="44" rx="3" ry="2" fill="#FFFFFF" />
              <text x="96" y="40" fontSize="10">🫡</text>
            </g>
          )}
        </svg>
        )}

        {/* Online Status Pill Badge */}
        <span className="absolute bottom-1 right-2 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-xs flex items-center justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
        </span>
      </div>

      {/* Halum Bhai Badge Name Pill */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#016831] text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md border border-[#FAB116] whitespace-nowrap flex items-center gap-1 group-hover:scale-105 transition-transform">
        <span>হালুম ভাই</span>
        <span className="text-[#FAB116]">🐯</span>
      </div>
    </div>
  );
}
