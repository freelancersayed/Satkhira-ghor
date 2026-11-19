'use client';

/**
 * Custom SVG Agent Avatar with Headset & Microphone
 * Instantly conveys "Customer Support / AI Shopping Agent" at a single glance
 */
export default function AgentAvatar({ className = 'w-6 h-6', glow = true }) {
  return (
    <div className="relative flex items-center justify-center">
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        {/* Headset Arc / Band */}
        <path
          d="M6 17.5C6 10.873 11.373 5.5 18 5.5C24.627 5.5 30 10.873 30 17.5V20.5"
          stroke="#FAB116"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        {/* Headset Left & Right Ear Cushions */}
        <rect x="3.8" y="15.5" width="4.8" height="8.5" rx="2.4" fill="#FAB116" />
        <rect x="27.4" y="15.5" width="4.8" height="8.5" rx="2.4" fill="#FAB116" />

        {/* Microphone Arm & Tip */}
        <path
          d="M29.5 22C29.5 26 25.5 28.5 21 28.5H18"
          stroke="#FAB116"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="17" cy="28.5" r="2.2" fill="#10B981" />

        {/* Agent Face Head / Screen */}
        <rect
          x="9"
          y="10.5"
          width="18"
          height="14.5"
          rx="7.25"
          fill="#FFFFFF"
          stroke="#014D24"
          strokeWidth="1.2"
        />

        {/* Friendly Expressive Eyes */}
        <ellipse cx="13.8" cy="16.5" rx="1.6" ry="1.9" fill="#016831" />
        <ellipse cx="22.2" cy="16.5" rx="1.6" ry="1.9" fill="#016831" />
        {/* Catchlight reflections in eyes */}
        <circle cx="14.4" cy="15.8" r="0.6" fill="#FFFFFF" />
        <circle cx="22.8" cy="15.8" r="0.6" fill="#FFFFFF" />

        {/* Smiling Mouth */}
        <path
          d="M14.8 20.8C15.8 22.4 20.2 22.4 21.2 20.8"
          stroke="#016831"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Cute Cheeks */}
        <circle cx="11.8" cy="19.5" r="1.1" fill="#FCA5A5" opacity="0.8" />
        <circle cx="24.2" cy="19.5" r="1.1" fill="#FCA5A5" opacity="0.8" />
      </svg>

      {/* Online indicator dot */}
      {glow && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-1.5 border-white shadow-xs" />
        </span>
      )}
    </div>
  );
}
