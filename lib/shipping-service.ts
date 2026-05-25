/**
 * Shipping management system with multiple carrier support
 * Handles shipping cost calculation and carrier integration
 */

export type ShippingMethod = {
  id: string;
  name: string;
  carrier: string;
  baseCost: number;
  costPerKg?: number;
  estimatedDays: number;
  enabled: boolean;
  applicableRegions: string[]; // ZA, INT, etc.
  createdAt: string;
};

const DEFAULT_SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'standard-za',
    name: 'Standard Delivery (ZA)',
    carrier: 'Fastway',
    baseCost: 50,
    costPerKg: 5,
    estimatedDays: 3,
    enabled: true,
    applicableRegions: ['ZA'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'express-za',
    name: 'Express Delivery (ZA)',
    carrier: 'DHL',
    baseCost: 120,
    costPerKg: 10,
    estimatedDays: 1,
    enabled: true,
    applicableRegions: ['ZA'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pickup',
    name: 'Pickup at Store',
    carrier: 'Self',
    baseCost: 0,
    estimatedDays: 0,
    enabled: true,
    applicableRegions: ['ZA'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'international',
    name: 'International Shipping',
    carrier: 'DHL Express',
    baseCost: 500,
    costPerKg: 50,
    estimatedDays: 7,
    enabled: true,
    applicableRegions: ['INT'],
    createdAt: new Date().toISOString(),
  },
];

/**
 * Calculate shipping cost based on method and weight
 */
export function calculateShippingCost(
  methodId: string,
  weightKg: number = 0,
  region: string = 'ZA'
): { cost: number; method: ShippingMethod | null; message?: string } {
  const method = DEFAULT_SHIPPING_METHODS.find(
    (m) => m.id === methodId && m.enabled && m.applicableRegions.includes(region)
  );

  if (!method) {
    return {
      cost: 0,
      method: null,
      message: `Shipping method ${methodId} not available for region ${region}`,
    };
  }

  let cost = method.baseCost;
  if (method.costPerKg && weightKg > 0) {
    cost += method.costPerKg * weightKg;
  }

  return { cost, method };
}

/**
 * Get available shipping methods for a region
 */
export function getAvailableShippingMethods(region: string = 'ZA'): ShippingMethod[] {
  return DEFAULT_SHIPPING_METHODS.filter(
    (m) => m.enabled && m.applicableRegions.includes(region)
  );
}

/**
 * Get all shipping methods (admin)
 */
export function getAllShippingMethods(): ShippingMethod[] {
  return DEFAULT_SHIPPING_METHODS;
}

/**
 * Add shipping method (admin)
 */
export function addShippingMethod(method: Omit<ShippingMethod, 'createdAt'>): ShippingMethod {
  const newMethod: ShippingMethod = {
    ...method,
    createdAt: new Date().toISOString(),
  };
  DEFAULT_SHIPPING_METHODS.push(newMethod);
  return newMethod;
}

/**
 * Update shipping method (admin)
 */
export function updateShippingMethod(id: string, updates: Partial<ShippingMethod>): ShippingMethod | null {
  const index = DEFAULT_SHIPPING_METHODS.findIndex((m) => m.id === id);
  if (index === -1) return null;

  DEFAULT_SHIPPING_METHODS[index] = {
    ...DEFAULT_SHIPPING_METHODS[index],
    ...updates,
    createdAt: DEFAULT_SHIPPING_METHODS[index].createdAt,
  };

  return DEFAULT_SHIPPING_METHODS[index];
}

/**
 * Format shipping cost for display
 */
export function formatShippingDisplay(cost: number, method?: ShippingMethod): string {
  if (cost === 0) return 'FREE';
  if (method?.estimatedDays === 0) return `R${cost.toFixed(2)} (Pickup)`;
  return `R${cost.toFixed(2)} (${method?.estimatedDays} days)`;
}
