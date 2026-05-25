import Link from 'next/link';

export default function NotFoundFallback() {
  return (
    <div className="min-h-screen bg-gradient-dark pt-28 pb-20 flex items-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-orange mb-4">404</p>
        <h1 className="text-5xl font-bold text-white mb-4">Page not found</h1>
        <p className="text-gray-300 text-lg mb-8">The page you’re looking for does not exist or has moved.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="px-6 py-3 rounded-lg bg-orange text-dark-bg font-semibold">
            Go home
          </Link>
          <Link href="/store" className="px-6 py-3 rounded-lg border border-orange text-orange font-semibold">
            Browse store
          </Link>
        </div>
      </div>
    </div>
  );
}
