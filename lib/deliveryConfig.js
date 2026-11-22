// ─────────────────────────────────────────────────────────────
// Satkhira Ghor Centralized Delivery & Customer Care Config
// Single Source of Truth for Store, Checkout, Drawer & Halum Mama
// ─────────────────────────────────────────────────────────────

export const deliveryConfig = {
  // Free delivery threshold in BDT
  freeDeliveryThreshold: 1500,

  // Delivery Charges
  insideSatkhira: 70,
  outsideSatkhira: 120,
  insideDhaka: 70, // Backwards compatibility alias
  outsideDhaka: 120, // Backwards compatibility alias
  subDhaka: 100,

  // Support & Contact
  supportPhone: '০১৯০৮-৯৪৫১৪৫',
  supportPhoneRaw: '01908945145',
  supportWhatsApp: 'https://wa.me/8801908945145',
  supportEmail: 'satkhiraghor@gmail.com',

  // Mobile Banking Payment Numbers (bKash & Nagad)
  bkashNumber: '০১৯০৮-৯৪৫১৪৫',
  bkashNumberRaw: '01908945145',
  bkashType: 'Send Money (Personal)',
  nagadNumber: '০১৯০৮-৯৪৫১৪৫',
  nagadNumberRaw: '01908945145',
  nagadType: 'Send Money (Personal)',

  // Upsell trigger limits
  upsellNearThresholdMin: 1100, // Starts nudging when cart is >= 1100
};

/**
 * Calculates delivery fee based on subtotal and location
 */
export function calculateDeliveryFee(subtotal, location = 'satkhira') {
  if (subtotal <= 0) return 0;
  if (subtotal >= deliveryConfig.freeDeliveryThreshold) return 0;
  const isInside =
    location === 'satkhira' ||
    location === 'inside' ||
    location === 'সাতক্ষীরা' ||
    location === 'সাতক্ষীরার ভেতরে' ||
    location === 'dhaka';
  return isInside
    ? deliveryConfig.insideSatkhira
    : deliveryConfig.outsideSatkhira;
}

/**
 * Returns remaining amount needed for free delivery
 */
export function getRemainingForFreeDelivery(subtotal) {
  if (subtotal >= deliveryConfig.freeDeliveryThreshold) return 0;
  return Math.max(0, deliveryConfig.freeDeliveryThreshold - subtotal);
}

