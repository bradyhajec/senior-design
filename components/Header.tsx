'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-cream-200/90 backdrop-blur-md border-b border-forest-200/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-forest-700 rounded-full flex items-center justify-center group-hover:bg-forest-600 transition-colors duration-200">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-cream-100" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8 7 3 11 12 20 21 11 16 7 12 2z" />
              <path d="M12 8 L12 20" stroke="#f5f0e8" strokeWidth="1" strokeLinecap="round" fill="none" />
            </svg>
          </div>
          <span className="font-display text-2xl font-600 text-forest-700 tracking-tight" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 600, letterSpacing: '-0.01em' }}>
            Verdant
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              pathname === '/'
                ? 'bg-forest-700 text-cream-100'
                : 'text-forest-600 hover:bg-forest-100'
            }`}
          >
            My Plants
          </Link>
          <Link
            href="/analyze"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              pathname === '/analyze'
                ? 'bg-forest-700 text-cream-100'
                : 'text-forest-600 hover:bg-forest-100'
            }`}
          >
            Analyze
          </Link>
        </nav>

        {/* CTA */}
        <Link
          href="/analyze"
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-terracotta-500 hover:bg-terracotta-600 text-cream-100 rounded-full text-sm font-medium transition-colors duration-200"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v8M8 12h8" strokeLinecap="round" />
          </svg>
          New Analysis
        </Link>
      </div>
    </header>
  );
}
