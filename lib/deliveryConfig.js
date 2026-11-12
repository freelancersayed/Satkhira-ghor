// ─────────────────────────────────────────────────────────────
// Satkhira Ghor Centralized Delivery & Customer Care Config
// Single Source of Truth for Store, Checkout, Drawer & Halum Mama
// ─────────────────────────────────────────────────────────────

export const deliveryConfig = {
  // Free delivery threshold in BDT
  freeDeliveryThreshold: 1500,

  // Delivery Charges
  insideDhaka: 70,
  outsideDhaka: 120,
  subDhaka: 100,

  // Support & Contact
  supportPhone: '০১৯০৮-৯৪৫১৪৫',
  supportPhoneRaw: '01908945145',
  supportWhatsApp: 'https://wa.me/8801908945145',
  supportEmail: 'satkhiraghor@gmail.com',

  // Upsell trigger limits
  upsellNearThresholdMin: 1100, // Starts nudging when cart is >= 1100
};

/**
 * Calculates delivery fee based on subtotal and location
 */
export function calculateDeliveryFee(subtotal, location = 'dhaka') {
  if (subtotal <= 0) return 0;
  if (subtotal >= deliveryConfig.freeDeliveryThreshold) return 0;
  return location === 'outside'
    ? deliveryConfig.outsideDhaka
    : deliveryConfig.insideDhaka;
}

/**
 * Returns remaining amount needed for free delivery
 */
export function getRemainingForFreeDelivery(subtotal) {
  if (subtotal >= deliveryConfig.freeDeliveryThreshold) return 0;
  return Math.max(0, deliveryConfig.freeDeliveryThreshold - subtotal);
}

