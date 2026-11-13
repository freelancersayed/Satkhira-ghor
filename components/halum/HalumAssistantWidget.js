'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import HalumTigerAnimation from './HalumTigerAnimation';
import HalumSpeechBubble from './HalumSpeechBubble';
import HalumChatWindow from './HalumChatWindow';
import { useCartStore } from '@/store/cartStore';
import { getHalumConfigForRoute } from './halumConfig';

export default function HalumAssistantWidget() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialQuery, setChatInitialQuery] = useState(null);

  // Character emotional state
  // 'idle' | 'greeting' | 'listening' | 'praising' | 'dancing' | 'saluting' | 'pointing' | 'talking' | 'thinking' | 'proud' | 'happy'
  const [characterState, setCharacterState] = useState('idle');

  // Smart Autonomous Horizontal Positioning & 2.5D Movement States
  const [positionX, setPositionX] = useState(14);
  const [dockSide, setDockSide] = useState('left'); // 'left' | 'right' (Default: LEFT side!)
  const [isMoving, setIsMoving] = useState(false);
  const [facingLeft, setFacingLeft] = useState(false); // looking into webpage content
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false); // ALWAYS false by default on mobile!
  const [isScrolling, setIsScrolling] = useState(false);
  const [isScrollAsking, setIsScrollAsking] = useState(false);
  const [hasTargetOnScreen, setHasTargetOnScreen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [welcomeStep, setWelcomeStep] = useState(0); // 0: none, 1: grand welcome, 2: help ask
  const [itemJustAdded, setItemJustAdded] = useState(false);

  const prevLastAddedRef = useRef(null);
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
    if (typeof window === 'undefined') return 14;
    const isMobile = window.innerWidth < 640;
    const widgetWidth = isMobile ? 80 : 112;
    const safeMargin = isMobile ? 12 : 20;

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

  // Initialize position on mount - Controlled by Central Route Config
  useEffect(() => {
    setMounted(true);
    const config = getHalumConfigForRoute(pathname);
    const initialSide = config.side || 'left';

    setDockSide(initialSide);
    setFacingLeft(initialSide === 'right');
    const x = getSafeX(initialSide);
    setPositionX(x);
  }, [pathname, getSafeX]);

  // Welcome sequence on homepage entry / refresh
  // Phase 1 (2.6s): Happy smile + enlarged scale ("সাতক্ষীরা ঘরে স্বাগতম")
  // Phase 2 (7s): Normal size + help offer ("কীভাবে সহযোগিতা করতে পারি বলো? - পণ্য খুঁজে পাচ্ছ না? আমাকে বলো আমি খুঁজে দিচ্ছি!")
  useEffect(() => {
    if (!mounted) return;

    if (pathname === '/') {
      setWelcomeStep(1);
      setCharacterState('happy');

      const step1Timer = setTimeout(() => {
        setWelcomeStep(2);
        setCharacterState('idle');

        const step2Timer = setTimeout(() => {
          setWelcomeStep(0);
        }, 7000);

        return () => clearTimeout(step2Timer);
      }, 2600);

      return () => clearTimeout(step1Timer);
    } else {
      setWelcomeStep(0);
    }
  }, [pathname, mounted]);

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

  // Detect strictly active modals, drawers & mobile hamburger menu
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkModal = () => {
      const modal =
        document.querySelector('dialog[open]') ||
        document.querySelector('[role="dialog"]') ||
        document.querySelector('.admin-modal') ||
        document.querySelector('[aria-modal="true"]') ||
        (document.body && (
          document.body.classList.contains('overflow-hidden') ||
          document.body.style.overflow === 'hidden'
        ));
      setIsModalOpen(Boolean(modal));
    };

    checkModal();
    const observer = new MutationObserver(checkModal);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'open'],
    });

    const handleMenuEvent = () => setTimeout(checkModal, 50);
    window.addEventListener('toggle-mobile-menu', handleMenuEvent);

    return () => {
      observer.disconnect();
      window.removeEventListener('toggle-mobile-menu', handleMenuEvent);
    };
  }, []);

  // ── 1. Target Button Locator on Product & Checkout Pages ──
  // Points elongated finger directly towards Buy Now / Add to Cart / Checkout button
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
          // Safe on LEFT side pointing elongated finger right towards buy-box
          if (dockSide !== 'left') {
            setDockSide('left');
            const x = getSafeX('left');
            walkTo(x, false);
          }
          return;
        }
      }
    } else if (pathname === '/cart') {
      const checkoutBtn =
        document.getElementById('halum-checkout-btn') ||
        document.querySelector('[data-halum-target="checkout"]');

      if (checkoutBtn) {
        setHasTargetOnScreen(true);
        setCharacterState('pointing');
        return;
      }
    }

    setHasTargetOnScreen(false);
  }, [isDragging, isChatOpen, isCartDrawerOpen, isModalOpen, pathname, dockSide, getSafeX, walkTo]);

  // ── 2. Obstruction Avoidance: Move to Empty Safe Space ──
  const checkObstruction = useCallback(() => {
    if (isDragging || isChatOpen || isCartDrawerOpen || isModalOpen) return;
    if (pathname.startsWith('/products/')) return; // Product page stays left
    if (!widgetRef.current) return;

    const box = widgetRef.current.getBoundingClientRect();
    if (!box || box.width === 0) return;

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
        walkTo(newX, nextSide === 'right');
        try {
          localStorage.setItem('halum_side', nextSide);
        } catch (e) {}
        return nextSide;
      });
    }
  }, [isDragging, isChatOpen, isCartDrawerOpen, isModalOpen, pathname, getSafeX, walkTo]);

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

  // Navigation intelligence - Controlled by Central Route Config
  useEffect(() => {
    if (!mounted) return;

    const config = getHalumConfigForRoute(pathname);
    const targetSide = config.side || 'left';
    setDockSide(targetSide);
    setFacingLeft(targetSide === 'right');
    const x = getSafeX(targetSide);
    setPositionX(x);

    if (config.defaultState && config.defaultState !== 'idle') {
      setCharacterState(config.defaultState);
      const timer = setTimeout(() => setCharacterState('idle'), 4500);
      return () => clearTimeout(timer);
    }

    if (pathname.startsWith('/products/')) {
      const timer = setTimeout(() => checkTargetButtons(), 600);
      return () => clearTimeout(timer);
    }
  }, [pathname, mounted, getSafeX, checkTargetButtons]);

  // Celebration on cart add
  useEffect(() => {
    if (lastAddedItem && lastAddedItem !== prevLastAddedRef.current) {
      prevLastAddedRef.current = lastAddedItem;
      setItemJustAdded(true);
      setCharacterState('happy');
      const timer = setTimeout(() => {
        setItemJustAdded(false);
        setCharacterState('idle');
      }, 6000);
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
      setFacingLeft(newSide === 'right');
      const targetX = getSafeX(newSide);
      walkTo(targetX, newSide === 'right');
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

  const shouldAutoHide = isCartDrawerOpen || isModalOpen;
  const effectiveMinimized = isMinimized;
  const cartSubtotal = useCartStore((state) => state.getTotalPrice());

  return (
    <>
      {/* ── 2.5D Animated Flying / Roaming Character Container ── */}
      {/* Vertically centered at screen eye-level (between top and bottom) */}
      {/* Horizontally clamped with positionX (default LEFT side, safe bounded) */}
      <div
        ref={widgetRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: 'fixed',
          top: '48%',
          transform: `translateY(-50%) scale(${
            welcomeStep === 1 ? 1.22 : shouldAutoHide ? 0 : 1
          })`,
          left: `${positionX}px`,
          transition: isDragging
            ? 'none'
            : isMoving
            ? 'left 0.85s cubic-bezier(0.22, 1, 0.36, 1), transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease'
            : 'left 0.35s ease-out, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease',
          zIndex: shouldAutoHide ? 0 : 50,
          touchAction: 'none',
        }}
        className={`flex flex-col select-none ${
          dockSide === 'left' ? 'items-start' : 'items-end'
        } ${
          shouldAutoHide
            ? 'opacity-0 scale-0 pointer-events-none invisible'
            : 'opacity-100 scale-100 pointer-events-none'
        } ${isScrolling ? 'opacity-75' : ''} transition-all duration-300`}
      >
        {/* Compact Smart Speech Bubble perched directly over Halum's head */}
        {!effectiveMinimized && !shouldAutoHide && (
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
              welcomeStep={welcomeStep}
              lastAddedItem={itemJustAdded ? lastAddedItem : null}
            />
          </div>
        )}

        {/* 2.5D Animated Mascot Character */}
        <div
          className={`pointer-events-auto cursor-grab active:cursor-grabbing ${
            dockSide === 'left' ? 'ml-1' : 'mr-1'
          }`}
        >
          <HalumTigerAnimation
            state={characterState}
            onClick={() => handleToggleChat()}
            isMinimized={effectiveMinimized}
            pointDirection={dockSide === 'left' ? 'right' : 'left'}
            isMoving={isMoving}
            facingLeft={facingLeft}
            cartSubtotal={cartSubtotal}
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
