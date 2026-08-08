import Papa from 'papaparse';

/**
 * Generic CSV fetcher + parser
 */
const fetchCSV = (path) =>
  new Promise((resolve, reject) => {
    Papa.parse(path, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (err) => reject(err),
    });
  });

export const loadOrdersCSV = () => fetchCSV('/data/orders.csv');
export const loadInventoryCSV = () => fetchCSV('/data/inventory.csv');
export const loadCreditCSV = () => fetchCSV('/data/customer_credit.csv');
