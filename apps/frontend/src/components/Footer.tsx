import { Logo } from './Logo';
import type { PageName } from '../types';

interface FooterProps {
  onNavigate: (page: PageName) => void;
}

const footerLinks = {
  Product: ['Explore Loans', 'Repayment Calculator', 'Loan Tracker', 'For Lenders'],
  Company: ['About Shohoj Rin', 'How It Works', 'Partners', 'Careers'],
  Resources: ['Financial Education', 'Loan Guide', 'Repayment Tips', 'FAQ'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Licenses'],
};

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-navy text-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          <div className="md:col-span-2">
            <Logo variant="white" onClick={() => onNavigate('landing')} />
            <p className="text-stone-400 text-sm leading-relaxed mt-4 max-w-xs">
              Making borrowing, lending, and financial management simple and transparent for everyone — especially first-time users.
            </p>
            <div className="flex gap-3 mt-5">
              {['𝕏', 'in', 'f'].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="w-8 h-8 rounded-[4px] border border-stone-600 flex items-center justify-center text-stone-400 hover:border-stone-400 hover:text-white text-xs transition-colors"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-4">{group}</p>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-stone-400 hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-stone-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-stone-500">
            © 2025 Shohoj Rin Technologies Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-stone-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald inline-block" />
              All systems operational
            </span>
            <span className="text-xs text-stone-500">BFIU Registered</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
