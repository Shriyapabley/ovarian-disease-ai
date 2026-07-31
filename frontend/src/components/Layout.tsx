import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Activity, LayoutDashboard, Microscope, History, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Layout() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/prediction', label: 'AI Prediction', icon: Microscope },
    { to: '/history', label: 'History', icon: History },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass shadow-lg py-2' : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-6 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-400 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-slate-800 leading-tight">
                OvaScan AI
              </h1>
              <p className="text-xs text-purple-600 font-medium">
                Clinical Decision Support System
              </p>
            </div>
          </NavLink>

          <nav className="hidden md:flex items-center gap-1 glass rounded-2xl p-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/30'
                      : 'text-slate-600 hover:bg-white/50 hover:text-purple-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* System status only — no avatar */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 glass rounded-xl px-4 py-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-slate-600">System Online</span>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="md:hidden flex items-center justify-center gap-1 mt-3 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                    : 'text-slate-600 bg-white/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1 pt-24 pb-8 px-4 md:px-6 max-w-[1600px] mx-auto w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
          <Activity className="w-4 h-4 text-pink-500" />
          <span>
            OvaScan AI — AI-Based Intelligent Clinical Decision Support System for Ovarian
            Disease Diagnosis
          </span>
        </div>
      </footer>
    </div>
  );
}
