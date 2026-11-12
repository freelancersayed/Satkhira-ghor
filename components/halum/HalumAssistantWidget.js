'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import HalumTigerAnimation from './HalumTigerAnimation';
import HalumSpeechBubble from './HalumSpeechBubble';
import HalumChatWindow from './HalumChatWindow';
import { useCartStore } from '@/store/cartStore';

export default function HalumAssistantWidget() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // 'idle' | 'greeting' | 'listening' | 'praising' | 'dancing' | 'saluting' | 'pointing' | 'talking' | 'thinking' | 'proud' | 'happy'
  const [characterState, setCharacterState] = useState('idle');

  // Smart Adaptive Positioning states
  const [isLeftSide, setIsLeftSide] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [hasTargetOnScreen, setHasTargetOnScreen] = useState(false);
  const [targetType, setTargetType] = useState('general');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cart drawer state for Auto-Minimize
  const isCartDrawerOpen = useCartStore((state) => state.isOpen);
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

  // Detect DOM Modals & Overlays for Auto-Minimize (Requirement 1 & 4)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkModal = () => {
      const modal =
        document.querySelector('[role="dialog"]') ||
        document.querySelector('.modal-backdrop') ||
        document.querySelector('.admin-modal') ||
        document.body.classList.contains('overflow-hidden');
      setIsModalOpen(Boolean(modal));
    };

    const observer = new MutationObserver(checkModal);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    return () => observer.disconnect();
  }, []);

  // Listen to user scroll to dim & shrink non-intrusively (Requirement 5)
  useEffect(() => {
    let scrollTimer = null;
    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => setIsScrolling(false), 700);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimer);
    };
  }, []);

  // Autonomous Target Button Locator & Route Intelligence
  useEffect(() => {
    if (!mounted) return;

    const restoreSidePreference = () => {
      try {
        const savedSide = localStorage.getItem('halum_side');
        setIsLeftSide(savedSide === 'left');
      } catch (e) {
        setIsLeftSide(false);
      }
    };

    let checkTargetTimer = null;

    if (pathname.startsWith('/products/')) {
      // On product detail page:
      // Halum positions on the safe LEFT side to leave the right-hand Buy Box 100% unobstructed!
      setIsLeftSide(true);
      setTargetType('add-to-cart');

      checkTargetTimer = setTimeout(() => {
        const targetBtn =
          document.getElementById('halum-buy-now-btn') ||
          document.getElementById('halum-add-to-cart-btn') ||
          document.querySelector('[data-halum-target="add-to-cart"]');

        if (targetBtn) {
          setHasTargetOnScreen(true);
          setCharacterState('pointing');
        } else {
          setHasTargetOnScreen(false);
          setCharacterState('proud');
        }
      }, 500);

      return () => clearTimeout(checkTargetTimer);
    } else if (pathname === '/cart') {
      restoreSidePreference();
      setTargetType('checkout');

      checkTargetTimer = setTimeout(() => {
        const checkoutBtn =
          document.getElementById('halum-checkout-btn') ||
          document.querySelector('[data-halum-target="checkout"]');

        if (checkoutBtn) {
          setHasTargetOnScreen(true);
          setCharacterState('pointing');
        } else {
          setHasTargetOnScreen(false);
          setCharacterState('happy');
        }
      }, 500);

      return () => clearTimeout(checkTargetTimer);
    } else if (pathname === '/track-order') {
      restoreSidePreference();
      setHasTargetOnScreen(false);
      setTargetType('general');
      setCharacterState('saluting');
      const timer = setTimeout(() => setCharacterState('idle'), 4000);
      return () => clearTimeout(timer);
    } else if (pathname === '/') {
      restoreSidePreference();
      setHasTargetOnScreen(false);
      setTargetType('general');
      setCharacterState('greeting');
      const timer = setTimeout(() => setCharacterState('idle'), 3500);
      return () => clearTimeout(timer);
    } else {
      restoreSidePreference();
      setHasTargetOnScreen(false);
      setTargetType('general');
    }
  }, [pathname, mounted]);

  // When item is added to cart, Halum rejoices with celebration animation
  useEffect(() => {
    if (lastAddedItem) {
      setCharacterState('happy');
      const timer = setTimeout(() => {
        setCharacterState('idle');
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [lastAddedItem]);

  // Listen to order confirmed custom event
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

  // Side swap toggle (Left <-> Right) with safe persistence
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

  // Direct 1-Tap Execution: Triggers on-screen target button with visual highlight
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

  // Do not render on admin dashboard
  if (pathname.startsWith('/admin')) {
    return null;
  }

  if (!mounted) {
    return null;
  }

  const handleToggleChat = () => {
    if (effectiveMinimized && (isCartDrawerOpen || isModalOpen)) {
      setIsMinimized(false);
      return;
    }
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

  // ── Auto-Minimize Condition (Requirement 1 & 4) ──
  // When Cart Drawer is open, modal is open, or on /cart checkout page, auto-minimize Halum and drop z-index
  const shouldAutoMinimize = isCartDrawerOpen || isModalOpen || pathname === '/cart';
  const effectiveMinimized = isMinimized || shouldAutoMinimize;

  // Determine pointing arm direction
  const pointDirection = isLeftSide ? 'right' : 'left';

  return (
    <>
      {/* ── Floating Character Widget & Speech Bubble Container with Adaptive Positioning ── */}
      <div
        className={`fixed flex flex-col pointer-events-none transition-all duration-300 ease-in-out ${
          shouldAutoMinimize ? 'z-20 opacity-60' : 'z-50 opacity-100'
        } ${
          isLeftSide
            ? 'bottom-[calc(76px+env(safe-area-inset-bottom,0px))] md:bottom-6 left-3 sm:left-6 items-start'
            : 'bottom-[calc(76px+env(safe-area-inset-bottom,0px))] md:bottom-6 right-3 sm:right-6 items-end'
        } ${isScrolling ? 'opacity-30 scale-90' : ''}`}
      >
        {/* Speech Bubble (hidden in minimized mode) */}
        {!effectiveMinimized && (
          <div className="pointer-events-auto">
            <HalumSpeechBubble
              isOpen={isChatOpen}
              onOpenChat={() => {
                setIsChatOpen(true);
                try {
                  sessionStorage.setItem('halum_welcome_dismissed', 'true');
                } catch (e) {}
              }}
              pathname={pathname}
              isLeftSide={isLeftSide}
              onToggleSide={handleToggleSide}
              onMinimize={handleToggleMinimize}
              onTriggerTargetAction={handleTriggerTargetAction}
              hasTargetOnScreen={hasTargetOnScreen}
              targetType={targetType}
            />
          </div>
        )}

        {/* Halum Tiger Character */}
        <div className="pointer-events-auto">
          <HalumTigerAnimation
            state={characterState}
            onClick={handleToggleChat}
            isMinimized={effectiveMinimized}
            pointDirection={pointDirection}
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
