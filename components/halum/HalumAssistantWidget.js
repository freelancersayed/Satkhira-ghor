'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import HalumTigerAnimation from './HalumTigerAnimation';
import HalumSpeechBubble from './HalumSpeechBubble';
import HalumChatWindow from './HalumChatWindow';

export default function HalumAssistantWidget() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [characterState, setCharacterState] = useState('idle'); // 'idle' | 'greeting' | 'talking' | 'happy'

  useEffect(() => {
    setMounted(true);

    // Initial delightful welcome on landing
    const greetTimer = setTimeout(() => {
      setCharacterState('greeting');
      const resetTimer = setTimeout(() => {
        setCharacterState('idle');
      }, 4000);
      return () => clearTimeout(resetTimer);
    }, 1800);

    return () => clearTimeout(greetTimer);
  }, []);

  // Do not render on admin dashboard
  if (pathname.startsWith('/admin')) {
    return null;
  }

  if (!mounted) {
    return null;
  }

  const handleToggleChat = () => {
    setIsChatOpen((prev) => {
      const next = !prev;
      if (next) {
        setCharacterState('greeting');
        setTimeout(() => setCharacterState('idle'), 2500);
      }
      return next;
    });
  };

  return (
    <>
      {/* ── Floating Character Widget & Speech Bubble Container ── */}
      <div className="fixed bottom-[74px] md:bottom-6 right-3 sm:right-6 z-40 flex flex-col items-end pointer-events-none">
        {/* Speech Bubble (Pointer events auto on bubble) */}
        <div className="pointer-events-auto">
          <HalumSpeechBubble
            isOpen={isChatOpen}
            onOpenChat={() => setIsChatOpen(true)}
          />
        </div>

        {/* Halum Tiger Character (Pointer events auto on tiger) */}
        <div className="pointer-events-auto">
          <HalumTigerAnimation
            state={characterState}
            onClick={handleToggleChat}
          />
        </div>
      </div>

      {/* ── Interactive Chat Window Modal ── */}
      <HalumChatWindow
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentState={characterState}
        onStateChange={(state) => setCharacterState(state)}
      />
    </>
  );
}
