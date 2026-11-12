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

  // Smart Autonomous Positioning & 2.5D Movement States
  const [position, setPosition] = useState({ x: 20, y: 400 });
  const [dockSide, setDockSide] = useState('right'); // 'left' | 'right'
  const [isMoving, setIsMoving] = useState(false);
  const [facingLeft, setFacingLeft] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isNearButton, setIsNearButton] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false); // ALWAYS false by default on mobile!
  const [isScrolling, setIsScrolling] = useState(false);
  const [isScrollAsking, setIsScrollAsking] = useState(false);
  const [hasTargetOnScreen, setHasTargetOnScreen] = useState(false);
  const [targetType, setTargetType] = useState('general');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const widgetRef = useRef(null);
  const scrollAskTimeoutRef = useRef(null);
  const dragRef = useRef({
    isDown: false,
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
    hasMoved: false,
    startTime: 0,
  });

  // Cart drawer state for Auto-Minimize
  const isCartDrawerOpen = useCartStore((state) => state.isOpen);
  const lastAddedItem = useCartStore((state) => state.lastAddedItem);

  // Helper: Calculate screen-safe docking coordinates based on viewport & side
  // GUARANTEE: Never overflows right edge or left edge!
  const getSafeCoords = useCallback((side, customY = null) => {
    if (typeof window === 'undefined') return { x: 12, y: 500 };
    const containerWidth = Math.min(270, window.innerWidth - 24);
    const widgetHeight = window.innerWidth < 640 ? 210 : 240;
    const bottomSafeMargin = window.innerWidth < 640 ? 84 : 28;

    // Right side: strictly clamps inside window.innerWidth - containerWidth - 12
    const x = side === 'left' ? 12 : Math.max(10, window.innerWidth - containerWidth - 12);
    let y;
    if (customY !== null && typeof customY === 'number') {
      y = Math.max(60, Math.min(customY, window.innerHeight - widgetHeight - bottomSafeMargin));
    } else {
      y = Math.max(60, window.innerHeight - widgetHeight - bottomSafeMargin);
    }
    return { x, y };
  }, []);

  // Butter-Smooth Animated Glide to Target Coordinates (With Direction Flip)
  const glideTo = useCallback((targetCoords, newFacingLeft = null, onComplete = null) => {
    setIsMoving(true);
    setPosition((current) => {
      if (newFacingLeft !== null) {
        setFacingLeft(newFacingLeft);
      } else {
        if (targetCoords.x < current.x - 15) setFacingLeft(true);
        else if (targetCoords.x > current.x + 15) setFacingLeft(false);
      }
      return targetCoords;
    });

    const moveTimer = setTimeout(() => {
      setIsMoving(false);
      if (onComplete) onComplete();
    }, 850);

    return () => clearTimeout(moveTimer);
  }, []);

  // Restore saved preferences on mount (Always active on mobile!)
  useEffect(() => {
    setMounted(true);
    let initialSide = 'right';
    try {
      const savedSide = localStorage.getItem('halum_side');
      if (savedSide === 'left') initialSide = 'left';
    } catch (e) {}

    // On product detail page, default to LEFT side to keep right buy-box 100% unobstructed
    if (pathname && pathname.startsWith('/products/')) {
      initialSide = 'left';
    }

    setDockSide(initialSide);
    setFacingLeft(initialSide === 'left');
    const initialCoords = getSafeCoords(initialSide);
    setPosition(initialCoords);
  }, [pathname, getSafeCoords]);

  // Handle window resize dynamically
  useEffect(() => {
    if (!mounted) return;
    const handleResize = () => {
      if (!isDragging && !isNearButton) {
        const coords = getSafeCoords(dockSide);
        setPosition(coords);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mounted, dockSide, isDragging, isNearButton, getSafeCoords]);

  // Detect strictly ACTIVE DOM Modals (Avoid false-positives that silence Halum!)
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

  // ── 1. Autonomous Target Button Locator & Proximity Guiding ──
  // When an actionable button (Buy Now / Checkout) is visible on screen, Halum glides near it and points!
  const checkTargetButtons = useCallback(() => {
    if (isDragging || isChatOpen || isCartDrawerOpen || isModalOpen) return;

    let targetBtn = null;
    let type = 'general';

    if (pathname.startsWith('/products/')) {
      targetBtn =
        document.getElementById('halum-buy-now-btn') ||
        document.getElementById('halum-add-to-cart-btn') ||
        document.querySelector('[data-halum-target="add-to-cart"]');
      type = 'add-to-cart';
    } else if (pathname === '/cart') {
      targetBtn =
        document.getElementById('halum-checkout-btn') ||
        document.querySelector('[data-halum-target="checkout"]');
      type = 'checkout';
    }

    setTargetType(type);

    if (targetBtn) {
      const r = targetBtn.getBoundingClientRect();
      const isMobile = window.innerWidth < 640;
      const containerWidth = Math.min(270, window.innerWidth - 24);
      const widgetHeight = isMobile ? 210 : 240;
      const bottomSafeMargin = isMobile ? 84 : 28;

      // Check if button is visibly inside the active viewport
      const inViewport = r.top >= 40 && r.bottom <= window.innerHeight - bottomSafeMargin;

      if (inViewport) {
        setIsNearButton(true);
        setHasTargetOnScreen(true);
        setCharacterState('pointing');

        let targetX, targetY;
        if (!isMobile && r.right + containerWidth + 24 < window.innerWidth) {
          // Right beside button on desktop
          targetX = r.right + 16;
          targetY = Math.max(60, Math.min(r.top - 20, window.innerHeight - widgetHeight - bottomSafeMargin));
          setFacingLeft(true); // Point left at the button
        } else if (!isMobile && r.left - containerWidth - 24 > 0) {
          // Left beside button on desktop
          targetX = r.left - containerWidth - 16;
          targetY = Math.max(60, Math.min(r.top - 20, window.innerHeight - widgetHeight - bottomSafeMargin));
          setFacingLeft(false); // Point right at the button
        } else {
          // Mobile screen: Dock at safe edge nearest to button level
          targetX = 12;
          targetY = Math.max(60, Math.min(r.top - 30, window.innerHeight - widgetHeight - bottomSafeMargin));
          setFacingLeft(false);
        }

        glideTo({ x: targetX, y: targetY });
        return;
      }
    }

    // Button not in view: return to safe docking spot if we were previously locked to a button
    if (isNearButton) {
      setIsNearButton(false);
      setHasTargetOnScreen(false);
      setCharacterState('idle');
      const safeCoords = getSafeCoords(dockSide);
      glideTo(safeCoords, dockSide === 'left');
    }
  }, [isDragging, isChatOpen, isCartDrawerOpen, isModalOpen, pathname, isNearButton, dockSide, getSafeCoords, glideTo]);

  // ── 2. Smart Obstruction & Collision Avoidance ──
  // Detects if Halum is obstructing an interactive element (product card, button, form input) and moves away!
  const checkObstruction = useCallback(() => {
    if (isDragging || isChatOpen || isCartDrawerOpen || isModalOpen || isNearButton) return;

    const containerWidth = Math.min(270, window.innerWidth - 24);
    const h = window.innerWidth < 640 ? 210 : 240;

    const box = {
      left: position.x,
      top: position.y,
      right: position.x + containerWidth,
      bottom: position.y + h,
    };

    const candidates = document.querySelectorAll(
      'button:not([data-halum-ignore]), a.product-card, .product-card, [data-product-card], input, form, #halum-buy-now-btn, #halum-add-to-cart-btn'
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
      // Halum smoothly glides to the opposite safe side!
      setDockSide((currentSide) => {
        const nextSide = currentSide === 'left' ? 'right' : 'left';
        const newCoords = getSafeCoords(nextSide);
        glideTo(newCoords, nextSide === 'left');
        try {
          localStorage.setItem('halum_side', nextSide);
        } catch (e) {}
        return nextSide;
      });
    }
  }, [isDragging, isChatOpen, isCartDrawerOpen, isModalOpen, isNearButton, position, getSafeCoords, glideTo]);

  // ── 3. Scroll Listener with Proactive Interaction ──
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

        // Keep the speech bubble asking for assistance active for 8 seconds after scrolling stops
        clearTimeout(scrollAskTimeoutRef.current);
        scrollAskTimeoutRef.current = setTimeout(() => {
          setIsScrollAsking(false);
          setCharacterState('idle');
        }, 8000);
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
  // Every 16 seconds of inactivity, Halum patrols from one side to the other, making the shop feel alive!
  useEffect(() => {
    if (!mounted || isChatOpen || isCartDrawerOpen || isModalOpen || isNearButton || isDragging) return;

    const roamTimer = setInterval(() => {
      if (document.hidden) return; // Don't roam when tab is in background

      setDockSide((currentSide) => {
        const nextSide = currentSide === 'left' ? 'right' : 'left';
        const newCoords = getSafeCoords(nextSide);
        glideTo(newCoords, nextSide === 'left');
        try {
          localStorage.setItem('halum_side', nextSide);
        } catch (e) {}
        return nextSide;
      });
    }, 16000);

    return () => clearInterval(roamTimer);
  }, [mounted, isChatOpen, isCartDrawerOpen, isModalOpen, isNearButton, isDragging, getSafeCoords, glideTo]);

  // Route Intelligence on Navigation
  useEffect(() => {
    if (!mounted) return;

    if (pathname.startsWith('/products/')) {
      // Always safely dock on LEFT on product page initially
      setDockSide('left');
      setFacingLeft(false);
      const coords = getSafeCoords('left');
      glideTo(coords, false);
      const timer = setTimeout(() => checkTargetButtons(), 600);
      return () => clearTimeout(timer);
    } else if (pathname === '/cart') {
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
  }, [pathname, mounted, getSafeCoords, glideTo, checkTargetButtons]);

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

  // ── 5. Side Swap Toggle (Left <-> Right) with Butter-Smooth Glide ──
  const handleToggleSide = () => {
    setDockSide((prev) => {
      const next = prev === 'left' ? 'right' : 'left';
      try {
        localStorage.setItem('halum_side', next);
      } catch (e) {}
      const newCoords = getSafeCoords(next);
      glideTo(newCoords, next === 'left');
      return next;
    });
  };

  // Minimize / Expand toggle
  const handleToggleMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  // ── 6. Touch & Mouse Drag-and-Drop Implementation ──
  const handlePointerDown = (e) => {
    // Avoid dragging when clicking buttons inside bubble or chat
    if (e.target.closest('button, a, input, [role="button"]')) return;

    dragRef.current = {
      isDown: true,
      startX: e.clientX,
      startY: e.clientY,
      initX: position.x,
      initY: position.y,
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
    const dy = e.clientY - dragRef.current.startY;

    if (Math.hypot(dx, dy) > 5) {
      dragRef.current.hasMoved = true;
    }

    const containerWidth = Math.min(270, window.innerWidth - 24);
    const widgetHeight = window.innerWidth < 640 ? 210 : 240;
    const bottomSafeMargin = window.innerWidth < 640 ? 84 : 28;

    // Boundary clamped: never exceeds screen edges!
    const newX = Math.max(8, Math.min(dragRef.current.initX + dx, window.innerWidth - containerWidth - 8));
    const newY = Math.max(60, Math.min(dragRef.current.initY + dy, window.innerHeight - widgetHeight - bottomSafeMargin));

    setPosition({ x: newX, y: newY });
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
      // Clean single tap/click! Toggle chat window
      handleToggleChat();
    } else if (wasMoved) {
      // Drag released: determine nearest dockSide and save preference
      const newSide = position.x < window.innerWidth / 2 ? 'left' : 'right';
      setDockSide(newSide);
      try {
        localStorage.setItem('halum_side', newSide);
      } catch (err) {}
    }
  };

  // ── 7. Direct 1-Tap Execution: Triggers on-screen target button ──
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
    } else if (pathname === '/cart') {
      const checkoutBtn =
        document.getElementById('halum-checkout-btn') ||
        document.querySelector('[data-halum-target="checkout"]');

      if (checkoutBtn) {
        checkoutBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        checkoutBtn.classList.add('ring-4', 'ring-[#FAB116]', 'ring-offset-2');
        setTimeout(() => {
          checkoutBtn.classList.remove('ring-4', 'ring-[#FAB116]', 'ring-offset-2');
        }, 2200);

        checkoutBtn.click();
        setCharacterState('saluting');
      }
    } else {
      setIsChatOpen(true);
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

  // Do not render on admin dashboard
  if (pathname.startsWith('/admin')) {
    return null;
  }

  if (!mounted) {
    return null;
  }

  // Auto-Minimize Condition: Only when full Cart Drawer is visibly open or checkout modal active
  const shouldAutoMinimize = isCartDrawerOpen || isModalOpen;
  const effectiveMinimized = isMinimized || shouldAutoMinimize;

  return (
    <>
      {/* ── 2.5D Animated Flying / Roaming Character Container ── */}
      {/* Width is clamped: min(270px, calc(100vw - 24px)) so it never overflows! */}
      <div
        ref={widgetRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: 'min(270px, calc(100vw - 24px))',
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          transition: isDragging
            ? 'none'
            : isMoving
            ? 'transform 0.85s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease'
            : 'transform 0.35s ease-out, opacity 0.25s ease',
          zIndex: shouldAutoMinimize ? 20 : 50,
          touchAction: 'none',
        }}
        className={`flex flex-col select-none ${
          dockSide === 'left' ? 'items-start' : 'items-end'
        } ${shouldAutoMinimize ? 'opacity-65 scale-90' : 'opacity-100'} ${
          isScrolling ? 'opacity-70 scale-98' : ''
        }`}
      >
        {/* Floating Speech Bubble (moves with Halum, clamped strictly within screen) */}
        {!effectiveMinimized && (
          <div className="pointer-events-auto w-full">
            <HalumSpeechBubble
              isOpen={isChatOpen}
              onOpenChat={() => handleToggleChat()}
              onSendMessage={(query) => handleToggleChat(query)}
              pathname={pathname}
              isLeftSide={dockSide === 'left'}
              onToggleSide={handleToggleSide}
              onMinimize={handleToggleMinimize}
              onTriggerTargetAction={handleTriggerTargetAction}
              hasTargetOnScreen={hasTargetOnScreen}
              targetType={targetType}
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
