import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  Send,
  Lock,
  KeyRound,
  GitCompare,
  Key,
  FileText,
  BookOpen,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home', icon: Shield },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/interoperability', label: 'Interop Lab', icon: GitCompare, highlight: true },
    { to: '/composer', label: 'Composer', icon: Send },
    { to: '/smime', label: 'S/MIME', icon: Lock },
    { to: '/openpgp', label: 'OpenPGP', icon: KeyRound },
    { to: '/credentials', label: 'Keys & Certs', icon: Key },
    { to: '/audit', label: 'Audit Logs', icon: FileText },
    { to: '/docs', label: 'Docs', icon: BookOpen },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-[#FFFFFF] border-b-2 border-[#202020] shadow-[0_2px_0_0_#202020]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Project Title */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-[#FF6B00] border-2 border-[#202020] flex items-center justify-center text-white shadow-[2px_2px_0_0_#202020] group-hover:bg-[#D94B00] transition-colors">
              <Shield size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-extrabold text-base tracking-tight text-[#202020]">
                SECURE<span className="text-[#FF6B00]">MAIL</span>GATEWAY
              </div>
              <div className="text-[10px] font-mono font-medium text-gray-500 uppercase tracking-wider">
                S/MIME × OpenPGP Interoperability
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all border-2 ${
                    active
                      ? 'bg-[#FF6B00] text-white border-[#202020] shadow-[2px_2px_0_0_#202020]'
                      : item.highlight
                      ? 'bg-[#FFF0E5] text-[#D94B00] border-[#FF6B00] hover:bg-[#FF6B00] hover:text-white'
                      : 'text-[#202020] border-transparent hover:border-[#202020] hover:bg-gray-100'
                  }`}
                >
                  <Icon size={14} className={item.highlight && !active ? 'text-[#FF6B00]' : ''} />
                  <span>{item.label}</span>
                  {item.highlight && !active && (
                    <Sparkles size={11} className="text-[#FF6B00] animate-pulse" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Creator Tag & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end text-right border-l-2 border-gray-200 pl-3">
              <span className="text-[9px] font-mono text-gray-500 uppercase">Designed by</span>
              <span className="text-xs font-extrabold text-[#202020]">Mansi Chalak</span>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 bg-[#FFF0E5] border-2 border-[#202020] text-[#202020] hover:bg-[#FF6B00] hover:text-white transition-colors shadow-[2px_2px_0_0_#202020]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b-2 border-[#202020] px-4 pt-2 pb-4 space-y-1 shadow-lg">
          <div className="p-2 mb-2 bg-[#FFF0E5] border border-[#FF6B00] text-xs font-mono">
            <strong>Creator:</strong> Mansi Chalak | Academic Cybersecurity Project
          </div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 text-sm font-bold border-2 transition-all ${
                  active
                    ? 'bg-[#FF6B00] text-white border-[#202020]'
                    : item.highlight
                    ? 'bg-[#FFF0E5] text-[#D94B00] border-[#FF6B00]'
                    : 'text-[#202020] border-transparent hover:border-[#202020] hover:bg-gray-50'
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {item.highlight && (
                  <span className="ml-auto text-[10px] bg-[#FF6B00] text-white px-1.5 py-0.5 uppercase font-mono">
                    Core Lab
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
};
