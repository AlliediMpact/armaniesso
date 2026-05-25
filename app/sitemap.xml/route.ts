import { NextRequest, NextResponse } from 'next/server';

/**
 * Generate XML sitemap for SEO
 * Lists all main pages and product pages
 */
export async function GET(request: NextRequest) {
  const baseUrl = 'https://armaniesso.co.za';

  const pages = [
    { url: '', priority: '1.0', changefreq: 'weekly' },
    { url: '/store', priority: '0.9', changefreq: 'daily' },
    { url: '/account', priority: '0.7', changefreq: 'monthly' },
    { url: '/contact', priority: '0.8', changefreq: 'monthly' },
    { url: '/auth', priority: '0.6', changefreq: 'monthly' },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${pages
    .map(
      (page) => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
  `
    )
    .join('')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
