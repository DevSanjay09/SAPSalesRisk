/**
 * edgeCaseDatasets.js
 * ─────────────────────────────────────────────────────────────
 * Static, in-memory test datasets for each edge-case scenario.
 * None of these modify the original CSV files.
 *
 * Each export is:
 *   { orders: object[], inventory: object[], credit: object[] }
 */

/* Helper – date relative to today */
const today = () => new Date();
const daysFromToday = (n) => {
  const d = today();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};

/* ── 0. Normal (mirrors one clean order) ───────────────────────────── */
export const normalDataset = {
  orders: [
    { Order_ID: 'E001', Customer: 'TechCorp',   Item: 'Laptop',    Qty: 5,  Order_Value: 50000, Delivery_Date: daysFromToday(10) },
    { Order_ID: 'E002', Customer: 'RetailPlus',  Item: 'Monitor',   Qty: 3,  Order_Value: 18000, Delivery_Date: daysFromToday(8)  },
  ],
  inventory: [
    { Item: 'Laptop',  Available_Qty: 20 },
    { Item: 'Monitor', Available_Qty: 15 },
  ],
  credit: [
    { Customer: 'TechCorp',  Credit_Limit: 500000, Outstanding: 100000 },
    { Customer: 'RetailPlus', Credit_Limit: 200000, Outstanding: 50000  },
  ],
};

/* ── 1. Stock Shortage ─────────────────────────────────────────────── */
export const stockShortageDataset = {
  orders: [
    { Order_ID: 'E001', Customer: 'TechCorp', Item: 'Laptop', Qty: 10, Order_Value: 80000, Delivery_Date: daysFromToday(7) },
  ],
  inventory: [
    { Item: 'Laptop', Available_Qty: 5 },
  ],
  credit: [
    { Customer: 'TechCorp', Credit_Limit: 500000, Outstanding: 100000 },
  ],
  expectedRisk: 'High',
  expectedBehavior: 'Stock Shortage detected — order cannot be fully fulfilled with current inventory.',
};

/* ── 2. Credit Risk ────────────────────────────────────────────────── */
export const creditRiskDataset = {
  orders: [
    { Order_ID: 'E001', Customer: 'HighRiskCo', Item: 'Laptop', Qty: 2, Order_Value: 20000, Delivery_Date: daysFromToday(10) },
  ],
  inventory: [
    { Item: 'Laptop', Available_Qty: 20 },
  ],
  credit: [
    { Customer: 'HighRiskCo', Credit_Limit: 500000, Outstanding: 490000 },
  ],
  expectedRisk: 'High',
  expectedBehavior: '98% Credit Utilization — credit risk flagged.',
};

/* ── 3. Urgent Delivery ────────────────────────────────────────────── */
export const urgentDeliveryDataset = {
  orders: [
    { Order_ID: 'E001', Customer: 'TechCorp', Item: 'Laptop', Qty: 2, Order_Value: 15000, Delivery_Date: daysFromToday(1) },
  ],
  inventory: [
    { Item: 'Laptop', Available_Qty: 20 },
  ],
  credit: [
    { Customer: 'TechCorp', Credit_Limit: 500000, Outstanding: 100000 },
  ],
  expectedRisk: 'Medium',
  expectedBehavior: 'Urgent Delivery — delivery is due tomorrow, risk score elevated.',
};

/* ── 4. Multiple Risk Factors ──────────────────────────────────────── */
export const multipleRiskDataset = {
  orders: [
    { Order_ID: 'E001', Customer: 'HighRiskCo', Item: 'Laptop', Qty: 10, Order_Value: 80000, Delivery_Date: daysFromToday(1) },
  ],
  inventory: [
    { Item: 'Laptop', Available_Qty: 3 },
  ],
  credit: [
    { Customer: 'HighRiskCo', Credit_Limit: 500000, Outstanding: 490000 },
  ],
  expectedRisk: 'High',
  expectedBehavior: 'All three risk factors active: Stock Shortage + Credit Risk + Urgent Delivery.',
};

/* ── 5. Unknown Customer ───────────────────────────────────────────── */
export const unknownCustomerDataset = {
  orders: [
    { Order_ID: 'E001', Customer: 'ABC_UNKNOWN', Item: 'Laptop', Qty: 5, Order_Value: 40000, Delivery_Date: daysFromToday(10) },
  ],
  inventory: [
    { Item: 'Laptop', Available_Qty: 20 },
  ],
  credit: [
    { Customer: 'TechCorp', Credit_Limit: 500000, Outstanding: 100000 },
  ],
  expectedBehavior: 'Unknown Customer — no credit information found. Validation warning raised.',
};

/* ── 6. Unknown Item ───────────────────────────────────────────────── */
export const unknownItemDataset = {
  orders: [
    { Order_ID: 'E001', Customer: 'TechCorp', Item: 'Printer', Qty: 5, Order_Value: 20000, Delivery_Date: daysFromToday(10) },
  ],
  inventory: [
    { Item: 'Laptop', Available_Qty: 20 },
  ],
  credit: [
    { Customer: 'TechCorp', Credit_Limit: 500000, Outstanding: 100000 },
  ],
  expectedBehavior: 'Unknown Inventory Item — "Printer" not found in inventory. Risk engine still runs.',
};

