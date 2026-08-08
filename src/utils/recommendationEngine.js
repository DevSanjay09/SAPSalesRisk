/**
 * recommendationEngine.js
 * Generates contextual recommendations based on risk factors.
 * Rules vary by problem type — no single hardcoded recommendation.
 */

const STOCK_RECOMMENDATIONS = [
  { action: 'Expedite Procurement', description: 'Raise emergency purchase order to supplier', impact: 'high' },
  { action: 'Split Shipment', description: 'Ship available stock now, backorder the rest', impact: 'medium' },
  { action: 'Alternative Warehouse', description: 'Check regional warehouse for available stock', impact: 'medium' },
  { action: 'Increase Inventory Allocation', description: 'Reallocate safety stock to fulfill this order', impact: 'low' },
];

const CREDIT_RECOMMENDATIONS = [
  { action: 'Finance Approval', description: 'Request credit extension from finance department', impact: 'high' },
  { action: 'Partial Shipment', description: 'Ship a portion within credit limit, hold the rest', impact: 'medium' },
  { action: 'Increase Credit Limit', description: 'Temporarily raise credit limit after manager sign-off', impact: 'high' },
  { action: 'Advance Payment Request', description: 'Request advance payment from customer before shipment', impact: 'medium' },
];

const URGENCY_RECOMMENDATIONS = [
  { action: 'Prioritize Picking', description: 'Move to top of warehouse pick list immediately', impact: 'high' },
  { action: 'Express Delivery', description: 'Upgrade to express courier for on-time arrival', impact: 'medium' },
  { action: 'Warehouse Priority Lane', description: 'Assign dedicated packing lane, skip queue', impact: 'high' },
  { action: 'Reschedule Delivery', description: 'Negotiate with customer for 1–2 day extension', impact: 'low' },
];

/**
 * @param {object} enrichedOrder
 * @returns { primary: Recommendation, all: Recommendation[], summary: string }
 */
export const getRecommendations = (enrichedOrder) => {
  const { riskFactors } = enrichedOrder;
  const hasStock = riskFactors.some((f) => f.type === 'stock');
  const hasCredit = riskFactors.some((f) => f.type === 'credit');
  const hasUrgency = riskFactors.some((f) => f.type === 'urgency');

  let recommendations = [];

  if (hasStock) recommendations = [...recommendations, ...STOCK_RECOMMENDATIONS.slice(0, 2)];
  if (hasCredit) recommendations = [...recommendations, ...CREDIT_RECOMMENDATIONS.slice(0, 2)];
  if (hasUrgency) recommendations = [...recommendations, ...URGENCY_RECOMMENDATIONS.slice(0, 2)];

  if (recommendations.length === 0) {
    recommendations = [{ action: 'No Action Required', description: 'Order is within acceptable risk thresholds', impact: 'none' }];
  }

  // Deduplicate
  const seen = new Set();
  const unique = recommendations.filter((r) => {
    if (seen.has(r.action)) return false;
    seen.add(r.action);
    return true;
  });

  // Primary = first high-impact action
  const primary = unique.find((r) => r.impact === 'high') || unique[0];

  const summary =
    hasStock && hasCredit
      ? 'Critical: Address stock shortage and credit limit before processing'
      : hasStock && hasUrgency
      ? 'Urgent: Expedite stock procurement immediately'
      : hasCredit && hasUrgency
      ? 'Urgent: Get finance approval and prioritize picking'
      : hasStock
      ? 'Stock shortage must be resolved before shipment'
      : hasCredit
      ? 'Customer credit approval needed before release'
      : hasUrgency
      ? 'Order needs immediate warehouse prioritization'
      : 'Order is on track for normal fulfillment';

  return { primary, all: unique, summary };
};
