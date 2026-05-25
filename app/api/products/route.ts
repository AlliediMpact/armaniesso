import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import { checkRateLimit, getRequestClientId } from '@/lib/rate-limit';

/**
 * GET /api/products
 * List all products (public endpoint)
 * With pagination, filtering, and search
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getRequestClientId(request.headers);
    const rate = checkRateLimit(`products-list:${clientId}`, 100, 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const app = getFirebaseAdminApp();
    
    // If Firestore unavailable, try local products
    if (!app) {
      const { products } = await import('@/lib/products');
      const url = new URL(request.url);
      const category = url.searchParams.get('category');
      const search = url.searchParams.get('search')?.toLowerCase();

      let filtered = products;
      if (category) {
        filtered = filtered.filter((p) => p.category === category);
      }
      if (search) {
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(search) ||
            p.description.toLowerCase().includes(search)
        );
      }

      const response = NextResponse.json({
        products: filtered,
        total: filtered.length,
        source: 'local',
      });
      response.headers.set('Cache-Control', 'public, max-age=300');
      return response;
    }

    const db = getFirestore(app);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search')?.toLowerCase();
    const sort = url.searchParams.get('sort') || 'name'; // name, price

    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    let query: any = db.collection('products');

    // Filter by category
    if (category) {
      query = query.where('category', '==', category);
    }

    // Filter by availability
    query = query.where('isAvailable', '==', true);

    const snapshot = await query.get();
    let items = snapshot.docs.map((doc: any) => doc.data());

    // Search in name and description
    if (search) {
      items = items.filter(
        (p: any) =>
          p.name.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search)
      );
    }

    // Sort
    if (sort === 'price') {
      items.sort((a: any, b: any) => a.basePrice - b.basePrice);
    } else {
      items.sort((a: any, b: any) => a.name.localeCompare(b.name));
    }

    const total = items.length;
    const start = (page - 1) * limit;
    const paginatedItems = items.slice(start, start + limit);

    const response = NextResponse.json({
      products: paginatedItems,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      source: 'firestore',
    });

    // Cache for 5 minutes
    response.headers.set('Cache-Control', 'public, max-age=300');
    return response;
  } catch (error) {
    console.error('Product listing error:', error);
    return NextResponse.json(
      { error: 'Failed to list products' },
      { status: 500 }
    );
  }
}
