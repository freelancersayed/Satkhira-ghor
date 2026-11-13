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

  // Autonomous 2D Screen Navigation States (Full X & Y Freedom across the screen!)
  const [positionX, setPositionX] = useState(14);
  const [positionY, setPositionY] = useState(null); // Initialized on client mount
  const [dockSide, setDockSide] = useState('left'); // 'left' | 'right' (Default: LEFT side!)
  const [pointDirection, setPointDirection] = useState('right'); // 'left' | 'right'
  const [isMoving, setIsMoving] = useState(false);
  const [facingLeft, setFacingLeft] = useState(false); // looking towards webpage content
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false); // ALWAYS false by default on mobile!
  const [isScrollMinimized, setIsScrollMinimized] = useState(false); // Auto-minimize when scrolling down on product routes
  const [isScrolling, setIsScrolling] = useState(false);
  const [isScrollAsking, setIsScrollAsking] = useState(false);
  const [hasTargetOnScreen, setHasTargetOnScreen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [welcomeStep, setWelcomeStep] = useState(0); // 0: none, 1: grand welcome, 2: help ask
  const [itemJustAdded, setItemJustAdded] = useState(false);

  const prevLastAddedRef = useRef(null);
  const widgetRef = useRef(null);
  const activeTargetElRef = useRef(null);
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
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const cartSubtotal = getTotalPrice ? getTotalPrice() : 0;

  // Helper: Calculate strictly bounded horizontal safe coordinates
  // Mathematical guarantee: Halum and his speech bubble NEVER cross screen left or right edges!
  const getSafeX = useCallback((side) => {
    if (typeof window === 'undefined') return 14;
    const isMobile = window.innerWidth < 640;
    const widgetWidth = isMobile ? 74 : 96;
    const safeMargin = isMobile ? 12 : 20;

    if (side === 'left') {
      return safeMargin;
    } else {
      return Math.max(safeMargin, window.innerWidth - widgetWidth - safeMargin);
    }
  }, []);

  // Helper: Default comfortable eye-level vertical position (between top and bottom)
  const getDefaultY = useCallback(() => {
    if (typeof window === 'undefined') return 300;
    return Math.round(window.innerHeight * 0.46);
  }, []);

  // Butter-Smooth 2D Animated Glide to (X, Y) Coordinates anywhere on screen
  const glideTo = useCallback(
    (targetX, targetY = null, newFacingLeft = null, newPointDir = null, onComplete = null) => {
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

      if (targetY !== null && typeof targetY === 'number') {
        setPositionY(targetY);
      }

      if (newPointDir) {
        setPointDirection(newPointDir);
      }

      const moveTimer = setTimeout(() => {
        setIsMoving(false);
        if (onComplete) onComplete();
      }, 800);

      return () => clearTimeout(moveTimer);
    },
    []
  );

  // Initialize position on mount - Controlled by Central Route Config
  useEffect(() => {
    setMounted(true);
    const config = getHalumConfigForRoute(pathname);
    const initialSide = config.side || 'left';

    setDockSide(initialSide);
    setFacingLeft(initialSide === 'right');
    setPointDirection(initialSide === 'left' ? 'right' : 'left');

    const x = getSafeX(initialSide);
    const y = getDefaultY();

    setPositionX(x);
    setPositionY(y);
  }, [pathname, getSafeX, getDefaultY]);

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
      if (!isDragging && !hasTargetOnScreen) {
        const x = getSafeX(dockSide);
        const y = getDefaultY();
        setPositionX(x);
        setPositionY(y);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mounted, dockSide, isDragging, hasTargetOnScreen, getSafeX, getDefaultY]);

  // Detect strictly active modals, drawers & mobile hamburger menu
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkModal = () => {
      const modal =
        document.querySelector('dialog[open]') ||
        document.querySelector('[role="dialog"]') ||
        document.querySelector('.admin-modal') ||
        document.querySelector('[aria-modal="true"]') ||
        (document.body &&
          (document.body.classList.contains('overflow-hidden') ||
            document.body.style.overflow === 'hidden'));
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

  // ── 1. Autonomous 2D Target Navigation & Pointing System ──
  // User Requirement:
  // "বাঘ টা প্রয়োজনে সমস্ত স্ক্রিনে ঘুরে বেড়াতে পারবে এবং সঠিক লোকেশন বা সঠিক বাটনের পাশে গিয়ে আঙ্গুল দিয়ে দেখাবে
  // এবং বলবে এখানে ক্লিক কর এক কথায় বাঘটি কিত্রিম বুদ্ধিমত্তার মতো কাজ করবে...
  // আর একটা জিনিস মাথায় রাখবা বাঘের স্পিস টেক্স এর জন্য কোন বাটন বা লেখা ঢাকা না পড়ে যায়"
  const checkTargetButtons = useCallback(() => {
    if (isDragging || isChatOpen || isCartDrawerOpen || isModalOpen) return;

    const isElementInViewport = (el) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return false;
      // Must be visibly located within safe vertical viewport area
      return r.top >= 60 && r.bottom <= window.innerHeight - 70;
    };

    let targetBtn = null;

    // 1. Product details page priority targets (Buy Now / Add to Cart)
    if (pathname.startsWith('/products/')) {
      const buyNowBtn =
        document.getElementById('halum-buy-now-btn') ||
        document.querySelector('[data-halum-target="buy-now"]');
      if (isElementInViewport(buyNowBtn)) {
        targetBtn = buyNowBtn;
      } else {
        const addToCartBtn =
          document.getElementById('halum-add-to-cart-btn') ||
          document.querySelector('[data-halum-target="add-to-cart"]');
        if (isElementInViewport(addToCartBtn)) {
          targetBtn = addToCartBtn;
        }
      }
    }
    // 2. Cart / Checkout page priority targets
    else if (pathname === '/cart') {
      const checkoutBtn =
        document.getElementById('halum-checkout-btn') ||
        document.querySelector('[data-halum-target="checkout"]');
      if (isElementInViewport(checkoutBtn)) {
        targetBtn = checkoutBtn;
      }
    }
    // 3. Track page priority targets
    else if (pathname === '/track' || pathname === '/track-order') {
      const trackBtn =
        document.getElementById('halum-track-submit-btn') ||
        document.querySelector('[data-halum-target="track"]');
      if (isElementInViewport(trackBtn)) {
        targetBtn = trackBtn;
      }
    }
    // 4. Shop / Home page: first visible product card action button in viewport
    else if (pathname === '/shop' || pathname === '/') {
      const cardBtns = document.querySelectorAll(
        'button[data-halum-product-card-btn="buy"], button[data-halum-product-card-btn="cart"], .product-card button, [data-product-card] button'
      );
      for (const btn of cardBtns) {
        if (isElementInViewport(btn)) {
          targetBtn = btn;
          break;
        }
      }
    }

    if (targetBtn) {
      // Target Identified! Compute non-obstructive safe adjacent coordinates
      const r = targetBtn.getBoundingClientRect();
      const isMobile = window.innerWidth < 640;
      const halumW = isMobile ? 74 : 96;
      const halumH = isMobile ? 74 : 96;
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;

      const roomOnLeft = r.left;
      const roomOnRight = screenW - r.right;
      const requiredRoom = halumW + 16;

      let targetX, targetY, newFacing, newPointDir, newDock;

      // ── Zero-Obstruction Placement Math: Halum and speech bubble NEVER cover the button or text! ──
      if (roomOnLeft >= requiredRoom && roomOnLeft >= roomOnRight) {
        // Option A: Stand to the LEFT of the button
        targetX = Math.max(10, r.left - halumW - 10);
        targetY = Math.max(70, Math.min(screenH - halumH - 85, r.top + r.height / 2 - halumH / 2));
        newFacing = false; // look right at button
        newPointDir = 'right'; // point elongated finger right at button
        newDock = 'right'; // bubble anchored to stay leftwards, clear of button
      } else if (roomOnRight >= requiredRoom) {
        // Option B: Stand to the RIGHT of the button
        targetX = Math.min(screenW - halumW - 10, r.right + 10);
        targetY = Math.max(70, Math.min(screenH - halumH - 85, r.top + r.height / 2 - halumH / 2));
        newFacing = true; // look left at button
        newPointDir = 'left'; // point elongated finger left at button
        newDock = 'left'; // bubble anchored to stay rightwards, clear of button
      } else {
        // Option C: Full-width button on mobile (e.g. wide checkout button)
        // Stand safely ABOVE button at left margin
        targetX = 12;
        targetY = Math.max(65, r.top - halumH - 18);
        newFacing = false;
        newPointDir = 'right';
        newDock = 'left';
      }

      // Clean up previous highlight if target changed
      if (activeTargetElRef.current && activeTargetElRef.current !== targetBtn) {
        activeTargetElRef.current.classList.remove(
          'ring-4',
          'ring-[#FAB116]',
          'ring-offset-2',
          'animate-pulse'
        );
      }

      // Highlight target button with pulsing golden ring
      targetBtn.classList.add(
        'ring-4',
        'ring-[#FAB116]',
        'ring-offset-2',
        'animate-pulse'
      );
      activeTargetElRef.current = targetBtn;

      setHasTargetOnScreen(true);
      setCharacterState('pointing');
      setDockSide(newDock);
      glideTo(targetX, targetY, newFacing, newPointDir);
      return;
    }

    // No target in viewport -> Remove ring highlight and glide back smoothly to safe dock!
    if (activeTargetElRef.current) {
      activeTargetElRef.current.classList.remove(
        'ring-4',
        'ring-[#FAB116]',
        'ring-offset-2',
        'animate-pulse'
      );
      activeTargetElRef.current = null;
    }

    if (hasTargetOnScreen) {
      setHasTargetOnScreen(false);
      setCharacterState('idle');
      const defaultSide = getHalumConfigForRoute(pathname).side || 'left';
      const defaultX = getSafeX(defaultSide);
      const defaultY = getDefaultY();
      setDockSide(defaultSide);
      glideTo(
        defaultX,
        defaultY,
        defaultSide === 'right',
        defaultSide === 'left' ? 'right' : 'left'
      );
    }
  }, [
    isDragging,
    isChatOpen,
    isCartDrawerOpen,
    isModalOpen,
    pathname,
    hasTargetOnScreen,
    getSafeX,
    getDefaultY,
    glideTo,
  ]);

  // ── 2. Obstruction Avoidance when Idle: Move to Empty Safe Space ──
  const checkObstruction = useCallback(() => {
    if (isDragging || isChatOpen || isCartDrawerOpen || isModalOpen || hasTargetOnScreen) return;
    if (pathname.startsWith('/products/')) return; // Product page handled by target scanner
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
        const newY = getDefaultY();
        glideTo(newX, newY, nextSide === 'right', nextSide === 'left' ? 'right' : 'left');
        try {
          localStorage.setItem('halum_side', nextSide);
        } catch (e) {}
        return nextSide;
      });
    }
  }, [
    isDragging,
    isChatOpen,
    isCartDrawerOpen,
    isModalOpen,
    hasTargetOnScreen,
    pathname,
    getSafeX,
    getDefaultY,
    glideTo,
  ]);

  // ── 3. Scroll Listener: Auto-Minimize on Product Browsing routes (Requirement 3) ──
  // User Requirement: "হোম বা /shop পেজে মোবাইল ইউজার যখন প্রোডাক্ট দেখার জন্য নিচে স্ক্রল করবে,
  // তখন বাঘ মামার স্পিচ বাবল স্বয়ংক্রিয়ভাবে কলাপ্স হয়ে শুধু ছোট মিনিমাইজড আইকন অবস্থায় থাকবে—যেন কোনো প্রোডাক্ট কার্ড বা বাটন ঢেকে না যায়।"
  useEffect(() => {
    let scrollTimer = null;

    const handleScroll = () => {
      setIsScrolling(true);

      const isMobile = window.innerWidth < 640;
      const isBrowsingRoute =
        pathname === '/' || pathname === '/shop' || pathname.startsWith('/shop');
      const scrolledDown = window.scrollY > 80;

      if (isMobile && isBrowsingRoute && scrolledDown) {
        setIsScrollMinimized(true);
        setIsScrollAsking(false);
      } else if (window.scrollY <= 40) {
        setIsScrollMinimized(false);
      }

      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        setIsScrolling(false);

        // When not auto-minimized on browsing route, perform target locator
        if (!(isMobile && isBrowsingRoute && scrolledDown)) {
          checkTargetButtons();
          checkObstruction();
        }
      }, 250);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimer);
      clearTimeout(scrollAskTimeoutRef.current);
    };
  }, [pathname, checkTargetButtons, checkObstruction]);

  // Navigation intelligence - Controlled by Central Route Config
  useEffect(() => {
    if (!mounted) return;

    setIsScrollMinimized(false);
    const config = getHalumConfigForRoute(pathname);
    const targetSide = config.side || 'left';
    setDockSide(targetSide);
    setFacingLeft(targetSide === 'right');
    setPointDirection(targetSide === 'left' ? 'right' : 'left');

    const x = getSafeX(targetSide);
    const y = getDefaultY();
    setPositionX(x);
    setPositionY(y);

    if (config.defaultState && config.defaultState !== 'idle') {
      setCharacterState(config.defaultState);
      const timer = setTimeout(() => setCharacterState('idle'), 4500);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => checkTargetButtons(), 600);
    return () => clearTimeout(timer);
  }, [pathname, mounted, getSafeX, getDefaultY, checkTargetButtons]);

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

  // ── 5. Full 2D Touch & Mouse Drag-and-Drop (Anywhere on Screen) ──
  const handlePointerDown = (e) => {
    if (e.target.closest('button, a, input, [role="button"]')) return;

    dragRef.current = {
      isDown: true,
      startX: e.clientX,
      startY: e.clientY,
      initX: positionX,
      initY: positionY !== null ? positionY : getDefaultY(),
      hasMoved: false,
      startTime: Date.now(),
    };

    setIsDragging(true);
    if (e.currentTarget.setPointerCapture) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current.isDown) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      dragRef.current.hasMoved = true;
    }

    const isMobile = window.innerWidth < 640;
    const widgetWidth = isMobile ? 74 : 96;
    const widgetHeight = isMobile ? 74 : 96;
    const safeMarginX = isMobile ? 10 : 20;

    // Strictly clamped inside 2D screen boundaries!
    const minX = safeMarginX;
    const maxX = Math.max(safeMarginX, window.innerWidth - widgetWidth - safeMarginX);
    const minY = 65; // Below header
    const maxY = Math.max(minY, window.innerHeight - widgetHeight - 85); // Above mobile dock / safe area

    const newX = Math.max(minX, Math.min(dragRef.current.initX + dx, maxX));
    const newY = Math.max(minY, Math.min(dragRef.current.initY + dy, maxY));

    setPositionX(newX);
    setPositionY(newY);
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
      setPointDirection(newSide === 'left' ? 'right' : 'left');
      try {
        localStorage.setItem('halum_side', newSide);
      } catch (err) {}
    }
  };

  // Direct 1-Tap Trigger Target Action
  const handleTriggerTargetAction = useCallback(() => {
    if (activeTargetElRef.current) {
      const btn = activeTargetElRef.current;
      btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      btn.click();
      setCharacterState('happy');
      setTimeout(() => {
        if (activeTargetElRef.current) {
          activeTargetElRef.current.classList.remove(
            'ring-4',
            'ring-[#FAB116]',
            'ring-offset-2',
            'animate-pulse'
          );
          activeTargetElRef.current = null;
        }
        setCharacterState('idle');
      }, 3500);
    } else if (pathname.startsWith('/products/')) {
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
      setIsScrollMinimized(false);
      setIsChatOpen(true);
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
  const effectiveMinimized = isMinimized || isScrollMinimized;

  return (
    <>
      {/* ── 2D Autonomous Screen Navigation Mascot Container ── */}
      {/* Positioned dynamically in 2D space (top & left) anywhere on the screen */}
      <div
        ref={widgetRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: 'fixed',
          top: `${positionY !== null ? positionY : 300}px`,
          left: `${positionX}px`,
          transform: `scale(${welcomeStep === 1 ? 1.22 : shouldAutoHide ? 0 : 1})`,
          transition: isDragging
            ? 'none'
            : isMoving
            ? 'left 0.8s cubic-bezier(0.22, 1, 0.36, 1), top 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease'
            : 'left 0.35s ease-out, top 0.35s ease-out, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease',
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
        {/* Stitched Comic Speech Bubble Matching User's Screenshot Exactly */}
        {!effectiveMinimized && !shouldAutoHide && (
          <div className="pointer-events-auto">
            <HalumSpeechBubble
              isOpen={isChatOpen}
              onOpenChat={() => handleToggleChat()}
              onSendMessage={(query) => handleToggleChat(query)}
              pathname={pathname}
              isLeftSide={dockSide === 'left'}
              tailPosition={dockSide === 'left' ? 'left' : 'right'}
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
            pointDirection={pointDirection}
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
