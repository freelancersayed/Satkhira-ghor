'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import HalumTigerAnimation from './HalumTigerAnimation';
import HalumSpeechBubble from './HalumSpeechBubble';
import HalumChatWindow from './HalumChatWindow';
import { useCartStore } from '@/store/cartStore';

export default function HalumAssistantWidget() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialQuery, setChatInitialQuery] = useState(null);

  // Character emotional state
  // 'idle' | 'greeting' | 'listening' | 'praising' | 'dancing' | 'saluting' | 'pointing' | 'talking' | 'thinking' | 'proud' | 'happy'
  const [characterState, setCharacterState] = useState('idle');

  // Smart Autonomous Horizontal Positioning & 2.5D Movement States
  const [positionX, setPositionX] = useState(20);
  const [dockSide, setDockSide] = useState('right'); // 'left' | 'right'
  const [isMoving, setIsMoving] = useState(false);
  const [facingLeft, setFacingLeft] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false); // ALWAYS false by default on mobile!
  const [isScrolling, setIsScrolling] = useState(false);
  const [isScrollAsking, setIsScrollAsking] = useState(false);
  const [hasTargetOnScreen, setHasTargetOnScreen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const widgetRef = useRef(null);
  const scrollAskTimeoutRef = useRef(null);
  const dragRef = useRef({
    isDown: false,
    startX: 0,
    initX: 0,
    hasMoved: false,
    startTime: 0,
  });

  // Cart drawer state for Auto-Minimize
  const isCartDrawerOpen = useCartStore((state) => state.isOpen);
  const lastAddedItem = useCartStore((state) => state.lastAddedItem);

  // Helper: Calculate strictly bounded horizontal safe coordinates
  // Mathematical guarantee: Halum and his speech bubble NEVER cross screen left or right edges!
  const getSafeX = useCallback((side) => {
    if (typeof window === 'undefined') return 20;
    const isMobile = window.innerWidth < 640;
    const widgetWidth = isMobile ? 80 : 112;
    const safeMargin = isMobile ? 42 : 52;

    if (side === 'left') {
      return safeMargin;
    } else {
      return Math.max(safeMargin, window.innerWidth - widgetWidth - safeMargin);
    }
  }, []);

  // Butter-Smooth Animated Walk/Glide to Target X
  const walkTo = useCallback((targetX, newFacingLeft = null, onComplete = null) => {
    setIsMoving(true);
    setPositionX((currentX) => {
      if (newFacingLeft !== null) {
        setFacingLeft(newFacingLeft);
      } else {
        if (targetX < currentX - 10) setFacingLeft(true);
        else if (targetX > currentX + 10) setFacingLeft(false);
      }
      return targetX;
    });

    const moveTimer = setTimeout(() => {
      setIsMoving(false);
      if (onComplete) onComplete();
    }, 850);

    return () => clearTimeout(moveTimer);
  }, []);

  // Initialize position on mount (Active by default on mobile!)
  useEffect(() => {
    setMounted(true);
    let initialSide = 'right';
    try {
      const savedSide = localStorage.getItem('halum_side');
      if (savedSide === 'left') initialSide = 'left';
    } catch (e) {}

    // On product detail page, walk to LEFT side to leave right-side buy-box 100% unobstructed!
    if (pathname && pathname.startsWith('/products/')) {
      initialSide = 'left';
    }

    setDockSide(initialSide);
    setFacingLeft(initialSide === 'left');
    const x = getSafeX(initialSide);
    setPositionX(x);
  }, [pathname, getSafeX]);

  // Handle window resize dynamically without overflowing
  useEffect(() => {
    if (!mounted) return;
    const handleResize = () => {
      if (!isDragging) {
        const x = getSafeX(dockSide);
        setPositionX(x);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mounted, dockSide, isDragging, getSafeX]);

  // Detect strictly active modals
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkModal = () => {
      const modal =
        document.querySelector('dialog[open]') ||
        document.querySelector('.admin-modal');
      setIsModalOpen(Boolean(modal));
    };

    const observer = new MutationObserver(checkModal);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  // ── 1. Target Button Locator on Product Page ──
  // On product page, points directly towards Buy Now / Add to Cart button
  const checkTargetButtons = useCallback(() => {
    if (isDragging || isChatOpen || isCartDrawerOpen || isModalOpen) return;

    if (pathname.startsWith('/products/')) {
      const targetBtn =
        document.getElementById('halum-buy-now-btn') ||
        document.getElementById('halum-add-to-cart-btn') ||
        document.querySelector('[data-halum-target="add-to-cart"]');

      if (targetBtn) {
        const r = targetBtn.getBoundingClientRect();
        const inViewport = r.top >= 40 && r.bottom <= window.innerHeight - 60;

        if (inViewport) {
          setHasTargetOnScreen(true);
          setCharacterState('pointing');
          // Safe on LEFT side pointing right towards buy-box
          if (dockSide !== 'left') {
            setDockSide('left');
            const x = getSafeX('left');
            walkTo(x, false);
          }
          return;
        }
      }
    }

    setHasTargetOnScreen(false);
  }, [isDragging, isChatOpen, isCartDrawerOpen, isModalOpen, pathname, dockSide, getSafeX, walkTo]);

  // ── 2. Obstruction Avoidance: Move to Empty Safe Space ──
  const checkObstruction = useCallback(() => {
    if (isDragging || isChatOpen || isCartDrawerOpen || isModalOpen) return;
    if (pathname.startsWith('/products/')) return; // Product page stays left

    const isMobile = window.innerWidth < 640;
    const w = isMobile ? 80 : 112;
    const h = isMobile ? 112 : 144;
    const bottomPos = isMobile ? 80 : 24;
    const topPos = window.innerHeight - bottomPos - h;

    const box = {
      left: positionX,
      top: topPos,
      right: positionX + w,
      bottom: window.innerHeight - bottomPos,
    };

    const candidates = document.querySelectorAll(
      'button:not([data-halum-ignore]), a.product-card, .product-card, [data-product-card], input, form'
    );

    let isObstructed = false;
    for (const el of candidates) {
      if (widgetRef.current && widgetRef.current.contains(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;

      const overlap = !(
        box.right < r.left ||
        box.left > r.right ||
        box.bottom < r.top ||
        box.top > r.bottom
      );

      if (overlap) {
        isObstructed = true;
        break;
      }
    }

    if (isObstructed) {
      // Halum smoothly walks to the opposite safe side!
      setDockSide((currentSide) => {
        const nextSide = currentSide === 'left' ? 'right' : 'left';
        const newX = getSafeX(nextSide);
        walkTo(newX, nextSide === 'left');
        try {
          localStorage.setItem('halum_side', nextSide);
        } catch (e) {}
        return nextSide;
      });
    }
  }, [isDragging, isChatOpen, isCartDrawerOpen, isModalOpen, pathname, positionX, getSafeX, walkTo]);

  // ── 3. Scroll Listener with Proactive Dialogue ──
  // Requirement: "ইউজার ওয়েব সাইটে স্ক্রল করলে হালুম মামা বার বার জিজ্ঞেস করবে ”কি লাগবে আমাকে বলুন খুজে দিচ্ছি”"
  useEffect(() => {
    let scrollTimer = null;

    const handleScroll = () => {
      setIsScrolling(true);
      setIsScrollAsking(true);
      setCharacterState('listening');

      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        setIsScrolling(false);
        checkTargetButtons();
        checkObstruction();

        // Keep asking for assistance for 7 seconds after scrolling stops
        clearTimeout(scrollAskTimeoutRef.current);
        scrollAskTimeoutRef.current = setTimeout(() => {
          setIsScrollAsking(false);
          setCharacterState('idle');
        }, 7000);
      }, 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimer);
      clearTimeout(scrollAskTimeoutRef.current);
    };
  }, [checkTargetButtons, checkObstruction]);

  // ── 4. Autonomous Roaming & Idle Patrol ──
  // Every 16 seconds of inactivity, Halum patrols from one side to the other
  useEffect(() => {
    if (!mounted || isChatOpen || isCartDrawerOpen || isModalOpen || isDragging || pathname.startsWith('/products/')) return;

    const roamTimer = setInterval(() => {
      if (document.hidden) return;

      setDockSide((currentSide) => {
        const nextSide = currentSide === 'left' ? 'right' : 'left';
        const newX = getSafeX(nextSide);
        walkTo(newX, nextSide === 'left');
        try {
          localStorage.setItem('halum_side', nextSide);
        } catch (e) {}
        return nextSide;
      });
    }, 16000);

    return () => clearInterval(roamTimer);
  }, [mounted, isChatOpen, isCartDrawerOpen, isModalOpen, isDragging, pathname, getSafeX, walkTo]);

  // Navigation intelligence
  useEffect(() => {
    if (!mounted) return;

    if (pathname.startsWith('/products/')) {
      setDockSide('left');
      setFacingLeft(false);
      const x = getSafeX('left');
      walkTo(x, false);
      const timer = setTimeout(() => checkTargetButtons(), 600);
      return () => clearTimeout(timer);
    } else if (pathname === '/track-order') {
      setCharacterState('saluting');
      const timer = setTimeout(() => setCharacterState('idle'), 4000);
      return () => clearTimeout(timer);
    } else if (pathname === '/') {
      setCharacterState('greeting');
      const timer = setTimeout(() => setCharacterState('idle'), 3500);
      return () => clearTimeout(timer);
    }
  }, [pathname, mounted, getSafeX, walkTo, checkTargetButtons]);

  // Celebration on cart add
  useEffect(() => {
    if (lastAddedItem) {
      setCharacterState('happy');
      const timer = setTimeout(() => setCharacterState('idle'), 4500);
      return () => clearTimeout(timer);
    }
  }, [lastAddedItem]);

  // Celebration on order confirmation
  useEffect(() => {
    const handleOrderConfirmed = () => {
      setCharacterState('saluting');
      const timer = setTimeout(() => setCharacterState('idle'), 8000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('halum:order-confirmed', handleOrderConfirmed);
    return () => window.removeEventListener('halum:order-confirmed', handleOrderConfirmed);
  }, []);

  // ── 5. Touch & Mouse Horizontal Drag-and-Drop ──
  const handlePointerDown = (e) => {
    if (e.target.closest('button, a, input, [role="button"]')) return;

    dragRef.current = {
      isDown: true,
      startX: e.clientX,
      initX: positionX,
      hasMoved: false,
      startTime: Date.now(),
    };

    setIsDragging(true);
    if (e.currentTarget.setPointerCapture) {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current.isDown) return;
    const dx = e.clientX - dragRef.current.startX;

    if (Math.abs(dx) > 5) {
      dragRef.current.hasMoved = true;
    }

    const isMobile = window.innerWidth < 640;
    const widgetWidth = isMobile ? 80 : 112;
    const safeMargin = isMobile ? 42 : 52;

    // Strictly clamped inside the screen boundaries!
    const minX = safeMargin;
    const maxX = Math.max(safeMargin, window.innerWidth - widgetWidth - safeMargin);
    const newX = Math.max(minX, Math.min(dragRef.current.initX + dx, maxX));

    setPositionX(newX);
  };

  const handlePointerUp = (e) => {
    if (!dragRef.current.isDown) return;
    const wasMoved = dragRef.current.hasMoved;
    const duration = Date.now() - dragRef.current.startTime;

    dragRef.current.isDown = false;
    setIsDragging(false);

    if (e && e.currentTarget && e.currentTarget.releasePointerCapture) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }

    if (!wasMoved && duration < 320) {
      handleToggleChat();
    } else if (wasMoved) {
      const newSide = positionX < window.innerWidth / 2 ? 'left' : 'right';
      setDockSide(newSide);
      try {
        localStorage.setItem('halum_side', newSide);
      } catch (err) {}
    }
  };

  // Direct 1-Tap Trigger Target Action
  const handleTriggerTargetAction = useCallback(() => {
    if (pathname.startsWith('/products/')) {
      const buyNowBtn =
        document.getElementById('halum-buy-now-btn') ||
        document.getElementById('halum-add-to-cart-btn') ||
        document.querySelector('[data-halum-target="add-to-cart"]');

      if (buyNowBtn) {
        buyNowBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        buyNowBtn.classList.add('ring-4', 'ring-[#FAB116]', 'ring-offset-2');
        setTimeout(() => {
          buyNowBtn.classList.remove('ring-4', 'ring-[#FAB116]', 'ring-offset-2');
        }, 2200);

        buyNowBtn.click();
        setCharacterState('happy');
        setTimeout(() => setCharacterState('idle'), 4000);
      }
    } else {
      handleToggleChat();
    }
  }, [pathname]);

  const handleToggleChat = (initialMsg = null) => {
    if (initialMsg) {
      setChatInitialQuery(initialMsg);
    } else {
      setChatInitialQuery(null);
    }

    if (effectiveMinimized) {
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

  if (pathname.startsWith('/admin') || !mounted) {
    return null;
  }

  const shouldAutoMinimize = isCartDrawerOpen || isModalOpen;
  const effectiveMinimized = isMinimized || shouldAutoMinimize;

  return (
    <>
      {/* ── 2.5D Animated Flying / Roaming Character Container ── */}
      {/* Vertically anchored with bottom (never goes below screen!) */}
      {/* Horizontally clamped with positionX (never goes outside left/right screen!) */}
      <div
        ref={widgetRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: 'fixed',
          bottom: 'calc(76px + env(safe-area-inset-bottom, 0px))',
          left: `${positionX}px`,
          transition: isDragging
            ? 'none'
            : isMoving
            ? 'left 0.85s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease'
            : 'left 0.35s ease-out, opacity 0.25s ease',
          zIndex: shouldAutoMinimize ? 20 : 50,
          touchAction: 'none',
        }}
        className={`flex flex-col items-center select-none pointer-events-none md:bottom-6 ${
          shouldAutoMinimize ? 'opacity-65 scale-90' : 'opacity-100'
        } ${isScrolling ? 'opacity-75' : ''}`}
      >
        {/* Compact Smart Speech Bubble perched directly over Halum's head */}
        {!effectiveMinimized && (
          <div className="pointer-events-auto">
            <HalumSpeechBubble
              isOpen={isChatOpen}
              onOpenChat={() => handleToggleChat()}
              onSendMessage={(query) => handleToggleChat(query)}
              pathname={pathname}
              isLeftSide={dockSide === 'left'}
              onTriggerTargetAction={handleTriggerTargetAction}
              hasTargetOnScreen={hasTargetOnScreen}
              isScrollAsking={isScrollAsking}
            />
          </div>
        )}

        {/* 2.5D Animated Mascot Character */}
        <div className="pointer-events-auto cursor-grab active:cursor-grabbing">
          <HalumTigerAnimation
            state={characterState}
            onClick={() => handleToggleChat()}
            isMinimized={effectiveMinimized}
            pointDirection={dockSide === 'left' ? 'right' : 'left'}
            isMoving={isMoving}
            facingLeft={facingLeft}
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
        isLeftSide={dockSide === 'left'}
        initialQuery={chatInitialQuery}
      />
    </>
  );
}
