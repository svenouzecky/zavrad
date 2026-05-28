'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MobileMenu() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5"
      >
        <span className={`block h-0.5 w-6 bg-gray-600 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
        <span className={`block h-0.5 w-6 bg-gray-600 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
        <span className={`block h-0.5 w-6 bg-gray-600 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
      </button>

      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 border-t border-gray-100 bg-white px-6 py-4 flex flex-col gap-4 shadow-md z-50">
          <Link href="/" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-600 hover:text-blue-600">Home</Link>
          <Link href="/analytics" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-600 hover:text-blue-600">Analytics</Link>
          <Link href="/settings" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-600 hover:text-blue-600">Settings</Link>
        </div>
      )}
    </>
  );
}
