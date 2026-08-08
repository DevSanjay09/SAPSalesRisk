/**
 * priorityEngine.js
 * Sorts enriched orders by: highest riskScore first,
 * then by earliest Delivery_Date as tiebreaker.
 */

export const sortByPriority = (enrichedOrders) => {
  return [...enrichedOrders].sort((a, b) => {
    if (b.riskScore !== a.riskScore) return b.riskScore - a.riskScore;
    // Tiebreaker: earlier delivery date first
    return new Date(a.Delivery_Date) - new Date(b.Delivery_Date);
  });
};
