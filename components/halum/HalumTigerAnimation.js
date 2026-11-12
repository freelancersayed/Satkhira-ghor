'use client';

import { useState, useEffect } from 'react';

/**
 * HalumTigerAnimation (হালুম ভাই - ২.৫ডি অন-স্ক্রিন শুভঙ্কর)
 *
 * True 2.5D Mascot Character for Satkhira Ghor.
 * Expressive full-body cartoon tiger companion with:
 * - Animated tail wagging
 * - Dynamic arm gestures (pointing paw, honey jar praising, cheering, waving, saluting)
 * - 3D volumetric gradients, ground contact shadow, and ambient depth
 * - Pointing finger indicator for on-screen DOM targets
 */
export default function HalumTigerAnimation({
  state = 'idle',
  className = '',
  onClick,
  isMinimized = false,
  pointDirection = 'right', // 'left' | 'right' | 'down'
}) {
  const [blink, setBlink] = useState(false);

  // Periodic natural eye blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 180);
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, []);

  const isPointing = state === 'pointing';
  const isPraising = state === 'praising';
  const isDancing = state === 'happy' || state === 'dancing';
  const isListening = state === 'listening';
  const isSaluting = state === 'saluting';
  const isGreeting = state === 'greeting';
  const isTalking = state === 'talking';

  if (isMinimized) {
    return (
      <div
        onClick={onClick}
        className="relative group cursor-pointer select-none transition-transform duration-300 hover:scale-110"
        title="হালুম ভাই - বড় করতে ক্লিক করুন 🐯"
        aria-label="হালুম ভাই শপিং সহকারী"
      >
        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 via-[#FAB116] to-yellow-300 p-1 shadow-xl border-2 border-white flex items-center justify-center animate-pulse">
          <span className="text-2xl drop-shadow-md">🐯</span>
        </div>
        <div className="absolute -bottom-1 -right-1 bg-[#016831] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border border-white shadow">
          হালুম
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`relative select-none cursor-pointer group transition-all duration-500 ${className} ${
        isDancing
          ? 'animate-bounce'
          : isPointing
          ? 'hover:scale-105'
          : isPraising
          ? 'scale-105'
          : isListening
          ? '-rotate-2 scale-105'
          : 'hover:scale-105'
      }`}
      title="হালুম ভাই (Halum Bhai) - কথা বলতে বা অর্ডার গাইড পেতে ক্লিক করুন 🐯"
      aria-label="হালুম ভাই AI শপিং সহকারী"
    >
      {/* ── 3D Ambient Aura / Glow Behind Character ── */}
      <div
        className={`absolute inset-0 rounded-full blur-xl transition-all duration-500 scale-90 -z-10 ${
          isPointing
            ? 'bg-amber-400/50 animate-pulse'
            : isDancing || isPraising
            ? 'bg-gradient-to-tr from-amber-400/60 via-yellow-300/50 to-emerald-400/40'
            : isSaluting
            ? 'bg-gradient-to-tr from-emerald-400/50 via-teal-400/40 to-amber-300/40'
            : 'bg-amber-400/30'
        }`}
      />

      {/* ── Pointing Finger Tooltip Tag (When pointing at an actionable button) ── */}
      {isPointing && (
        <div className={`absolute -top-7 ${
          pointDirection === 'left' ? '-left-6' : '-right-6'
        } z-20 pointer-events-none flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[10px] sm:text-[11px] px-2.5 py-1 rounded-full shadow-lg border border-amber-200 animate-bounce whitespace-nowrap`}>
          <span>{pointDirection === 'left' ? '👈' : '👉'}</span>
          <span>এখানে থাবা বসাও!</span>
        </div>
      )}

      {/* ── Full 2.5D Mascot Vector Canvas (Not clipped in a circle!) ── */}
      <div className="w-28 sm:w-36 h-36 sm:h-44 relative flex items-center justify-center">
        <svg
          viewBox="0 0 140 170"
          className="w-full h-full overflow-visible drop-shadow-xl"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* 3D Fur Body Gradient (Warm Golden Orange with Dimensional Shading) */}
            <linearGradient id="halumFur" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="45%" stopColor="#F59E0B" />
              <stop offset="85%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>

            {/* 3D Highlight for Top of Head & Cheeks */}
            <radialGradient id="halumHighlight" cx="40%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#F59E0B" stopOpacity="0" />
            </radialGradient>

            {/* Cream Belly & Muzzle Gradient */}
            <linearGradient id="halumCream" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="80%" stopColor="#FEF3C7" />
              <stop offset="100%" stopColor="#FDE68A" />
            </linearGradient>

            {/* Satkhira Ghor Forest Ranger Scarf Gradient */}
            <linearGradient id="halumBandana" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#02833E" />
              <stop offset="60%" stopColor="#016831" />
              <stop offset="100%" stopColor="#014D24" />
            </linearGradient>

            {/* Honey Jar Golden Honey Gradient */}
            <linearGradient id="halumHoney" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="40%" stopColor="#FAB116" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            {/* 3D Contact Floor Shadow Filter */}
            <filter id="halumContactShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" />
            </filter>

            {/* Dynamic CSS Keyframes inside SVG */}
            <style>
              {`
                @keyframes halumTail {
                  0%, 100% { transform: rotate(0deg); }
                  50% { transform: rotate(-18deg); }
                }
                .halum-tail-anim {
                  transform-origin: 35px 125px;
                  animation: halumTail 2.6s ease-in-out infinite;
                }
                @keyframes halumPawWave {
                  0%, 100% { transform: rotate(0deg); }
                  50% { transform: rotate(16deg); }
                }
                .halum-paw-wave {
                  transform-origin: 105px 70px;
                  animation: halumPawWave 1s ease-in-out infinite;
                }
                @keyframes halumPointArm {
                  0%, 100% { transform: scale(1); }
                  50% { transform: scale(1.08) translateX(${pointDirection === 'left' ? '-3px' : '3px'}); }
                }
                .halum-point-arm {
                  transform-origin: ${pointDirection === 'left' ? '30px 85px' : '110px 85px'};
                  animation: halumPointArm 0.9s ease-in-out infinite;
                }
                @keyframes halumHoneyGlow {
                  0%, 100% { filter: drop-shadow(0 0 2px #FAB116); }
                  50% { filter: drop-shadow(0 0 7px #FAB116); }
                }
                .halum-honey-glow {
                  animation: halumHoneyGlow 1.8s ease-in-out infinite;
                }
              `}
            </style>
          </defs>

          {/* ── 1. Ground Contact Shadow (3D Depth Grounding) ── */}
          <ellipse
            cx="70"
            cy="158"
            rx={isDancing ? '28' : '42'}
            ry={isDancing ? '4.5' : '7.5'}
            fill="#000000"
            opacity="0.22"
            filter="url(#halumContactShadow)"
            className="transition-all duration-300"
          />

          {/* ── 2. Striped Wagging Tiger Tail ── */}
          <g className="halum-tail-anim">
            {/* Tail curve behind body */}
            <path
              d="M38 128 C20 120 10 95 22 75 C26 68 35 68 34 76 C31 89 36 106 48 118"
              fill="url(#halumFur)"
              stroke="#1E293B"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Tail black stripes */}
            <path d="M22 108 L28 114" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M16 93 L24 96" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M18 80 L25 82" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
            {/* Fluffy black tail tip */}
            <path
              d="M24 73 C26 68 35 68 34 76 C32 80 29 80 24 73 Z"
              fill="#1E293B"
            />
          </g>

          {/* ── 3. Back Legs & Big Paws on Ground ── */}
          {/* Left Foot */}
          <g className="transition-transform duration-300">
            <ellipse cx="46" cy="154" rx="13" ry="8" fill="url(#halumFur)" stroke="#1E293B" strokeWidth="2.5" />
            {/* Soft cream toes */}
            <circle cx="39" cy="155" r="3" fill="url(#halumCream)" />
            <circle cx="45" cy="157" r="3.2" fill="url(#halumCream)" />
            <circle cx="51" cy="156" r="3" fill="url(#halumCream)" />
          </g>
          {/* Right Foot */}
          <g className="transition-transform duration-300">
            <ellipse cx="94" cy="154" rx="13" ry="8" fill="url(#halumFur)" stroke="#1E293B" strokeWidth="2.5" />
            {/* Soft cream toes */}
            <circle cx="89" cy="156" r="3" fill="url(#halumCream)" />
            <circle cx="95" cy="157" r="3.2" fill="url(#halumCream)" />
            <circle cx="101" cy="155" r="3" fill="url(#halumCream)" />
          </g>

          {/* ── 4. Tiger Chubby Torso / Body ── */}
          <path
            d="M42 90 C36 108 38 140 50 148 C60 154 80 154 90 148 C102 140 104 108 98 90 Z"
            fill="url(#halumFur)"
            stroke="#1E293B"
            strokeWidth="2.5"
          />
          {/* Torso Top Highlight */}
          <path
            d="M42 90 C36 108 38 140 50 148 C60 154 80 154 90 148 C102 140 104 108 98 90 Z"
            fill="url(#halumHighlight)"
          />

          {/* Tiger Body Stripes (Sides) */}
          <path d="M41 106 L49 110" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
          <path d="M40 120 L51 123" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
          <path d="M43 133 L52 134" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />

          <path d="M99 106 L91 110" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
          <path d="M100 120 L89 123" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
          <path d="M97 133 L88 134" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />

          {/* Cream Soft Chubby Belly */}
          <ellipse cx="70" cy="122" rx="19" ry="22" fill="url(#halumCream)" stroke="#1E293B" strokeWidth="1.5" />

          {/* ── 5. Satkhira Ghor Ranger Bandana / Scarf ── */}
          <path
            d="M48 83 C58 92 82 92 92 83 L70 104 Z"
            fill="url(#halumBandana)"
            stroke="#1E293B"
            strokeWidth="2.5"
          />
          {/* Golden Honey Brooch on Bandana */}
          <circle cx="70" cy="94" r="5" fill="url(#halumHoney)" stroke="#78350F" strokeWidth="1.5" />
          <path d="M70 91 C68 93 68 95 70 97 C72 95 72 93 70 91 Z" fill="#FFFFFF" />

          {/* ── 6. Dynamic Left & Right Arms (Gestures & Pointing) ── */}

          {/* GESTURE 1: POINTING POSE (Points paw & finger directly at target button) */}
          {isPointing && (
            <g className="halum-point-arm">
              {pointDirection === 'left' ? (
                /* Extended Left Arm pointing to the left */
                <g>
                  {/* Arm stretching left */}
                  <path
                    d="M50 90 C34 90 18 84 6 78 C2 76 2 70 8 70 C18 70 34 76 50 82"
                    fill="url(#halumFur)"
                    stroke="#1E293B"
                    strokeWidth="2.5"
                  />
                  {/* Extended Pointing Finger / Paw */}
                  <circle cx="4" cy="74" r="6" fill="url(#halumCream)" stroke="#1E293B" strokeWidth="2" />
                  <path d="M6 72 L-4 72" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
                  {/* Other paw on hip */}
                  <path
                    d="M93 88 C102 94 106 104 100 112 C96 116 90 114 88 108"
                    fill="url(#halumFur)"
                    stroke="#1E293B"
                    strokeWidth="2.5"
                  />
                </g>
              ) : (
                /* Extended Right Arm pointing to the right */
                <g>
                  {/* Arm stretching right */}
                  <path
                    d="M90 90 C106 90 122 84 134 78 C138 76 138 70 132 70 C122 70 106 76 90 82"
                    fill="url(#halumFur)"
                    stroke="#1E293B"
                    strokeWidth="2.5"
                  />
                  {/* Extended Pointing Finger / Paw */}
                  <circle cx="136" cy="74" r="6" fill="url(#halumCream)" stroke="#1E293B" strokeWidth="2" />
                  <path d="M134 72 L144 72" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
                  {/* Left paw on hip */}
                  <path
                    d="M47 88 C38 94 34 104 40 112 C44 116 50 114 52 108"
                    fill="url(#halumFur)"
                    stroke="#1E293B"
                    strokeWidth="2.5"
                  />
                </g>
              )}
            </g>
          )}

          {/* GESTURE 2: PRAISING POSE (Proudly holds up glowing Jar of Sundarbans Honey) */}
          {isPraising && (
            <g>
              {/* Left hand holding honey jar */}
              <path
                d="M48 92 C36 94 28 86 28 74 C28 66 38 66 44 76"
                fill="url(#halumFur)"
                stroke="#1E293B"
                strokeWidth="2.5"
              />
              {/* Glowing Honey Jar */}
              <g className="halum-honey-glow">
                <rect x="18" y="52" width="18" height="22" rx="4" fill="url(#halumHoney)" stroke="#78350F" strokeWidth="2" />
                <rect x="20" y="48" width="14" height="5" rx="2" fill="#E86A1E" stroke="#78350F" strokeWidth="1.5" />
                {/* Honey Drop Badge on Jar */}
                <circle cx="27" cy="63" r="3.5" fill="#FEF3C7" />
                {/* Little sparkling stars */}
                <path d="M12 48 L14 44 L16 48 L20 50 L16 52 L14 56 L12 52 L8 50 Z" fill="#FBBF24" />
                <path d="M38 42 L39 39 L40 42 L43 43 L40 44 L39 47 L38 44 L35 43 Z" fill="#FBBF24" />
              </g>
              {/* Right hand showing thumbs up */}
              <path
                d="M92 90 C104 92 112 86 112 74 C112 68 104 68 98 76"
                fill="url(#halumFur)"
                stroke="#1E293B"
                strokeWidth="2.5"
              />
              <circle cx="110" cy="72" r="5" fill="url(#halumCream)" stroke="#1E293B" strokeWidth="2" />
            </g>
          )}

          {/* GESTURE 3: DANCING / HAPPY CELEBRATION (Both paws raised in air) */}
          {isDancing && (
            <g>
              {/* Left arm up */}
              <path
                d="M48 88 C32 78 24 58 28 46 C32 42 40 46 44 60"
                fill="url(#halumFur)"
                stroke="#1E293B"
                strokeWidth="2.5"
              />
              <circle cx="28" cy="46" r="6" fill="url(#halumCream)" stroke="#1E293B" strokeWidth="2" />

              {/* Right arm up */}
              <path
                d="M92 88 C108 78 116 58 112 46 C108 42 100 46 96 60"
                fill="url(#halumFur)"
                stroke="#1E293B"
                strokeWidth="2.5"
              />
              <circle cx="112" cy="46" r="6" fill="url(#halumCream)" stroke="#1E293B" strokeWidth="2" />
            </g>
          )}

          {/* GESTURE 4: GREETING POSE (Waving paw) */}
          {isGreeting && (
            <g>
              {/* Left hand relaxed */}
              <path
                d="M46 92 C38 98 38 112 46 116 C52 118 56 110 52 100"
                fill="url(#halumFur)"
                stroke="#1E293B"
                strokeWidth="2.5"
              />
              {/* Right arm waving in air */}
              <g className="halum-paw-wave">
                <path
                  d="M92 88 C106 78 114 62 110 50 C106 46 98 50 96 64"
                  fill="url(#halumFur)"
                  stroke="#1E293B"
                  strokeWidth="2.5"
                />
                <circle cx="110" cy="50" r="7" fill="url(#halumCream)" stroke="#1E293B" strokeWidth="2" />
                <circle cx="108" cy="51" r="3" fill="#FCA5A5" />
              </g>
            </g>
          )}

          {/* GESTURE 5: SALUTING POSE (Respectful salute at brow) */}
          {isSaluting && (
            <g>
              {/* Left arm standing straight */}
              <path
                d="M46 92 C38 98 38 112 46 116 C52 118 56 110 52 100"
                fill="url(#halumFur)"
                stroke="#1E293B"
                strokeWidth="2.5"
              />
              {/* Right arm bent crisp salute */}
              <path
                d="M92 88 C104 84 108 68 100 52 L90 52 C86 52 86 64 92 78"
                fill="url(#halumFur)"
                stroke="#1E293B"
                strokeWidth="2.5"
              />
              <ellipse cx="90" cy="52" rx="5" ry="4" fill="url(#halumCream)" stroke="#1E293B" strokeWidth="2" />
            </g>
          )}

          {/* GESTURE 6: IDLE / TALKING / LISTENING (Default resting cute paws) */}
          {!isPointing && !isPraising && !isDancing && !isGreeting && !isSaluting && (
            <g>
              {/* Left Paw resting cutely on belly */}
              <path
                d="M46 90 C36 96 36 108 44 114 C50 118 56 112 54 102"
                fill="url(#halumFur)"
                stroke="#1E293B"
                strokeWidth="2.5"
              />
              <circle cx="46" cy="112" r="5" fill="url(#halumCream)" stroke="#1E293B" strokeWidth="1.5" />

              {/* Right Paw resting cutely on belly */}
              <path
                d="M94 90 C104 96 104 108 96 114 C90 118 84 112 86 102"
                fill="url(#halumFur)"
                stroke="#1E293B"
                strokeWidth="2.5"
              />
              <circle cx="94" cy="112" r="5" fill="url(#halumCream)" stroke="#1E293B" strokeWidth="1.5" />
            </g>
          )}

          {/* ── 7. Tiger Ears (Perked up & Dimensional) ── */}
          {/* Left Ear */}
          <g className={`transition-transform duration-300 origin-[45px_30px] ${
            isListening ? '-rotate-12 translate-y-[-3px]' : ''
          }`}>
            <circle cx="42" cy="26" r="15" fill="url(#halumFur)" stroke="#1E293B" strokeWidth="2.5" />
            <circle cx="42" cy="26" r="8.5" fill="#FCA5A5" />
            {/* Ear inner depth shadow */}
            <path d="M37 26 C37 22 47 22 47 26" stroke="#E11D48" strokeWidth="1.5" fill="none" opacity="0.6" />
          </g>

          {/* Right Ear */}
          <g className={`transition-transform duration-300 origin-[95px_30px] ${
            isListening ? 'rotate-12 translate-y-[-3px]' : ''
          }`}>
            <circle cx="98" cy="26" r="15" fill="url(#halumFur)" stroke="#1E293B" strokeWidth="2.5" />
            <circle cx="98" cy="26" r="8.5" fill="#FCA5A5" />
            {/* Ear inner depth shadow */}
            <path d="M93 26 C93 22 103 22 103 26" stroke="#E11D48" strokeWidth="1.5" fill="none" opacity="0.6" />
          </g>

          {/* ── 8. Tiger Head (2.5D Volumetric Sphere) ── */}
          <circle cx="70" cy="54" r="37" fill="url(#halumFur)" stroke="#1E293B" strokeWidth="2.5" />
          <circle cx="70" cy="54" r="37" fill="url(#halumHighlight)" />

          {/* Royal Bengal Tiger Forehead Stripes */}
          <path d="M70 20 L70 32" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
          <path d="M62 25 L55 31" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M78 25 L85 31" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M64 35 L76 35" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />

          {/* Cheek Stripes */}
          <path d="M36 50 L46 52" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M35 58 L45 58" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M104 50 L94 52" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M105 58 L95 58" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />

          {/* White Chubby Cheeks / Muzzle */}
          <ellipse cx="58" cy="65" rx="14" ry="11" fill="url(#halumCream)" />
          <ellipse cx="82" cy="65" rx="14" ry="11" fill="url(#halumCream)" />

          {/* ── 9. Cute Tiger Face Features ── */}
          {/* Cute Nose */}
          <path d="M65 59 L75 59 C72 65 68 65 65 59 Z" fill="#881337" stroke="#1E293B" strokeWidth="1.5" />

          {/* Mouth & Cute Little Tiger Fangs */}
          {isTalking ? (
            /* Open Talking Mouth */
            <g className="animate-pulse">
              <path
                d="M62 67 Q70 79 78 67 Z"
                fill="#881337"
                stroke="#1E293B"
                strokeWidth="2"
              />
              <path d="M66 73 Q70 76 74 73 Z" fill="#F43F5E" />
              {/* Cute tiny white fangs */}
              <polygon points="63,67 65,71 67,67" fill="#FFFFFF" />
              <polygon points="73,67 75,71 77,67" fill="#FFFFFF" />
            </g>
          ) : (
            /* Happy W-Shaped Tiger Smile */
            <g>
              <path
                d="M60 67 C64 73 69 70 70 65 C71 70 76 73 80 67"
                stroke="#1E293B"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              {/* Tiny cute fangs peeking out */}
              <polygon points="61,66 63,69 64,66" fill="#FFFFFF" />
              <polygon points="76,66 77,69 79,66" fill="#FFFFFF" />
            </g>
          )}

          {/* Whiskers */}
          <path d="M38 64 L48 65" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
          <path d="M37 70 L48 69" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
          <path d="M102 64 L92 65" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
          <path d="M103 70 L92 69" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />

          {/* ── 10. Expressive Big 2.5D Cartoon Eyes ── */}
          {blink ? (
            /* Blinking Eyes (Happy Curves) */
            <g>
              <path d="M50 48 Q56 53 62 48" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M78 48 Q84 53 90 48" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" fill="none" />
            </g>
          ) : (
            /* Open Glossy Anime Eyes */
            <g>
              {/* Left Eye */}
              <ellipse cx="56" cy="47" rx="7.5" ry="9" fill="#1E293B" />
              <circle cx="54" cy="44" r="3" fill="#FFFFFF" />
              <circle cx="58" cy="49" r="1.5" fill="#FFFFFF" />

              {/* Right Eye */}
              <ellipse cx="84" cy="47" rx="7.5" ry="9" fill="#1E293B" />
              <circle cx="82" cy="44" r="3" fill="#FFFFFF" />
              <circle cx="86" cy="49" r="1.5" fill="#FFFFFF" />

              {/* Expressive Eyebrows */}
              <path
                d={isListening ? "M48 36 L62 38" : isPointing ? "M48 37 Q55 33 62 37" : "M48 38 Q55 34 62 38"}
                stroke="#1E293B"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d={isListening ? "M92 34 L78 38" : isPointing ? "M92 37 Q85 33 78 37" : "M92 38 Q85 34 78 38"}
                stroke="#1E293B"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          )}

          {/* Cheerful Pink Blush on Cheeks */}
          <ellipse cx="44" cy="56" rx="5" ry="3.5" fill="#FCA5A5" opacity="0.65" />
          <ellipse cx="96" cy="56" rx="5" ry="3.5" fill="#FCA5A5" opacity="0.65" />
        </svg>
      </div>
    </div>
  );
}
