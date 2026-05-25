import { getApps, initializeApp, cert, applicationDefault, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

type DecodedToken = {
  uid: string;
  email?: string;
  claims?: Record<string, unknown>;
};

function initFirebaseAdmin(): App | null {
  if (getApps().length) return getApps()[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  try {
    if (projectId && clientEmail && privateKey) {
      return initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    }

    return initializeApp({
      credential: applicationDefault(),
      projectId,
    });
  } catch (_err) {
    return null;
  }
}

export function getFirebaseAdminApp(): App | null {
  return initFirebaseAdmin();
}

export async function verifyBearerToken(
  authorizationHeader: string | null
): Promise<DecodedToken | null> {
  if (!authorizationHeader) return null;
  if (!authorizationHeader.toLowerCase().startsWith('bearer ')) return null;

  const token = authorizationHeader.slice(7).trim();
  if (!token) return null;

  const app = initFirebaseAdmin();
  if (!app) return null;

  try {
    const decoded = await getAuth(app).verifyIdToken(token);
    // Check for server-side revocation marker in Firestore (if available)
    try {
      const db = getFirestore(app);
      const revDoc = await db.collection('userSessionRevocations').doc(decoded.uid).get();
      if (revDoc.exists) {
        const data = revDoc.data();
        const revokedAt = data?.revokedAt;
        if (revokedAt) {
          const authTimeMs = (decoded.auth_time || decoded.authTime || 0) * 1000;
          const revokedAtMs =
            typeof revokedAt?.toDate === 'function'
              ? revokedAt.toDate().getTime()
              : typeof revokedAt === 'number'
              ? revokedAt
              : Number(revokedAt?._seconds || 0) * 1000;
          if (authTimeMs < revokedAtMs) {
            // Token was issued before revocation
            return null;
          }
        }
      }
    } catch (_err) {
      // Ignore Firestore errors and proceed with decoded token
    }
    return {
      uid: decoded.uid,
      email: decoded.email,
      claims: decoded,
    };
  } catch (_err) {
    return null;
  }
}

export async function revokeUserSessions(uid: string): Promise<boolean> {
  const app = initFirebaseAdmin();
  if (!app) return false;
  try {
    await getAuth(app).revokeRefreshTokens(uid);
    try {
      const db = getFirestore(app);
      await db.collection('userSessionRevocations').doc(uid).set({ revokedAt: new Date() }, { merge: true });
    } catch (_e) {
      // best effort: if this fails, token revocation still occurred
    }
    return true;
  } catch (_err) {
    return false;
  }
}
