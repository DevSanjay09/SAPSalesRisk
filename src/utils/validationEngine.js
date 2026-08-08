/**
 * validationEngine.js
 * ────────────────────────────────────────────────────────────────
 * Full validation pipeline for uploaded / in-memory CSV data.
 * Runs BEFORE data enters the risk engine.
 *
 * Returns:
 *   {
 *     validOrders   : object[]   – rows that passed all checks
 *     validInventory: object[]
 *     validCredit   : object[]
 *     issues        : Issue[]    – structured error / warning objects
 *     summary       : { orders, inventory, credit } with valid/invalid counts
 *   }
 */

import Papa from 'papaparse';

/* ── Column requirements ───────────────────────────────────── */
const ORDERS_REQUIRED    = ['Order_ID', 'Customer', 'Item', 'Qty', 'Order_Value', 'Delivery_Date'];
const INVENTORY_REQUIRED = ['Item', 'Available_Qty'];
const CREDIT_REQUIRED    = ['Customer', 'Credit_Limit', 'Outstanding'];

/* ── Issue factory ─────────────────────────────────────────── */
const makeIssue = (severity, file, row, field, value, message, suggestion) => ({
  id: `${file}-r${row}-${field}-${Math.random().toString(36).substring(2, 7)}`,
  severity,   // 'error' | 'warning'
  file,
  row,
  field,
  value: value === undefined || value === null ? '—' : String(value),
  message,
  suggestion,
});

/* ── Parse a File object via PapaParse ─────────────────────── */
export const parseFile = (file) =>
  new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => resolve(results.data || []),
      error: (err) => reject(new Error(`Parse error in ${file.name}: ${err.message}`)),
    });
  });

/* ── Parse raw in-memory array (already JS objects) ───────── */
const asArray = (data) => (Array.isArray(data) ? data : []);

/* ── Structure validation ──────────────────────────────────── */
const validateStructure = (data, required, fileName) => {
  const issues = [];
  if (!data || data.length === 0) {
    issues.push(
      makeIssue(
        'warning',
        fileName,
        '—',
        '—',
        '—',
        `${fileName} contains no valid data rows.`,
        'Upload a non-empty CSV file with data records.'
      )
    );
    // Non-fatal structure check for empty inventory/credit files so orders can still process
    return { ok: fileName !== 'orders.csv', issues };
  }

  const headers = Object.keys(data[0] || {});
  const missing = required.filter((col) => !headers.includes(col));
  missing.forEach((col) => {
    issues.push(
      makeIssue(
        'error',
        fileName,
        '—',
        col,
        '—',
        `Missing required column "${col}".`,
        `Add the "${col}" column to ${fileName}.`
      )
    );
  });
  return { ok: missing.length === 0, issues };
};

/* ── Duplicate ID detection ────────────────────────────────── */
const detectDuplicates = (data, keyField, fileName) => {
  const seen = new Set();
  const issues = [];
  data.forEach((row, i) => {
    const key = String(row[keyField] ?? '').trim();
    if (!key) return;
    if (seen.has(key)) {
      issues.push(
        makeIssue(
          'warning',
          fileName,
          i + 2,
          keyField,
          key,
          `Duplicate ${keyField}: "${key}" appears more than once.`,
          `Review the dataset — resolve duplicate ${keyField} entries.`
        )
      );
    } else {
      seen.add(key);
    }
  });
  return issues;
};

/* ── Orders value validation ───────────────────────────────── */
const validateOrderValues = (data) => {
  const issues = [];
  const valid = [];

  data.forEach((row, i) => {
    const rowNum = i + 2;
    const orderId = row.Order_ID ?? `Row ${rowNum}`;
    let rowOk = true;

    // Qty
    const qty = Number(row.Qty);
    if (isNaN(qty) || qty <= 0) {
      issues.push(
        makeIssue(
          'error',
          'orders.csv',
          rowNum,
          'Qty',
          row.Qty,
          `Order ${orderId}: Quantity must be greater than 0 (got ${row.Qty}).`,
          'Fix the Qty value to a positive number.'
        )
      );
      rowOk = false;
    }

    // Order_Value
    const val = Number(row.Order_Value);
    if (isNaN(val) || val < 0) {
      issues.push(
        makeIssue(
          'error',
          'orders.csv',
          rowNum,
          'Order_Value',
          row.Order_Value,
          `Order ${orderId}: Order value cannot be negative (got ${row.Order_Value}).`,
          'Fix the Order_Value to be ≥ 0.'
        )
      );
      rowOk = false;
    }

    // Delivery_Date
    const dStr = row.Delivery_Date;
    if (!dStr || isNaN(Date.parse(String(dStr)))) {
      issues.push(
        makeIssue(
          'error',
          'orders.csv',
          rowNum,
          'Delivery_Date',
          dStr,
          `Order ${orderId}: "${dStr}" is not a valid date.`,
          'Use a date format like YYYY-MM-DD.'
        )
      );
      rowOk = false;
    }

    if (rowOk) valid.push(row);
  });

  return { valid, issues };
};

