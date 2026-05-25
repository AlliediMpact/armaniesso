import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import { verifyBearerToken } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function withNoStore(response: NextResponse) {
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

function getAllowedAdmins() {
  const raw = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || '';
  return new Set(
    raw
      .split(',')
      .map((x) => x.trim().toLowerCase())
      .filter(Boolean)
  );
}

function isAdminToken(decoded: { email?: string; claims?: Record<string, unknown> } | null) {
  if (!decoded) return false;
  const claims = decoded.claims || {};
  return (
    claims.admin === true ||
    claims.role === 'admin' ||
    (Array.isArray(claims.roles) && (claims.roles as unknown[]).includes('admin'))
  );
}

/**
 * GET /api/admin/users
 * List all admins and users with admin status
 */
export async function GET(request: NextRequest) {
  try {
    const decoded = await verifyBearerToken(request.headers.get('authorization'));
    if (!decoded) {
      return withNoStore(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
    }

    const email = decoded.email || '';
    const admins = getAllowedAdmins();
    if (!isAdminToken(decoded) && !admins.has(email.toLowerCase())) {
      return withNoStore(NextResponse.json({ error: 'Forbidden' }, { status: 403 }));
    }

    const app = getFirebaseAdminApp();
    if (!app) {
      return withNoStore(
        NextResponse.json({ error: 'Firebase not configured' }, { status: 500 })
      );
    }

    const auth = getAuth(app);
    const db = getFirestore(app);

    // Get all users (paginate if needed)
    const users: Array<{
      uid: string;
      email?: string;
      displayName?: string;
      customClaims?: Record<string, unknown>;
      createdAt?: string;
    }> = [];

    try {
      // List users from Firebase Auth (limited to 1000)
      const listUsersResult = await auth.listUsers(1000);
      
      for (const user of listUsersResult.users) {
        const isAdmin =
          user.customClaims?.admin === true ||
          user.customClaims?.role === 'admin' ||
          (Array.isArray(user.customClaims?.roles) &&
            user.customClaims.roles.includes('admin'));

        users.push({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          customClaims: user.customClaims,
          createdAt: user.metadata?.creationTime,
        });
      }
    } catch (err) {
      console.error('Error listing users:', err);
      return withNoStore(
        NextResponse.json({ error: 'Failed to list users' }, { status: 500 })
      );
    }

    return withNoStore(
      NextResponse.json({ users, count: users.length }, { status: 200 })
    );
  } catch (err: any) {
    console.error('Admin users GET error:', err);
    return withNoStore(
      NextResponse.json(
        { error: err?.message || 'Internal server error' },
        { status: 500 }
      )
    );
  }
}

/**
 * POST /api/admin/users
 * Promote a user to admin
 */
export async function POST(request: NextRequest) {
  try {
    const decoded = await verifyBearerToken(request.headers.get('authorization'));
    if (!decoded) {
      return withNoStore(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
    }

    const email = decoded.email || '';
    const admins = getAllowedAdmins();
    if (!isAdminToken(decoded) && !admins.has(email.toLowerCase())) {
      return withNoStore(NextResponse.json({ error: 'Forbidden' }, { status: 403 }));
    }

    const body = await request.json();
    const { uid } = body;

    if (!uid || typeof uid !== 'string') {
      return withNoStore(
        NextResponse.json({ error: 'UID required' }, { status: 400 })
      );
    }

    const app = getFirebaseAdminApp();
    if (!app) {
      return withNoStore(
        NextResponse.json({ error: 'Firebase not configured' }, { status: 500 })
      );
    }

    const auth = getAuth(app);

    // Set admin custom claim
    await auth.setCustomUserClaims(uid, { admin: true, role: 'admin' });

    // Get updated user
    const user = await auth.getUser(uid);

    return withNoStore(
      NextResponse.json(
        {
          success: true,
          message: `User ${user.email} promoted to admin`,
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            customClaims: user.customClaims,
          },
        },
        { status: 200 }
      )
    );
  } catch (err: any) {
    console.error('Admin users POST error:', err);
    return withNoStore(
      NextResponse.json(
        { error: err?.message || 'Failed to promote user' },
        { status: 500 }
      )
    );
  }
}
