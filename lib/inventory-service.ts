/**
 * Inventory management system with stock validation and tracking
 * Handles unlimited stock as default, but validates availability
 */

import { getFirestore } from 'firebase-admin/firestore';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';

export type InventoryEntry = {
  productId: string;
  variantId?: string;
  sku: string;
  totalStock: number; // -1 for unlimited
  reserved: number; // Items in pending orders
  available: number; // totalStock - reserved
  lastUpdated: string;
};

export type StockCheckResult = {
  available: boolean;
  availableQuantity: number;
  message?: string;
};

/**
 * Check if product variant is available in requested quantity
 */
export async function checkInventoryAvailability(
  productId: string,
  quantity: number,
  variantId?: string
): Promise<StockCheckResult> {
  try {
    const app = getFirebaseAdminApp();
    if (!app) {
      // Firestore unavailable, assume unlimited stock
      return { available: true, availableQuantity: Infinity };
    }

    const db = getFirestore(app);
    const query = variantId
      ? `${productId}-${variantId}`
      : productId;

    const doc = await db
      .collection('inventory')
      .doc(query)
      .get();

    if (!doc.exists) {
      // No inventory record = unlimited stock
      return { available: true, availableQuantity: Infinity };
    }

    const data = doc.data() as InventoryEntry;

    // Unlimited stock
    if (data.totalStock === -1) {
      return { available: true, availableQuantity: Infinity };
    }

    const available = data.available || 0;
    if (available >= quantity) {
      return { available: true, availableQuantity: available };
    }

    return {
      available: false,
      availableQuantity: available,
      message: `Only ${available} items available (requested ${quantity})`,
    };
  } catch (error) {
    console.error('Inventory check error:', error);
    // Fail open: assume item is available if system is down
    return { available: true, availableQuantity: Infinity };
  }
}

/**
 * Reserve stock for a pending order
 */
export async function reserveInventory(
  orderId: string,
  items: Array<{ productId: string; quantity: number; variantId?: string }>
): Promise<boolean> {
  try {
    const app = getFirebaseAdminApp();
    if (!app) return true; // No-op if Firestore unavailable

    const db = getFirestore(app);
    const batch = db.batch();

    for (const item of items) {
      const query = item.variantId
        ? `${item.productId}-${item.variantId}`
        : item.productId;

      const docRef = db.collection('inventory').doc(query);
      const doc = await docRef.get();

      if (doc.exists) {
        const data = doc.data() as InventoryEntry;
        if (data.totalStock !== -1) {
          // Only update if not unlimited stock
          batch.update(docRef, {
            reserved: (data.reserved || 0) + item.quantity,
            available: Math.max(
              0,
              (data.totalStock || 0) - ((data.reserved || 0) + item.quantity)
            ),
            lastUpdated: new Date().toISOString(),
          });
        }
      }
    }

    await batch.commit();
    return true;
  } catch (error) {
    console.error('Inventory reservation error:', error);
    return false;
  }
}

/**
 * Confirm stock deduction when order is paid
 */
export async function deductInventory(
  orderId: string,
  items: Array<{ productId: string; quantity: number; variantId?: string }>
): Promise<boolean> {
  try {
    const app = getFirebaseAdminApp();
    if (!app) return true;

    const db = getFirestore(app);
    const batch = db.batch();

    for (const item of items) {
      const query = item.variantId
        ? `${item.productId}-${item.variantId}`
        : item.productId;

      const docRef = db.collection('inventory').doc(query);
      const doc = await docRef.get();

      if (doc.exists) {
        const data = doc.data() as InventoryEntry;
        if (data.totalStock !== -1) {
          batch.update(docRef, {
            totalStock: (data.totalStock || 0) - item.quantity,
            reserved: Math.max(0, (data.reserved || 0) - item.quantity),
            available: Math.max(0, (data.totalStock || 0) - item.quantity - (data.reserved || 0)),
            lastUpdated: new Date().toISOString(),
          });
        }
      }
    }

    await batch.commit();
    return true;
  } catch (error) {
    console.error('Inventory deduction error:', error);
    return false;
  }
}

/**
 * Release reservation if order is cancelled
 */
export async function releaseInventory(
  orderId: string,
  items: Array<{ productId: string; quantity: number; variantId?: string }>
): Promise<boolean> {
  try {
    const app = getFirebaseAdminApp();
    if (!app) return true;

    const db = getFirestore(app);
    const batch = db.batch();

    for (const item of items) {
      const query = item.variantId
        ? `${item.productId}-${item.variantId}`
        : item.productId;

      const docRef = db.collection('inventory').doc(query);
      const doc = await docRef.get();

      if (doc.exists) {
        const data = doc.data() as InventoryEntry;
        batch.update(docRef, {
          reserved: Math.max(0, (data.reserved || 0) - item.quantity),
          available: Math.max(
            0,
            (data.totalStock !== -1 ? data.totalStock : 0) - Math.max(0, (data.reserved || 0) - item.quantity)
          ),
          lastUpdated: new Date().toISOString(),
        });
      }
    }

    await batch.commit();
    return true;
  } catch (error) {
    console.error('Inventory release error:', error);
    return false;
  }
}

/**
 * Get inventory summary (admin only)
 */
export async function getInventorySummary(): Promise<InventoryEntry[]> {
  try {
    const app = getFirebaseAdminApp();
    if (!app) return [];

    const db = getFirestore(app);
    const snapshot = await db.collection('inventory').get();

    return snapshot.docs.map((doc) => doc.data() as InventoryEntry);
  } catch (error) {
    console.error('Inventory summary error:', error);
    return [];
  }
}

/**
 * Get low stock items
 */
export async function getLowStockItems(threshold: number = 10): Promise<InventoryEntry[]> {
  try {
    const app = getFirebaseAdminApp();
    if (!app) return [];

    const db = getFirestore(app);
    const snapshot = await db
      .collection('inventory')
      .where('totalStock', '!=', -1) // Exclude unlimited stock
      .where('available', '<', threshold)
      .get();

    return snapshot.docs.map((doc) => doc.data() as InventoryEntry);
  } catch (error) {
    console.error('Low stock check error:', error);
    return [];
  }
}
