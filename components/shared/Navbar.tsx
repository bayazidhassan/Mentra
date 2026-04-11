'use client';

import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/mentra_logo.svg"
            alt="Mentra logo"
            width={36}
            height={36}
          />
          <span
            className="font-bold text-xl text-indigo-600"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            Mentra
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="#features"
            className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
          >
            How it works
          </Link>
          <Link
            href="#mentors"
            className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
          >
            Mentors
          </Link>
          <Link
            href="#faq"
            className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
          >
            FAQ
          </Link>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-gray-800 border border-gray-200 rounded-xl hover:border-indigo-400 hover:text-indigo-600 transition-all"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-medium text-white rounded-xl transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
          >
            Get started free
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-gray-600 hover:text-indigo-600 cursor-pointer"
          onClick={() => setIsOpen((p) => !p)}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-6 py-4 flex flex-col gap-4">
          <Link
            href="#features"
            className="text-sm text-gray-600 hover:text-indigo-600"
            onClick={() => setIsOpen(false)}
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm text-gray-600 hover:text-indigo-600"
            onClick={() => setIsOpen(false)}
          >
            How it works
          </Link>
          <Link
            href="#mentors"
            className="text-sm text-gray-600 hover:text-indigo-600"
            onClick={() => setIsOpen(false)}
          >
            Mentors
          </Link>
          <Link
            href="#faq"
            className="text-sm text-gray-600 hover:text-indigo-600"
            onClick={() => setIsOpen(false)}
          >
            FAQ
          </Link>
          <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
            <Link
              href="/login"
              className="text-center px-4 py-2 text-sm font-medium text-gray-800 border border-gray-200 rounded-xl hover:border-indigo-400"
              onClick={() => setIsOpen(false)}
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-center px-4 py-2 text-sm font-medium text-white rounded-xl"
              style={{
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              }}
              onClick={() => setIsOpen(false)}
            >
              Get started free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
