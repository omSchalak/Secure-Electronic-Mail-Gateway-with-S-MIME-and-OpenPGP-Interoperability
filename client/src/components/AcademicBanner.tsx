import React from 'react';
import { ShieldAlert, Award, Terminal } from 'lucide-react';

export const AcademicBanner: React.FC = () => {
  return (
    <div className="bg-[#202020] text-white border-b-2 border-[#FF6B00] py-1.5 px-4 text-xs font-mono tracking-wider">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-[#FF6B00] text-white font-bold px-2 py-0.5 text-[10px] uppercase tracking-wider">
            <ShieldAlert size={12} /> Academic Project Demonstration
          </span>
          <span className="hidden sm:inline text-gray-300">
            Network Security & Secure Communication Protocols
          </span>
        </div>
        <div className="flex items-center gap-4 text-gray-300">
          <span className="flex items-center gap-1">
            <Award size={13} className="text-[#FF6B00]" />
            Creator: <strong className="text-white">Mansi Chalak</strong>
          </span>
          <span className="hidden md:flex items-center gap-1 text-[#FF8533]">
            <Terminal size={12} />
            S/MIME v4 & OpenPGP RFC 4880/9580
          </span>
        </div>
      </div>
    </div>
  );
};
