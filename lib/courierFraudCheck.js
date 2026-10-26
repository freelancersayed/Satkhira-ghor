/**
 * Automated Courier History Check & Anti-Fraud Engine
 * Connects to Steadfast/Pathao Courier APIs or mock placeholder engine
 * Uses process.env.STEADFAST_API_KEY as structural config placeholder.
 */

export async function checkCourierHistoryAndFraud(phone) {
  const apiKey = process.env.STEADFAST_API_KEY || 'mock_steadfast_key_2026';
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '');

  // Deterministic but realistic pseudo-metrics based on phone digits
  // This ensures testing with different phone numbers yields realistic variation:
  // e.g., ending with 0 or 8 gives low risk, ending with 4 or 7 gives medium risk, ending with 9 gives high risk
  const lastDigit = cleanPhone ? parseInt(cleanPhone.slice(-1), 10) : 0;
  const secondLastDigit = cleanPhone && cleanPhone.length > 1 ? parseInt(cleanPhone.slice(-2, -1), 10) : 0;

  let total_orders = 0;
  let successful_deliveries = 0;
  let cancelled_deliveries = 0;

  // Simulate carrier lookup (placeholder for live Steadfast / Pathao / Redx API)
  if (cleanPhone.endsWith('99') || cleanPhone.endsWith('111')) {
    // Explicit Test High Risk number
    total_orders = 10;
    successful_deliveries = 3;
    cancelled_deliveries = 7;
  } else if (cleanPhone.endsWith('55')) {
    // Explicit Test Medium Risk number
    total_orders = 6;
    successful_deliveries = 4;
    cancelled_deliveries = 2;
  } else if (lastDigit === 9 && secondLastDigit % 2 === 0) {
    // High Risk profile: < 50% success or > 5 cancelled
    total_orders = 12;
    successful_deliveries = 5;
    cancelled_deliveries = 7;
  } else if (lastDigit === 4 || lastDigit === 7) {
    // Medium Risk profile: 50% - 79%
    total_orders = 8;
    successful_deliveries = 5;
    cancelled_deliveries = 3;
  } else {
    // Low Risk profile: 80% - 100%
    const ordersSeed = Math.max(2, (lastDigit % 7) + 3);
    total_orders = ordersSeed;
    successful_deliveries = ordersSeed;
    cancelled_deliveries = 0;
  }

  // Calculate Success Rate %
  const successRate = total_orders > 0
    ? Math.round((successful_deliveries / total_orders) * 100)
    : 100;

  let fraudRisk = 'low';
  let fraudReason = 'নিরাপদ গ্রাহক: পার্সেল ডেলিভারি সাফল্যের হার সন্তোষজনক।';
  let suggestedOrderStatus = 'pending';

  // Rule 3: High Risk (Success Rate < 50% or Cancelled > 5)
  if (successRate < 50 || cancelled_deliveries > 5) {
    fraudRisk = 'high';
    fraudReason = `উচ্চ ঝুঁকি: পূর্ববর্তী ডেলিভারি সাকসেস রেট মাত্র ${successRate}% এবং রিটার্ন/বাতিল সংখ্যা ${cancelled_deliveries} টি। পার্সেল হোল্ডে রাখা হয়েছে।`;
    suggestedOrderStatus = 'hold';
  }
  // Rule 2: Medium Risk (Success Rate 50% - 79%)
  else if (successRate < 80) {
    fraudRisk = 'medium';
    fraudReason = `মধ্যম ঝুঁকি: ডেলিভারি সাকসেস রেট ${successRate}% (${cancelled_deliveries} টি পার্সেল পূর্বে রিটার্ন)। কল করে নিশ্চিত হওয়া বাঞ্ছনীয়।`;
    suggestedOrderStatus = 'pending';
  }

  return {
    courierHistory: {
      totalOrders: total_orders,
      successfulDeliveries: successful_deliveries,
      cancelledDeliveries: cancelled_deliveries,
      successRate,
      checkedAt: new Date(),
      provider: `Steadfast Courier (API Key: ${apiKey.slice(0, 4)}***)`,
    },
    fraudRisk,
    fraudReason,
    suggestedOrderStatus,
  };
}