/* ── 7. Invalid Quantity (negative) ────────────────────────────────── */
export const invalidQuantityDataset = {
  orders: [
    { Order_ID: 'E001', Customer: 'TechCorp', Item: 'Laptop', Qty: 5,  Order_Value: 40000, Delivery_Date: daysFromToday(10) },
    { Order_ID: 'E002', Customer: 'TechCorp', Item: 'Laptop', Qty: -5, Order_Value: 20000, Delivery_Date: daysFromToday(10) },
  ],
  inventory: [
    { Item: 'Laptop', Available_Qty: 20 },
  ],
  credit: [
    { Customer: 'TechCorp', Credit_Limit: 500000, Outstanding: 100000 },
  ],
  expectedBehavior: 'Negative Quantity on E002 flagged as validation error — E002 excluded from processing.',
};

/* ── 8. Duplicate Order ID ─────────────────────────────────────────── */
export const duplicateOrderDataset = {
  orders: [
    { Order_ID: 'E001', Customer: 'TechCorp', Item: 'Laptop', Qty: 5, Order_Value: 40000, Delivery_Date: daysFromToday(10) },
    { Order_ID: 'E001', Customer: 'TechCorp', Item: 'Monitor', Qty: 2, Order_Value: 10000, Delivery_Date: daysFromToday(12) },
    { Order_ID: 'E002', Customer: 'TechCorp', Item: 'Monitor', Qty: 2, Order_Value: 10000, Delivery_Date: daysFromToday(12) },
  ],
  inventory: [
    { Item: 'Laptop',  Available_Qty: 20 },
    { Item: 'Monitor', Available_Qty: 10 },
  ],
  credit: [
    { Customer: 'TechCorp', Credit_Limit: 500000, Outstanding: 100000 },
  ],
  expectedBehavior: 'Duplicate Order_ID E001 detected and flagged as warning.',
};

/* ── 9. Empty Dataset ──────────────────────────────────────────────── */
export const emptyDataset = {
  orders: [],
  inventory: [],
  credit: [],
  expectedBehavior: 'No valid orders found — dashboard displays an empty-state message without crashing.',
};

/* ── Registry used by EdgeCaseTester ───────────────────────────────── */
export const EDGE_CASE_SCENARIOS = [
  {
    id: 'normal',
    label: 'Normal Dataset',
    icon: '✅',
    description: 'Two healthy orders with adequate stock and good credit.',
    dataset: normalDataset,
    check: (orders) => orders.length > 0 && orders.every((o) => o.riskLevel !== 'High'),
    expectedLabel: 'No High-Risk Orders',
  },
  {
    id: 'stock_shortage',
    label: 'Stock Shortage',
    icon: '📦',
    description: 'Order requires 10 units but only 5 in stock.',
    dataset: stockShortageDataset,
    check: (orders) => orders.some((o) => o.stockShortage === true),
    expectedLabel: 'Stock Shortage',
  },
  {
    id: 'credit_risk',
    label: 'Credit Risk',
    icon: '💳',
    description: '98% credit utilization (₹490k of ₹500k limit used).',
    dataset: creditRiskDataset,
    check: (orders) => orders.some((o) => o.riskFactors?.some((f) => f.type === 'credit')),
    expectedLabel: '98% Credit Utilization',
  },
  {
    id: 'urgent_delivery',
    label: 'Urgent Delivery',
    icon: '⏰',
    description: 'Delivery is due tomorrow — urgency risk factor added.',
    dataset: urgentDeliveryDataset,
    check: (orders) => orders.some((o) => o.riskFactors?.some((f) => f.type === 'urgency')),
    expectedLabel: 'Urgent Delivery',
  },
  {
    id: 'multiple_risk',
    label: 'Multiple Risk Factors',
    icon: '🔴',
    description: 'All three risk factors active simultaneously.',
    dataset: multipleRiskDataset,
    check: (orders) => orders.some((o) => o.riskLevel === 'High' && o.riskFactors?.length >= 3),
    expectedLabel: 'High Risk (all factors)',
  },
  {
    id: 'unknown_customer',
    label: 'Unknown Customer',
    icon: '👤',
    description: 'Order customer not present in customer_credit.csv.',
    dataset: unknownCustomerDataset,
    check: (_orders, issues) => issues.some((i) => i.message.includes('not found in customer_credit')),
    expectedLabel: 'Validation Warning: Unknown Customer',
  },
  {
    id: 'unknown_item',
    label: 'Unknown Inventory Item',
    icon: '🔍',
    description: 'Order item "Printer" not present in inventory.csv.',
    dataset: unknownItemDataset,
    check: (_orders, issues) => issues.some((i) => i.message.includes('not found in inventory')),
    expectedLabel: 'Validation Warning: Unknown Item',
  },
  {
    id: 'invalid_qty',
    label: 'Invalid Quantity',
    icon: '❌',
    description: 'E002 has Qty = -5, which must be rejected.',
    dataset: invalidQuantityDataset,
    check: (_orders, issues) => issues.some((i) => i.field === 'Qty' && i.severity === 'error'),
    expectedLabel: 'Validation Error: Negative Quantity',
  },
  {
    id: 'duplicate_order',
    label: 'Duplicate Order ID',
    icon: '⚠️',
    description: 'Order_ID E001 appears twice in the dataset.',
    dataset: duplicateOrderDataset,
    check: (_orders, issues) => issues.some((i) => i.message.includes('Duplicate Order_ID')),
    expectedLabel: 'Validation Warning: Duplicate Order ID',
  },
  {
    id: 'empty',
    label: 'Empty Dataset',
    icon: '📭',
    description: 'All three CSVs are empty — no records to process.',
    dataset: emptyDataset,
    check: (orders) => orders.length === 0,
    expectedLabel: 'No Valid Orders Found',
  },
];
