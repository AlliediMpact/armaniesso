/**
 * Customer profile management with deduplication and lifetime value tracking
 */

import { getFirestore } from 'firebase-admin/firestore';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';

export type CustomerProfile = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  zipcode?: string;
  country?: string;
  createdAt: string;
  updatedAt: string;
  lastOrderAt?: string;
  totalOrders: number;
  totalSpent: number;
  notes?: string;
};

/**
 * Find or create customer by email
 */
export async function findOrCreateCustomer(data: {
  email: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  zipcode?: string;
  country?: string;
}): Promise<CustomerProfile> {
  try {
    const app = getFirebaseAdminApp();
    if (!app) {
      // Fallback if Firestore unavailable
      return {
        id: `cust-${Date.now()}`,
        email: data.email,
        name: data.name,
        phone: data.phone,
        address: data.address,
        city: data.city,
        zipcode: data.zipcode,
        country: data.country,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalOrders: 0,
        totalSpent: 0,
      };
    }

    const db = getFirestore(app);
    const snapshot = await db
      .collection('customers')
      .where('email', '==', data.email.toLowerCase())
      .limit(1)
      .get();

    // Customer exists
    if (!snapshot.empty) {
      return snapshot.docs[0].data() as CustomerProfile;
    }

    // Create new customer
    const customerId = `cust-${Date.now()}`;
    const now = new Date().toISOString();
    const newCustomer: CustomerProfile = {
      id: customerId,
      email: data.email.toLowerCase(),
      name: data.name,
      phone: data.phone,
      address: data.address,
      city: data.city,
      zipcode: data.zipcode,
      country: data.country,
      createdAt: now,
      updatedAt: now,
      totalOrders: 0,
      totalSpent: 0,
    };

    await db.collection('customers').doc(customerId).set(newCustomer);
    return newCustomer;
  } catch (error) {
    console.error('Customer lookup error:', error);
    throw error;
  }
}

/**
 * Update customer profile
 */
export async function updateCustomerProfile(
  customerId: string,
  updates: Partial<CustomerProfile>
): Promise<CustomerProfile | null> {
  try {
    const app = getFirebaseAdminApp();
    if (!app) return null;

    const db = getFirestore(app);
    const docRef = db.collection('customers').doc(customerId);

    await docRef.update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    const doc = await docRef.get();
    return doc.data() as CustomerProfile;
  } catch (error) {
    console.error('Customer update error:', error);
    return null;
  }
}

/**
 * Record order for customer (update order count and total spent)
 */
export async function recordCustomerOrder(
  customerId: string,
  orderTotal: number
): Promise<void> {
  try {
    const app = getFirebaseAdminApp();
    if (!app) return;

    const db = getFirestore(app);
    const docRef = db.collection('customers').doc(customerId);
    const doc = await docRef.get();

    if (doc.exists) {
      const data = doc.data() as CustomerProfile;
      await docRef.update({
        totalOrders: (data.totalOrders || 0) + 1,
        totalSpent: (data.totalSpent || 0) + orderTotal,
        lastOrderAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Record order error:', error);
  }
}

/**
 * Get customer by ID
 */
export async function getCustomerById(customerId: string): Promise<CustomerProfile | null> {
  try {
    const app = getFirebaseAdminApp();
    if (!app) return null;

    const db = getFirestore(app);
    const doc = await db.collection('customers').doc(customerId).get();

    return doc.exists ? (doc.data() as CustomerProfile) : null;
  } catch (error) {
    console.error('Get customer error:', error);
    return null;
  }
}

/**
 * Get customer by email
 */
export async function getCustomerByEmail(email: string): Promise<CustomerProfile | null> {
  try {
    const app = getFirebaseAdminApp();
    if (!app) return null;

    const db = getFirestore(app);
    const snapshot = await db
      .collection('customers')
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get();

    return snapshot.empty ? null : (snapshot.docs[0].data() as CustomerProfile);
  } catch (error) {
    console.error('Get customer by email error:', error);
    return null;
  }
}

/**
 * Get top customers by total spent (admin)
 */
export async function getTopCustomers(limit: number = 20): Promise<CustomerProfile[]> {
  try {
    const app = getFirebaseAdminApp();
    if (!app) return [];

    const db = getFirestore(app);
    const snapshot = await db
      .collection('customers')
      .orderBy('totalSpent', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => doc.data() as CustomerProfile);
  } catch (error) {
    console.error('Get top customers error:', error);
    return [];
  }
}

/**
 * Get repeat customers
 */
export async function getRepeatCustomers(minOrders: number = 2, limit: number = 50): Promise<CustomerProfile[]> {
  try {
    const app = getFirebaseAdminApp();
    if (!app) return [];

    const db = getFirestore(app);
    const snapshot = await db
      .collection('customers')
      .where('totalOrders', '>=', minOrders)
      .orderBy('totalOrders', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => doc.data() as CustomerProfile);
  } catch (error) {
    console.error('Get repeat customers error:', error);
    return [];
  }
}

/**
 * Get customer analytics (admin)
 */
export async function getCustomerAnalytics() {
  try {
    const app = getFirebaseAdminApp();
    if (!app) return null;

    const db = getFirestore(app);
    const snapshot = await db.collection('customers').get();
    const customers = snapshot.docs.map((doc) => doc.data() as CustomerProfile);

    return {
      totalCustomers: customers.length,
      repeatCustomers: customers.filter((c) => c.totalOrders > 1).length,
      totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
      avgLifetimeValue: customers.length > 0 ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length : 0,
      avgOrdersPerCustomer: customers.length > 0 ? customers.reduce((sum, c) => sum + c.totalOrders, 0) / customers.length : 0,
    };
  } catch (error) {
    console.error('Customer analytics error:', error);
    return null;
  }
}
