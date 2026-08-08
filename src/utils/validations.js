/**
 * validations.js
 * Validates CSV data before processing.
 * Returns { valid: boolean, errors: string[] }
 */

const ORDERS_REQUIRED = ['Order_ID', 'Customer', 'Item', 'Qty', 'Order_Value', 'Delivery_Date'];
const INVENTORY_REQUIRED = ['Item', 'Available_Qty'];
const CREDIT_REQUIRED = ['Customer', 'Credit_Limit', 'Outstanding'];

const checkColumns = (data, required, label) => {
  if (!data || data.length === 0) return [`${label}: No data rows found`];
  const headers = Object.keys(data[0]);
  const missing = required.filter((col) => !headers.includes(col));
  if (missing.length > 0) return [`${label}: Missing columns — ${missing.join(', ')}`];
  return [];
};

export const validateOrders = (data) => {
  const errors = checkColumns(data, ORDERS_REQUIRED, 'orders.csv');
  if (errors.length) return { valid: false, errors };

  data.forEach((row, i) => {
    const qty = Number(row.Qty);
    if (isNaN(qty) || qty < 0) errors.push(`Row ${i + 2}: Qty "${row.Qty}" is invalid (must be ≥ 0)`);

    const val = Number(row.Order_Value);
    if (isNaN(val) || val < 0) errors.push(`Row ${i + 2}: Order_Value "${row.Order_Value}" is invalid`);

    const d = new Date(row.Delivery_Date);
    if (isNaN(d.getTime())) errors.push(`Row ${i + 2}: Delivery_Date "${row.Delivery_Date}" is invalid`);
  });

  return { valid: errors.length === 0, errors };
};

export const validateInventory = (data) => {
  const errors = checkColumns(data, INVENTORY_REQUIRED, 'inventory.csv');
  if (errors.length) return { valid: false, errors };

  data.forEach((row, i) => {
    const qty = Number(row.Available_Qty);
    if (isNaN(qty) || qty < 0) errors.push(`Row ${i + 2}: Available_Qty "${row.Available_Qty}" is invalid`);
  });

  return { valid: errors.length === 0, errors };
};

export const validateCredit = (data) => {
  const errors = checkColumns(data, CREDIT_REQUIRED, 'customer_credit.csv');
  if (errors.length) return { valid: false, errors };

  data.forEach((row, i) => {
    const limit = Number(row.Credit_Limit);
    const outstanding = Number(row.Outstanding);
    if (isNaN(limit) || limit <= 0) errors.push(`Row ${i + 2}: Credit_Limit "${row.Credit_Limit}" is invalid`);
    if (isNaN(outstanding) || outstanding < 0) errors.push(`Row ${i + 2}: Outstanding "${row.Outstanding}" is invalid`);
  });

  return { valid: errors.length === 0, errors };
};
