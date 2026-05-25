import { NextRequest, NextResponse } from 'next/server';
import { verifyBearerToken } from '@/lib/firebase-admin';
import { getUserProfile, upsertUserProfile } from '@/lib/user-profile-store';

function withNoStore(response: NextResponse) {
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

export async function GET(request: NextRequest) {
  const decoded = await verifyBearerToken(request.headers.get('authorization'));
  if (!decoded?.uid || !decoded.email) {
    return withNoStore(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
  }

  try {
    const profile = await getUserProfile(decoded.uid);
    if (!profile) {
      const created = await upsertUserProfile({ uid: decoded.uid, email: decoded.email });
      return withNoStore(NextResponse.json({ profile: created }));
    }

    return withNoStore(NextResponse.json({ profile }));
  } catch (err) {
    console.error('Failed loading profile', err);
    return withNoStore(NextResponse.json({ error: 'Failed loading profile' }, { status: 500 }));
  }
}

export async function PATCH(request: NextRequest) {
  const decoded = await verifyBearerToken(request.headers.get('authorization'));
  if (!decoded?.uid || !decoded.email) {
    return withNoStore(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
  }

  const body = await request.json().catch(() => ({}));
  const fullName = typeof body?.fullName === 'string' ? body.fullName.trim() : undefined;
  const phone = typeof body?.phone === 'string' ? body.phone.trim() : undefined;

  try {
    const profile = await upsertUserProfile({
      uid: decoded.uid,
      email: decoded.email,
      fullName,
      phone,
    });

    return withNoStore(NextResponse.json({ profile }));
  } catch (err) {
    console.error('Failed updating profile', err);
    return withNoStore(NextResponse.json({ error: 'Failed updating profile' }, { status: 500 }));
  }
}
