import Image from 'next/image';
import Link from 'next/link';

const footerLinks = {
  Platform: [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Browse mentors', href: '#mentors' },
    { label: 'Pricing', href: '/pricing' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy policy', href: '/privacy' },
    { label: 'Terms of service', href: '/terms' },
    { label: 'Cookie policy', href: '/cookies' },
  ],
};

const Footer = () => {
  return (
    <footer className="px-6 pt-16 pb-8 border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Top */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/mentra_logo.svg"
                alt="Mentra logo"
                width={32}
                height={32}
              />
              <span
                className="font-bold text-lg text-indigo-600"
                style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                Mentra
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              AI-powered mentorship platform connecting learners with expert
              mentors to grow faster and smarter.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-gray-800 mb-4">
                {category}
              </h4>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-indigo-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Mentra. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">
            Built with ❤️ for learners everywhere
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
