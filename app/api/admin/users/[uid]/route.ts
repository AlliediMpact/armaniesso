import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import { verifyBearerToken } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';

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
 * DELETE /api/admin/users/[uid]
 * Demote a user from admin (remove admin role)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
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

    const uid = params.uid;
    if (!uid) {
      return withNoStore(
        NextResponse.json({ error: 'UID required' }, { status: 400 })
      );
    }

    // Prevent removing your own admin status
    if (decoded.uid === uid) {
      return withNoStore(
        NextResponse.json(
          { error: 'Cannot remove your own admin status' },
          { status: 400 }
        )
      );
    }

    const app = getFirebaseAdminApp();
    if (!app) {
      return withNoStore(
        NextResponse.json({ error: 'Firebase not configured' }, { status: 500 })
      );
    }

    const auth = getAuth(app);

    // Remove admin custom claims
    await auth.setCustomUserClaims(uid, null);

    // Get updated user
    const user = await auth.getUser(uid);

    return withNoStore(
      NextResponse.json(
        {
          success: true,
          message: `User ${user.email} removed from admin`,
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
    console.error('Admin users DELETE error:', err);
    return withNoStore(
      NextResponse.json(
        { error: err?.message || 'Failed to demote user' },
        { status: 500 }
      )
    );
  }
}