/* ── Inventory value validation ────────────────────────────── */
const validateInventoryValues = (data) => {
  const issues = [];
  const valid = [];

  data.forEach((row, i) => {
    const rowNum = i + 2;
    const item = row.Item ?? `Row ${rowNum}`;
    const qty = Number(row.Available_Qty);
    if (isNaN(qty) || qty < 0) {
      issues.push(
        makeIssue(
          'error',
          'inventory.csv',
          rowNum,
          'Available_Qty',
          row.Available_Qty,
          `Item "${item}": Available_Qty cannot be negative (got ${row.Available_Qty}).`,
          'Fix the Available_Qty to be ≥ 0.'
        )
      );
    } else {
      valid.push(row);
    }
  });

  return { valid, issues };
};

/* ── Credit value validation ───────────────────────────────── */
const validateCreditValues = (data) => {
  const issues = [];
  const valid = [];

  data.forEach((row, i) => {
    const rowNum = i + 2;
    const customer = row.Customer ?? `Row ${rowNum}`;
    let rowOk = true;

    const limit = Number(row.Credit_Limit);
    if (isNaN(limit) || limit <= 0) {
      issues.push(
        makeIssue(
          'error',
          'customer_credit.csv',
          rowNum,
          'Credit_Limit',
          row.Credit_Limit,
          `Customer "${customer}": Credit_Limit must be > 0.`,
          'Provide a valid positive Credit_Limit.'
        )
      );
      rowOk = false;
    }

    const outstanding = Number(row.Outstanding);
    if (isNaN(outstanding) || outstanding < 0) {
      issues.push(
        makeIssue(
          'error',
          'customer_credit.csv',
          rowNum,
          'Outstanding',
          row.Outstanding,
          `Customer "${customer}": Outstanding cannot be negative.`,
          'Fix the Outstanding value to be ≥ 0.'
        )
      );
      rowOk = false;
    }

    if (rowOk) valid.push(row);
  });

  return { valid, issues };
};

/* ── Relationship validation ───────────────────────────────── */
const validateRelationships = (orders, inventoryMap, creditMap) => {
  const issues = [];
  orders.forEach((row, i) => {
    const rowNum = i + 2;
    const orderId = row.Order_ID ?? `Row ${rowNum}`;
    const customer = String(row.Customer ?? '').trim();
    const item = String(row.Item ?? '').trim();

    if (!creditMap.has(customer)) {
      issues.push(
        makeIssue(
          'warning',
          'orders.csv',
          rowNum,
          'Customer',
          row.Customer,
          `Order ${orderId}: Customer "${row.Customer}" not found in customer_credit.csv.`,
          'Add this customer to customer_credit.csv or fix customer name.'
        )
      );
    }

    if (!inventoryMap.has(item)) {
      issues.push(
        makeIssue(
          'warning',
          'orders.csv',
          rowNum,
          'Item',
          row.Item,
          `Order ${orderId}: Item "${row.Item}" not found in inventory.csv.`,
          'Add this item to inventory.csv or fix item name.'
        )
      );
    }
  });
  return issues;
};

/* ── Master validateAll ────────────────────────────────────── */
/**
 * @param {{ orders: object[]|File, inventory: object[]|File, credit: object[]|File }} sources
 * @param {{ hasUploadedOrders?: boolean, hasUploadedInventory?: boolean, hasUploadedCredit?: boolean }} options
 */
