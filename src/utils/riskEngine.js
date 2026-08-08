/**
 * riskEngine.js
 * Calculates risk score and level for each order.
 *
 * Scoring Rules:
 *   Stock Shortage                  → +50
 *   Credit Utilization > 95%        → +30
 *   Delivery within 2 days          → +20
 *
 * Risk Levels:
 *   0–20  → Low
 *   21–60 → Medium
 *   61+   → High
 */

const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const daysUntilDelivery = (deliveryDateStr) => {
  const delivery = new Date(deliveryDateStr);
  delivery.setHours(0, 0, 0, 0);
  const diff = (delivery - today()) / (1000 * 60 * 60 * 24);
  return Math.round(diff);
};

export const getRiskLevel = (score) => {
  if (score >= 61) return 'High';
  if (score >= 21) return 'Medium';
  return 'Low';
};

/**
 * @param {object} order - single order row from CSV
 * @param {Map}    inventoryMap - Item → Available_Qty
 * @param {Map}    creditMap    - Customer → { Credit_Limit, Outstanding }
 * @returns enriched order with risk data
 */
export const calculateRisk = (order, inventoryMap, creditMap) => {
  let score = 0;
  const factors = [];

  const customerKey = String(order.Customer ?? '').trim();
  const itemKey = String(order.Item ?? '').trim();

  const qty = Number(order.Qty);
  const availableQty = inventoryMap.has(itemKey)
    ? Number(inventoryMap.get(itemKey))
    : null;

  // Stock shortage check
  const stockShortage = availableQty === null || availableQty < qty;
  if (availableQty === null) {
    factors.push({
      type: 'stock',
      label: 'Unknown Inventory Item',
      points: 50,
      detail: `Item "${order.Item}" not found in inventory data`,
    });
    score += 50;
  } else if (stockShortage) {
    const shortfall = qty - availableQty;
    factors.push({
      type: 'stock',
      label: 'Stock Shortage',
      points: 50,
      detail: `Need ${qty}, have ${availableQty} (short by ${shortfall})`,
    });
    score += 50;
  }

  // Credit utilization check
  const credit = creditMap.get(customerKey);
  let creditUtilization = null;
  if (!credit) {
    factors.push({
      type: 'credit',
      label: 'Unknown Customer',
      points: 30,
      detail: `Customer "${order.Customer}" not in credit data`,
    });
    score += 30;
    creditUtilization = null;
  } else {
    const limit = Number(credit.Credit_Limit);
    const outstanding = Number(credit.Outstanding);
    creditUtilization = limit > 0 ? (outstanding / limit) * 100 : 100;
    if (creditUtilization > 95) {
      factors.push({
        type: 'credit',
        label: 'Credit Risk',
        points: 30,
        detail: `Credit utilization ${creditUtilization.toFixed(1)}% (limit ₹${(limit / 1000).toFixed(0)}k, used ₹${(outstanding / 1000).toFixed(0)}k)`,
      });
      score += 30;
    }
  }

  // Delivery urgency check
  const days = daysUntilDelivery(order.Delivery_Date);
  if (days <= 2) {
    factors.push({
      type: 'urgency',
      label: 'Urgent Delivery',
      points: 20,
      detail: days < 0 ? `Overdue by ${Math.abs(days)} day(s)` : days === 0 ? 'Due today' : `Due in ${days} day(s)`,
    });
    score += 20;
  }

  return {
    ...order,
    Qty: qty,
    Order_Value: Number(order.Order_Value),
    availableQty: availableQty !== null ? availableQty : 'N/A',
    creditUtilization,
    credit: credit || null,
    daysUntilDelivery: days,
    stockShortage,
    riskScore: score,
    riskLevel: getRiskLevel(score),
    riskFactors: factors,
    isUnknownCustomer: !credit,
    isUnknownItem: availableQty === null,
  };
};

/**
 * Build lookup maps from raw CSV arrays
 */
export const buildInventoryMap = (inventoryData) => {
  const map = new Map();
  (inventoryData || []).forEach((row) => {
    if (row && row.Item !== undefined && row.Item !== null) {
      map.set(String(row.Item).trim(), Number(row.Available_Qty));
    }
  });
  return map;
};

export const buildCreditMap = (creditData) => {
  const map = new Map();
  (creditData || []).forEach((row) => {
    if (row && row.Customer !== undefined && row.Customer !== null) {
      map.set(String(row.Customer).trim(), {
        Credit_Limit: Number(row.Credit_Limit),
        Outstanding: Number(row.Outstanding),
      });
    }
  });
  return map;
};
