/**
 * Tax calculation system with support for multiple tax rates
 * Default: South African VAT at 15%
 */

export type TaxRate = {
  id: string;
  name: string;
  rate: number; // 0-100 (e.g., 15 for 15%)
  applicableCategories?: string[]; // Empty = all categories
  applicableRegions?: string[]; // Empty = all regions
  enabled: boolean;
  createdAt: string;
};

const DEFAULT_TAX_RATES: TaxRate[] = [
  {
    id: 'za-vat',
    name: 'South African VAT',
    rate: 15,
    applicableCategories: [],
    applicableRegions: ['ZA'],
    enabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'other-vat',
    name: 'International VAT',
    rate: 0,
    applicableCategories: [],
    applicableRegions: [],
    enabled: true,
    createdAt: new Date().toISOString(),
  },
];

/**
 * Calculate tax for subtotal based on location and category
 */
export function calculateTax(
  subtotal: number,
  region: string = 'ZA',
  category: string = 'general'
): { taxAmount: number; taxRate: TaxRate | null } {
  // Find applicable tax rate
  const applicableRate = DEFAULT_TAX_RATES.find((rate) => {
    if (!rate.enabled) return false;

    // Check region
    if (rate.applicableRegions && rate.applicableRegions.length > 0) {
      if (!rate.applicableRegions.includes(region)) return false;
    }

    // Check category
    if (rate.applicableCategories && rate.applicableCategories.length > 0) {
      if (!rate.applicableCategories.includes(category)) return false;
    }

    return true;
  });

  if (!applicableRate) {
    return { taxAmount: 0, taxRate: null };
  }

  const taxAmount = subtotal * (applicableRate.rate / 100);
  return {
    taxAmount: Math.round(taxAmount * 100) / 100, // Round to 2 decimals
    taxRate: applicableRate,
  };
}

/**
 * Calculate complete order totals with tax
 */
export function calculateOrderTotals(
  subtotal: number,
  shippingCost: number = 0,
  region: string = 'ZA',
  category: string = 'general'
) {
  const { taxAmount, taxRate } = calculateTax(subtotal, region, category);

  return {
    subtotal,
    shippingCost,
    tax: taxAmount,
    taxRate: taxRate?.rate || 0,
    total: subtotal + shippingCost + taxAmount,
  };
}

/**
 * Get all tax rates (admin only)
 */
export function getTaxRates(): TaxRate[] {
  return DEFAULT_TAX_RATES;
}

/**
 * Add tax rate (admin only)
 */
export function addTaxRate(rate: Omit<TaxRate, 'createdAt'>): TaxRate {
  const newRate: TaxRate = {
    ...rate,
    createdAt: new Date().toISOString(),
  };
  DEFAULT_TAX_RATES.push(newRate);
  return newRate;
}

/**
 * Update tax rate (admin only)
 */
export function updateTaxRate(id: string, updates: Partial<TaxRate>): TaxRate | null {
  const index = DEFAULT_TAX_RATES.findIndex((r) => r.id === id);
  if (index === -1) return null;

  DEFAULT_TAX_RATES[index] = {
    ...DEFAULT_TAX_RATES[index],
    ...updates,
    createdAt: DEFAULT_TAX_RATES[index].createdAt, // Don't change creation date
  };

  return DEFAULT_TAX_RATES[index];
}

/**
 * Format tax amount for display
 */
export function formatTaxDisplay(amount: number, rate: number): string {
  return `R${amount.toFixed(2)} (${rate}%)`;
}
