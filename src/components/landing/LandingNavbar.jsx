import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowUpRight } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home', href: '#hero' },
  { label: 'Tournament', href: '#intro' },
  { label: 'Teams', href: '#teams' },
  { label: 'Fixtures', href: '#fixtures' },
  { label: 'Leaderboard', href: '#leaderboard' },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeHref, setActiveHref] = useState('#hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);

      const sectionIds = ['#leaderboard', '#fixtures', '#teams', '#intro', '#hero'];
      for (const id of sectionIds) {
        const el = document.querySelector(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 180) {
            setActiveHref(id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    setActiveHref(href);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 pointer-events-none py-4 sm:py-5 transition-all duration-300">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 flex items-center justify-end md:justify-center">
          {/* Mobile Glass Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="pointer-events-auto md:hidden w-11 h-11 rounded-2xl bg-black/25 backdrop-blur-xl border border-white/25 text-white flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-transform active:scale-95"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Center Zone: Laptop/Desktop Glassmorphism Floating Pill Navbar (Visible ONLY after scrolling) */}
          <nav
            aria-label="Landing page navigation"
            className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/[0.08] backdrop-blur-2xl border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)] transition-all duration-300 ${
              scrolled
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 -translate-y-4 pointer-events-none'
            }`}
          >
            {NAV_LINKS.map((item) => {
              const isActive = activeHref === item.href;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all duration-200 whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-white/20 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]'
                      : 'text-white/85 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}

            <span aria-hidden="true" className="w-px h-5 bg-white/20 mx-1" />

            <Link
              to="/public"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-[#090909] hover:bg-[#B8F34A] text-xs font-black uppercase tracking-wider whitespace-nowrap shrink-0 transition-all duration-200 shadow-sm hover:scale-[1.03]"
            >
              <span>Enter Cup</span>
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.75]" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Mobile Glassmorphism Slide-Out Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-[#090909]/85 backdrop-blur-2xl flex flex-col justify-between p-6 pt-24 animate-fade-in">
          <nav className="flex flex-col space-y-3">
            {NAV_LINKS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="font-display text-4xl font-black uppercase tracking-tight text-[#F4F7F2] hover:text-[#B8F34A] py-2.5 border-b border-white/10 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="pb-4">
            <Link
              to="/public"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-4 rounded-full bg-[#B8F34A] text-[#090909] font-display text-lg font-black uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <span>Enter The Cup</span>
              <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

export default LandingNavbar;
