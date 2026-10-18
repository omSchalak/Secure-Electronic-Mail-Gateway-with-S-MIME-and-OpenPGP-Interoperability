import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, KeyRound, ExternalLink, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#202020] text-white border-t-4 border-[#FF6B00] mt-20">
      {/* Top Banner inside Footer */}
      <div className="bg-[#FF6B00] text-[#202020] py-6 px-4 sm:px-8 border-b-2 border-[#202020]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-white">
              Secure Electronic Mail Gateway
            </h3>
            <p className="text-xs sm:text-sm font-medium text-white/90">
              S/MIME and OpenPGP Interoperability Architecture Demonstration
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/interoperability"
              className="bg-[#202020] text-white px-5 py-2.5 text-xs font-bold border-2 border-white shadow-[3px_3px_0_0_#FFFFFF] hover:bg-white hover:text-[#202020] transition-all"
            >
              Test Cross-Protocol Gateway →
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Project & Creator */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#FF6B00] border-2 border-white flex items-center justify-center text-white">
                <Shield size={20} />
              </div>
              <div>
                <div className="font-extrabold text-lg text-white">
                  SECURE<span className="text-[#FF6B00]">MAIL</span>GATEWAY
                </div>
                <div className="text-[11px] font-mono text-gray-400">
                  Domain: Network Security & Secure Communication Protocols
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed max-w-lg">
              An advanced cybersecurity gateway prototype exploring cryptographic interoperability between
              X.509 PKI-based S/MIME envelopes (RFC 8551) and Web-of-Trust OpenPGP packet streams (RFC 4880/9580).
              Demonstrates controlled decrypt-and-re-encrypt boundaries, message integrity, and digital signature preservation.
            </p>

            <div className="p-3 bg-[#2A2A2A] border border-[#FF6B00] text-xs font-mono space-y-1">
              <div className="text-[#FF8533] font-bold">ACADEMIC PROJECT METADATA:</div>
              <div><strong>Project:</strong> Secure Electronic Mail Gateway with S/MIME and OpenPGP Interoperability</div>
              <div><strong>Website Creator:</strong> Mansi Chalak</div>
              <div><strong>Domain:</strong> Network Security and Secure Communication Protocols</div>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-[#FF6B00] uppercase tracking-wider">
              Gateway Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/dashboard" className="text-gray-300 hover:text-[#FF6B00] transition-colors flex items-center gap-1.5">
                  Security Dashboard
                </Link>
              </li>
              <li>
                <Link to="/interoperability" className="text-gray-300 hover:text-[#FF6B00] transition-colors flex items-center gap-1.5 font-bold">
                  ★ Protocol Interoperability Lab
                </Link>
              </li>
              <li>
                <Link to="/composer" className="text-gray-300 hover:text-[#FF6B00] transition-colors flex items-center gap-1.5">
                  Secure Email Composer
                </Link>
              </li>
              <li>
                <Link to="/smime" className="text-gray-300 hover:text-[#FF6B00] transition-colors flex items-center gap-1.5">
                  S/MIME X.509 Certificate Studio
                </Link>
              </li>
              <li>
                <Link to="/openpgp" className="text-gray-300 hover:text-[#FF6B00] transition-colors flex items-center gap-1.5">
                  OpenPGP Key & Cipher Lab
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Standards & Docs */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-[#FF6B00] uppercase tracking-wider">
              Audit & Documentation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/credentials" className="text-gray-300 hover:text-[#FF6B00] transition-colors">
                  Key & Certificate Management
                </Link>
              </li>
              <li>
                <Link to="/audit" className="text-gray-300 hover:text-[#FF6B00] transition-colors">
                  Tamper-Evident Audit Logs
                </Link>
              </li>
              <li>
                <Link to="/docs" className="text-gray-300 hover:text-[#FF6B00] transition-colors">
                  Technical Architecture & Threat Model
                </Link>
              </li>
              <li>
                <span className="text-gray-400 flex items-center gap-1 text-[11px]">
                  RFC 8551 / RFC 5652 (CMS) <ExternalLink size={10} />
                </span>
              </li>
              <li>
                <span className="text-gray-400 flex items-center gap-1 text-[11px]">
                  RFC 4880 / RFC 9580 (PGP) <ExternalLink size={10} />
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-3">
          <div>
            © {new Date().getFullYear()} Secure Electronic Mail Gateway. Academic Demonstration Project.
          </div>
          <div className="flex items-center gap-2 font-mono text-gray-300">
            <span>Designed and Developed by</span>
            <span className="bg-[#FF6B00] text-white px-2 py-0.5 font-bold uppercase tracking-wider text-[11px]">
              Mansi Chalak
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
