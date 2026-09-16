/**
 * HAVENMATCH AI — Budget & Currency Utilities (Frontend)
 * Enforces HARD MAXIMUM LIMIT on user budget.
 * Handles numeric values and all Indian currency formats:
 * - ₹12,000, 12000, "12,000/mo"
 * - ₹50 Lakhs, 50L, "50 Lakh"
 * - ₹1.2 Crore, 1.2Cr, "1 Crore"
 * - ₹15K, 15k
 */

import { Property } from '../types';

export function parseIndianCurrency(val: any): number {
  if (typeof val === 'number') {
    return isNaN(val) ? 0 : val;
  }
  if (!val) return 0;

  const s = String(val).trim();
  const clean = s
    .replace(/₹/g, '')
    .replace(/,/g, '')
    .replace(/\/mo(nth)?/gi, '')
    .replace(/per\s*month/gi, '')
    .trim();

  // 1. Crores (e.g. "1.2 Cr", "1 Crore", "1.5crores")
  const crMatch = clean.match(/^([\d.]+)\s*(cr|crore|crores)$/i);
  if (crMatch) {
    const num = parseFloat(crMatch[1]);
    return isNaN(num) ? 0 : Math.round(num * 10000000);
  }

  // 2. Lakhs (e.g. "78 Lakhs", "50L", "65.5 lac", "80lakh")
  const lakhMatch = clean.match(/^([\d.]+)\s*(l|lac|lakh|lakhs)$/i);
  if (lakhMatch) {
    const num = parseFloat(lakhMatch[1]);
    return isNaN(num) ? 0 : Math.round(num * 100000);
  }

  // 3. Thousands / K (e.g. "12k", "15 K")
  const kMatch = clean.match(/^([\d.]+)\s*k$/i);
  if (kMatch) {
    const num = parseFloat(kMatch[1]);
    return isNaN(num) ? 0 : Math.round(num * 1000);
  }

  // 4. Pure numeric string
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : Math.round(num);
}

export function getPropertyPrice(property: any): number {
  if (!property) return 0;

  // Numeric priority
  if (typeof property.rent === 'number' && !isNaN(property.rent) && property.rent > 0) {
    return property.rent;
  }
  if (typeof property.price === 'number' && !isNaN(property.price) && property.price > 0) {
    return property.price;
  }
  if (typeof property.monthlyRent === 'number' && !isNaN(property.monthlyRent) && property.monthlyRent > 0) {
    return property.monthlyRent;
  }

  // String property.rent
  if (property.rent) {
    const p = parseIndianCurrency(property.rent);
    if (p > 0) return p;
  }

  // String property.price
  if (property.price) {
    const p = parseIndianCurrency(property.price);
    if (p > 0) return p;
  }

  // String property.priceDisplay
  if (property.priceDisplay) {
    const p = parseIndianCurrency(property.priceDisplay);
    if (p > 0) return p;
  }

  return 0;
}

/**
 * STRICT HARD MAXIMUM BUDGET CHECK
 * Returns true only if property price/rent <= userBudget.
 * Never allows 1 rupee above userBudget.
 */
export function isPropertyWithinBudget(property: any, userBudget?: number | null, intent?: string): boolean {
  const budget = Number(userBudget);
  if (!budget || isNaN(budget) || budget <= 0) {
    return true; // No budget limit specified
  }

  const propPrice = getPropertyPrice(property);
  if (propPrice <= 0) {
    return true;
  }

  return propPrice <= budget;
}

/**
 * Filter an array of properties by userBudget before sorting, ranking, or matching.
 */
export function filterPropertiesByBudget<T extends Property | any>(
  properties: T[],
  userBudget?: number | null,
  intent?: string
): T[] {
  const budget = Number(userBudget);
  if (!budget || isNaN(budget) || budget <= 0) {
    return properties;
  }

  return properties.filter((p) => isPropertyWithinBudget(p, budget, intent));
}
