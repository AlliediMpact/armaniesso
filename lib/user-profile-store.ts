import fs from 'fs/promises';
import path from 'path';
import { getFirestore } from 'firebase-admin/firestore';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';

const USERS_PATH = path.resolve(process.cwd(), 'data', 'users.json');
const USER_COLLECTION = 'userProfiles';

export type UserProfile = {
  uid: string;
  email: string;
  fullName?: string;
  phone?: string;
  billingAddress?: string;
  billingCity?: string;
  billingZipcode?: string;
  createdAt: string;
  updatedAt: string;
};

function firestoreEnabled(): boolean {
  // Prefer a dedicated flag for user profiles, fall back to orders flag for compatibility
  const userFlag = (process.env.FIREBASE_USE_FIRESTORE_USERS || '').toLowerCase();
  if (userFlag) {
    if (userFlag === 'false' || userFlag === '0' || userFlag === 'off') return false;
    return true;
  }

  const ordersFlag = (process.env.FIREBASE_USE_FIRESTORE_ORDERS || '').toLowerCase();
  if (ordersFlag === 'false' || ordersFlag === '0' || ordersFlag === 'off') return false;
  return true;
}

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

function getDbOrNull() {
  if (!firestoreEnabled()) return null;
  const app = getFirebaseAdminApp();
  if (!app) return null;
  try {
    return getFirestore(app);
  } catch (_err) {
    return null;
  }
}

async function ensureLocalStore() {
  const dir = path.dirname(USERS_PATH);
  await fs.mkdir(dir, { recursive: true });
  try {
    await fs.access(USERS_PATH);
  } catch (_err) {
    await fs.writeFile(USERS_PATH, '[]', 'utf-8');
  }
}

function normalizeProfile(input: Partial<UserProfile> & { uid: string; email: string }): UserProfile {
  const now = new Date().toISOString();
  return {
    uid: input.uid,
    email: String(input.email || '').toLowerCase(),
    fullName: input.fullName || undefined,
    phone: input.phone || undefined,
    billingAddress: input.billingAddress || undefined,
    billingCity: input.billingCity || undefined,
    billingZipcode: input.billingZipcode || undefined,
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now,
  };
}

async function readUsersLocal(): Promise<UserProfile[]> {
  await ensureLocalStore();
  try {
    const raw = await fs.readFile(USERS_PATH, 'utf-8');
    const parsed = JSON.parse(raw || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (_err) {
    return [];
  }
}

async function saveUsersLocal(users: UserProfile[]): Promise<void> {
  await ensureLocalStore();
  await fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2), 'utf-8');
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const db = getDbOrNull();

  if (db) {
    try {
      const doc = await db.collection(USER_COLLECTION).doc(uid).get();
      if (!doc.exists) return null;
      return doc.data() as UserProfile;
    } catch (_err) {
      if (isProduction()) return null;
    }
  }

  const local = await readUsersLocal();
  return local.find((u) => u.uid === uid) || null;
}

export async function upsertUserProfile(input: {
  uid: string;
  email: string;
  fullName?: string;
  phone?: string;
  billingAddress?: string;
  billingCity?: string;
  billingZipcode?: string;
}): Promise<UserProfile> {
  const existing = await getUserProfile(input.uid);
  const merged = normalizeProfile({
    uid: input.uid,
    email: input.email || existing?.email || '',
    fullName: input.fullName ?? existing?.fullName,
    phone: input.phone ?? existing?.phone,
    billingAddress: input.billingAddress ?? existing?.billingAddress,
    billingCity: input.billingCity ?? existing?.billingCity,
    billingZipcode: input.billingZipcode ?? existing?.billingZipcode,
    createdAt: existing?.createdAt,
    updatedAt: new Date().toISOString(),
  });

  const db = getDbOrNull();
  if (db) {
    try {
      await db.collection(USER_COLLECTION).doc(merged.uid).set(merged, { merge: true });
      return merged;
    } catch (_err) {
      if (isProduction()) {
        throw new Error('Failed to save user profile in Firestore');
      }
    }
  } else if (isProduction() && firestoreEnabled()) {
    throw new Error('Firestore is not available for profile persistence');
  }

  const local = await readUsersLocal();
  const idx = local.findIndex((u) => u.uid === merged.uid);
  if (idx >= 0) local[idx] = merged;
  else local.push(merged);
  await saveUsersLocal(local);
  return merged;
}
