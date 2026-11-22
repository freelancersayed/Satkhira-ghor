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

/**
 * Merges dynamic settings from database (SiteContent) with hardcoded deliveryConfig fallbacks.
 * Ensures consistent values across checkout, cart, header, footer and AI agent.
 */
export function getMergedDeliveryConfig(dynamicSettings = {}) {
  if (!dynamicSettings || typeof dynamicSettings !== 'object') {
    return deliveryConfig;
  }

  const freeThreshold =
    dynamicSettings.freeDeliveryThreshold !== undefined && dynamicSettings.freeDeliveryThreshold !== ''
      ? Number(dynamicSettings.freeDeliveryThreshold)
      : deliveryConfig.freeDeliveryThreshold;

  const inside =
    dynamicSettings.insideSatkhiraCharge !== undefined && dynamicSettings.insideSatkhiraCharge !== ''
      ? Number(dynamicSettings.insideSatkhiraCharge)
      : deliveryConfig.insideSatkhira;

  const outside =
    dynamicSettings.outsideSatkhiraCharge !== undefined && dynamicSettings.outsideSatkhiraCharge !== ''
      ? Number(dynamicSettings.outsideSatkhiraCharge)
      : deliveryConfig.outsideSatkhira;

  const phone = dynamicSettings.helpline || deliveryConfig.supportPhone;
  const rawPhone =
    (phone || '')
      .replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d))
      .replace(/[^\d+]/g, '') || deliveryConfig.supportPhoneRaw;

  let wa = dynamicSettings.whatsapp || deliveryConfig.supportWhatsApp;
  if (wa && !wa.startsWith('http')) {
    const waDigits = wa
      .replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d))
      .replace(/[^\d]/g, '');
    const cleanWa = waDigits.startsWith('88') ? waDigits : `88${waDigits}`;
    wa = `https://wa.me/${cleanWa}`;
  }

  const email = dynamicSettings.email || deliveryConfig.supportEmail;
  const bkash = dynamicSettings.bkashNumber || deliveryConfig.bkashNumber;
  const bkashRaw =
    (bkash || '')
      .replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d))
      .replace(/[^\d]/g, '') || deliveryConfig.bkashNumberRaw;
  const bkashType = dynamicSettings.bkashType || deliveryConfig.bkashType;

  const nagad = dynamicSettings.nagadNumber || deliveryConfig.nagadNumber;
  const nagadRaw =
    (nagad || '')
      .replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d))
      .replace(/[^\d]/g, '') || deliveryConfig.nagadNumberRaw;
  const nagadType = dynamicSettings.nagadType || deliveryConfig.nagadType;

  return {
    ...deliveryConfig,
    freeDeliveryThreshold: isNaN(freeThreshold) ? 1500 : freeThreshold,
    insideSatkhira: isNaN(inside) ? 70 : inside,
    outsideSatkhira: isNaN(outside) ? 120 : outside,
    supportPhone: phone,
    supportPhoneRaw: rawPhone,
    supportWhatsApp: wa,
    supportEmail: email,
    bkashNumber: bkash,
    bkashNumberRaw: bkashRaw,
    bkashType: bkashType,
    nagadNumber: nagad,
    nagadNumberRaw: nagadRaw,
    nagadType: nagadType,
    rocketNumber: dynamicSettings.rocketNumber || '',
    storeAddress: dynamicSettings.storeAddress || 'শ্যামনগর রোড, সাতক্ষীরা সদর, খুলনা বিভাগ, বাংলাদেশ',
    supportTime: dynamicSettings.supportTime || 'সকাল ৯:০০ - রাত ১০:০০',
    facebookUrl: dynamicSettings.facebookUrl || 'https://facebook.com',
    youtubeUrl: dynamicSettings.youtubeUrl || 'https://youtube.com',
    topNotice: dynamicSettings.topNotice || '',
  };
}


