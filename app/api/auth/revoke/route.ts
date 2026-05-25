import { NextRequest, NextResponse } from 'next/server';
import { verifyBearerToken, revokeUserSessions } from '@/lib/firebase-admin';
import { checkRateLimit, getRequestClientId } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const clientId = getRequestClientId(request.headers);
  const rate = checkRateLimit(`auth-revoke:${clientId}`, 20, 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const decoded = await verifyBearerToken(request.headers.get('authorization'));
  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const ok = await revokeUserSessions(decoded.uid);
    if (!ok) {
      return NextResponse.json({ error: 'Failed to revoke tokens' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Failed revoking tokens', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