export async function validateAll(sources, options = {}) {
  const allIssues = [];

  const { orders, inventory, credit } = sources || {};
  const { hasUploadedInventory = true, hasUploadedCredit = true } = options;

  /* ── Add explicit warnings if optional files were not uploaded ── */
  if (!hasUploadedInventory && orders) {
    allIssues.push(
      makeIssue(
        'warning',
        'inventory.csv',
        '—',
        '—',
        '—',
        'inventory.csv was not uploaded. All items will be treated as unstocked/unknown.',
        'Upload inventory.csv to enable stock availability checks.'
      )
    );
  }

  if (!hasUploadedCredit && orders) {
    allIssues.push(
      makeIssue(
        'warning',
        'customer_credit.csv',
        '—',
        '—',
        '—',
        'customer_credit.csv was not uploaded. All customers will be treated as unknown credit.',
        'Upload customer_credit.csv to enable credit risk checks.'
      )
    );
  }

  /* ── Parse inputs (File → array, or keep array as-is) ── */
  let rawOrders    = orders    instanceof File ? await parseFile(orders)    : asArray(orders);
  let rawInventory = inventory instanceof File ? await parseFile(inventory) : asArray(inventory);
  let rawCredit    = credit    instanceof File ? await parseFile(credit)    : asArray(credit);

  /* ── Trim keys and values in every row ───────────────────────── */
  const trimRow = (row) => {
    if (!row || typeof row !== 'object') return {};
    const out = {};
    Object.keys(row).forEach((k) => {
      const cleanKey = k.trim();
      const val = row[k];
      out[cleanKey] = typeof val === 'string' ? val.trim() : val;
    });
    return out;
  };
  rawOrders    = rawOrders.map(trimRow);
  rawInventory = rawInventory.map(trimRow);
  rawCredit    = rawCredit.map(trimRow);

  /* ── Structure validation ────────────────────────────── */
  const sOrders    = validateStructure(rawOrders,    ORDERS_REQUIRED,    'orders.csv');
  const sInventory = validateStructure(rawInventory, INVENTORY_REQUIRED, 'inventory.csv');
  const sCredit    = validateStructure(rawCredit,    CREDIT_REQUIRED,    'customer_credit.csv');

  allIssues.push(...sOrders.issues, ...sInventory.issues, ...sCredit.issues);

  // If orders structure fails fatal check, return early
  if (!sOrders.ok) {
    return {
      validOrders: [],
      validInventory: [],
      validCredit: [],
      issues: allIssues,
      summary: {
        orders:    { valid: 0, invalid: rawOrders.length },
        inventory: { valid: 0, invalid: rawInventory.length },
        credit:    { valid: 0, invalid: rawCredit.length },
      },
    };
  }

  /* ── Duplicate detection ─────────────────────────────── */
  allIssues.push(...detectDuplicates(rawOrders,    'Order_ID', 'orders.csv'));
  allIssues.push(...detectDuplicates(rawInventory, 'Item',     'inventory.csv'));
  allIssues.push(...detectDuplicates(rawCredit,    'Customer', 'customer_credit.csv'));

  /* ── Value validation ────────────────────────────────── */
  const { valid: validOrders,    issues: orderIssues }    = validateOrderValues(rawOrders);
  const { valid: validInventory, issues: inventoryIssues } = validateInventoryValues(rawInventory);
  const { valid: validCredit,    issues: creditIssues }    = validateCreditValues(rawCredit);

  allIssues.push(...orderIssues, ...inventoryIssues, ...creditIssues);

  /* ── Build lookup maps for relationship checks ────────── */
  const inventoryMap = new Map(validInventory.map((r) => [String(r.Item ?? '').trim(), r.Available_Qty]));
  const creditMap    = new Map(validCredit.map((r)    => [String(r.Customer ?? '').trim(), r]));

  /* ── Relationship validation ─────────────────────────── */
  allIssues.push(...validateRelationships(validOrders, inventoryMap, creditMap));

  /* ── Summary ─────────────────────────────────────────── */
  const summary = {
    orders:    { valid: validOrders.length,    invalid: rawOrders.length    - validOrders.length    },
    inventory: { valid: validInventory.length, invalid: rawInventory.length - validInventory.length },
    credit:    { valid: validCredit.length,    invalid: rawCredit.length    - validCredit.length    },
  };

  return { validOrders, validInventory, validCredit, issues: allIssues, summary };
}
