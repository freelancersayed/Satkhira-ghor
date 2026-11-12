'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import HalumTigerAnimation from './HalumTigerAnimation';
import HalumSpeechBubble from './HalumSpeechBubble';
import HalumChatWindow from './HalumChatWindow';
import { useCartStore } from '@/store/cartStore';

export default function HalumAssistantWidget() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  // 'idle' | 'greeting' | 'listening' | 'praising' | 'dancing' | 'saluting' | 'talking'
  const [characterState, setCharacterState] = useState('idle');

  // Smart Adaptive Positioning states
  const [isLeftSide, setIsLeftSide] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const lastAddedItem = useCartStore((state) => state.lastAddedItem);

  // Restore saved position preferences
  useEffect(() => {
    setMounted(true);
    try {
      const savedSide = localStorage.getItem('halum_side');
      if (savedSide === 'left') setIsLeftSide(true);
      const savedMini = localStorage.getItem('halum_minimized');
      if (savedMini === 'true') setIsMinimized(true);
    } catch (e) {
      // ignore
    }
  }, []);

  // Listen to user scroll to dim non-intrusively
  useEffect(() => {
    let scrollTimer = null;
    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => setIsScrolling(false), 800);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimer);
    };
  }, []);

  // Route-Aware Dynamic Behavior: Halum speaks about the current page/product!
  useEffect(() => {
    if (!mounted) return;

    if (pathname.startsWith('/products/')) {
      // On product detail page: Halum passionately praises the specific pure food!
      setCharacterState('praising');
      const timer = setTimeout(() => setCharacterState('idle'), 5000);
      return () => clearTimeout(timer);
    } else if (pathname === '/cart') {
      // On cart page: Halum dances to guide checkout
      setCharacterState('dancing');
      const timer = setTimeout(() => setCharacterState('idle'), 4000);
      return () => clearTimeout(timer);
    } else if (pathname === '/track-order') {
      // On track order page: Salutes and assures fast delivery
      setCharacterState('saluting');
      const timer = setTimeout(() => setCharacterState('idle'), 4000);
      return () => clearTimeout(timer);
    } else if (pathname === '/') {
      // On homepage landing: Warm welcome
      setCharacterState('greeting');
      const timer = setTimeout(() => setCharacterState('idle'), 3500);
      return () => clearTimeout(timer);
    }
  }, [pathname, mounted]);

  // When item is added to cart, Halum rejoices with dancing animation (Step 3)
  useEffect(() => {
    if (lastAddedItem) {
      setCharacterState('dancing');
      const timer = setTimeout(() => {
        setCharacterState('idle');
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [lastAddedItem]);

  // Listen to order confirmed custom event (Step 4: Saluting)
  useEffect(() => {
    const handleOrderConfirmed = () => {
      setCharacterState('saluting');
      const timer = setTimeout(() => {
        setCharacterState('idle');
      }, 8000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('halum:order-confirmed', handleOrderConfirmed);
    return () => window.removeEventListener('halum:order-confirmed', handleOrderConfirmed);
  }, []);

  // Side swap toggle (Left <-> Right)
  const handleToggleSide = () => {
    setIsLeftSide((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('halum_side', next ? 'left' : 'right');
      } catch (e) {}
      return next;
    });
  };

  // Minimize / Expand toggle
  const handleToggleMinimize = () => {
    setIsMinimized((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('halum_minimized', next ? 'true' : 'false');
      } catch (e) {}
      return next;
    });
  };

  // Do not render on admin dashboard
  if (pathname.startsWith('/admin')) {
    return null;
  }

  if (!mounted) {
    return null;
  }

  const handleToggleChat = () => {
    if (isMinimized) {
      setIsMinimized(false);
      return;
    }
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
      {/* ── Floating Character Widget & Speech Bubble Container with Adaptive Positioning ── */}
      <div
        className={`fixed z-40 flex flex-col pointer-events-none transition-all duration-500 ease-in-out ${
          isLeftSide
            ? 'bottom-[74px] md:bottom-6 left-3 sm:left-6 items-start'
            : 'bottom-[74px] md:bottom-6 right-3 sm:right-6 items-end'
        } ${isScrolling ? 'opacity-70 hover:opacity-100' : 'opacity-100'}`}
      >
        {/* Speech Bubble (hidden in minimized mode) */}
        {!isMinimized && (
          <div className="pointer-events-auto">
            <HalumSpeechBubble
              isOpen={isChatOpen}
              onOpenChat={() => setIsChatOpen(true)}
              pathname={pathname}
              isLeftSide={isLeftSide}
              onToggleSide={handleToggleSide}
              onMinimize={handleToggleMinimize}
            />
          </div>
        )}

        {/* Halum Tiger Character (Pointer events auto on tiger) */}
        <div className="pointer-events-auto">
          <HalumTigerAnimation
            state={characterState}
            onClick={handleToggleChat}
            isMinimized={isMinimized}
          />
        </div>
      </div>

      {/* ── Interactive Chat Window Modal ── */}
      <HalumChatWindow
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentState={characterState}
        onStateChange={(state) => setCharacterState(state)}
        pathname={pathname}
        isLeftSide={isLeftSide}
      />
    </>
  );
}

