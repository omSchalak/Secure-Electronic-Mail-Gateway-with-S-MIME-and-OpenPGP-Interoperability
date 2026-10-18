import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  ShieldCheck,
  Lock,
  KeyRound,
  ArrowRight,
  GitCompare,
  Terminal,
  CheckCircle,
  FileCheck2,
  Cpu,
  Fingerprint,
  Zap,
  Server,
  Layers,
  Sparkles,
} from 'lucide-react';
import { GatewayFlowAnimation } from '../components/GatewayFlowAnimation';

export const HomePage: React.FC = () => {
  const [selectedProtocolTab, setSelectedProtocolTab] = useState<'SMIME' | 'OPENPGP' | 'INTEROP'>('INTEROP');

  const securityIndicators = [
    { title: 'Email Encryption', status: 'ACTIVE', desc: 'AES-256-CBC & Curve25519 payload protection', icon: Lock },
    { title: 'Digital Signatures', status: 'VERIFIED', desc: 'RSA-2048 & Ed25519 non-repudiation digests', icon: FileCheck2 },
    { title: 'Certificate Verification', status: 'ACTIVE', desc: 'X.509 v3 SAN, serial, & validity checks', icon: ShieldCheck },
    { title: 'OpenPGP Key Validation', status: 'SYNCHRONIZED', desc: 'RFC 4880 subkey and fingerprint audit', icon: KeyRound },
    { title: 'Protocol Interoperability', status: 'OPERATIONAL', desc: 'Controlled Decrypt-and-Re-encrypt engine', icon: GitCompare },
    { title: 'Message Integrity', status: 'ENFORCED', desc: 'Strict anti-tamper digest enforcement', icon: Fingerprint },
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* =========================================================================
          MAXIMALIST HERO SECTION
      ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FF6B00] via-[#D94B00] to-[#202020] text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 border-b-4 border-[#202020]">
        {/* Geometric Background Decorative Elements */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full border-8 border-white border-dashed animate-spin" style={{ animationDuration: '60s' }} />
          <div className="absolute -bottom-20 right-10 w-96 h-96 border-8 border-white rotate-12" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Academic Badge */}
          <div className="inline-flex items-center gap-2 bg-[#202020] text-white px-3 py-1 text-xs font-mono font-bold border-2 border-white mb-6 shadow-[3px_3px_0_0_#FFFFFF]">
            <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-ping" />
            ACADEMIC PROJECT DEMONSTRATION | CREATOR: MANSI CHALAK
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Col: Bold Expressive Headline */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black uppercase tracking-tight leading-[0.95] text-white">
                SECURE EMAIL. <br />
                <span className="text-[#202020] bg-white px-3 inline-block shadow-[4px_4px_0_0_#202020] mt-2">
                  ZERO COMPROMISE.
                </span>
              </h1>

              <p className="text-xl sm:text-2xl font-bold text-white/95 leading-snug">
                Bridging S/MIME and OpenPGP for interoperable, privacy-first electronic communication.
              </p>

              <p className="text-sm sm:text-base text-white/80 max-w-xl font-medium leading-relaxed">
                A secure email gateway demonstration that brings certificate-based (X.509 PKCS#7) and
                OpenPGP-based email protection together through a unified, cryptographically verified workflow.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/interoperability"
                  className="bg-[#202020] text-white hover:bg-white hover:text-[#202020] text-sm sm:text-base font-black px-6 py-3.5 border-3 border-white shadow-[4px_4px_0_0_#FFFFFF] transition-all flex items-center gap-2 group"
                >
                  Explore the Gateway
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/dashboard"
                  className="bg-white text-[#202020] hover:bg-[#FFF0E5] text-sm sm:text-base font-black px-6 py-3.5 border-3 border-[#202020] shadow-[4px_4px_0_0_#202020] transition-all flex items-center gap-2"
                >
                  <Cpu size={18} className="text-[#FF6B00]" />
                  Launch Security Dashboard
                </Link>
              </div>

              {/* Quick Tech Labels */}
              <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] font-mono">
                <span className="bg-[#202020]/80 px-2 py-1 border border-white/40">RFC 8551 S/MIME v4</span>
                <span className="bg-[#202020]/80 px-2 py-1 border border-white/40">RFC 4880 OpenPGP</span>
                <span className="bg-[#202020]/80 px-2 py-1 border border-white/40">Curve25519 & RSA-2048</span>
                <span className="bg-[#202020]/80 px-2 py-1 border border-white/40">Zero Plaintext Leakage</span>
              </div>
            </div>

            {/* Right Col: Live Security Status Board */}
            <div className="lg:col-span-5">
              <div className="bg-white text-[#202020] border-4 border-[#202020] p-6 shadow-brutal-xl">
                <div className="flex items-center justify-between pb-3 border-b-2 border-[#202020] mb-4">
                  <div className="flex items-center gap-2">
                    <Shield className="text-[#FF6B00]" size={22} />
                    <span className="font-black text-sm uppercase tracking-wide">
                      Live Gateway Security Panel
                    </span>
                  </div>
                  <span className="bg-[#FF6B00] text-white text-[10px] font-mono font-bold px-2 py-0.5">
                    ONLINE
                  </span>
                </div>

                <div className="space-y-3">
                  {securityIndicators.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-2.5 bg-[#FFFAF5] border border-[#FFE0CC] hover:border-[#FF6B00] transition-colors"
                      >
                        <div className="p-1.5 bg-[#FFF0E5] text-[#FF6B00] border border-[#FF6B00] shrink-0 mt-0.5">
                          <Icon size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#202020]">{item.title}</span>
                            <span className="text-[10px] font-mono font-extrabold text-[#D94B00] bg-[#FFF0E5] px-1.5 py-0.2">
                              {item.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-600 truncate">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-[11px] font-mono text-gray-500">
                  <span>Trust Model: Unanchored Academic</span>
                  <Link to="/composer" className="text-[#FF6B00] font-bold hover:underline flex items-center gap-1">
                    Send Test Email →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          ANIMATED MESSAGE FLOW VISUALIZER SECTION
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <GatewayFlowAnimation />
      </section>

      {/* =========================================================================
          FEATURE GRID: ORANGE-BORDERED SECURITY CARDS
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-block bg-[#FF6B00] text-white px-2.5 py-1 text-xs font-mono font-bold uppercase mb-2">
              Architecture Modules
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase text-[#202020] tracking-tight">
              Enterprise Cryptographic Capabilities
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 max-w-md font-medium">
            Designed to address email protocol fragmentation without compromising signature integrity
            or exposing plaintext beyond strictly authenticated boundary memory.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="brutal-card p-6 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-[#FFF0E5] text-[#FF6B00] border-2 border-[#202020] flex items-center justify-center mb-4">
                <Lock size={24} />
              </div>
              <span className="text-[10px] font-mono font-bold text-[#FF6B00] uppercase tracking-wider">
                Module 01 / X.509 Standard
              </span>
              <h3 className="text-xl font-black text-[#202020] uppercase mt-1 mb-2">
                S/MIME v4 Studio
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                Real X.509 certificate generation, PEM parsing, SAN extraction, validity window checking,
                and PKCS#7 / CMS (RFC 5652) EnvelopedData encryption and SignedData validation.
              </p>
            </div>
            <Link
              to="/smime"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B00] hover:text-[#D94B00] group"
            >
              Open S/MIME Studio <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="brutal-card-orange p-6 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-[#FF6B00] text-white border-2 border-[#202020] flex items-center justify-center mb-4 shadow-[2px_2px_0_0_#202020]">
                <KeyRound size={24} />
              </div>
              <span className="text-[10px] font-mono font-bold text-[#D94B00] uppercase tracking-wider">
                Module 02 / RFC 4880 Standard
              </span>
              <h3 className="text-xl font-black text-[#202020] uppercase mt-1 mb-2">
                OpenPGP Cryptography
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                Full OpenPGP key pair generation (Curve25519 & RSA-2048), ASCII Armor inspection,
                detached & cleartext signatures, and session key decryption using OpenPGP.js.
              </p>
            </div>
            <Link
              to="/openpgp"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B00] hover:text-[#D94B00] group"
            >
              Open OpenPGP Lab <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="brutal-card p-6 flex flex-col justify-between bg-[#FFF0E5]/50">
            <div>
              <div className="w-12 h-12 bg-[#202020] text-white border-2 border-[#202020] flex items-center justify-center mb-4">
                <GitCompare size={24} className="text-[#FF6B00]" />
              </div>
              <span className="text-[10px] font-mono font-bold text-[#202020] uppercase tracking-wider">
                Module 03 / Core Research
              </span>
              <h3 className="text-xl font-black text-[#202020] uppercase mt-1 mb-2">
                Protocol Interoperability
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                6 interactive test scenarios demonstrating direct pass-through, controlled decrypt-and-re-encrypt,
                missing key mitigation, and tamper detection with transparent security disclosures.
              </p>
            </div>
            <Link
              to="/interoperability"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#202020] hover:text-[#FF6B00] group"
            >
              Launch Interop Lab <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE PROTOCOL COMPARISON SECTION
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border-3 border-[#202020] p-6 sm:p-8 shadow-brutal-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="text-[10px] font-mono font-bold text-[#FF6B00] uppercase tracking-wider">
                Technical Architecture Comparison
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#202020] uppercase tracking-tight">
                S/MIME vs OpenPGP Protocol Breakdown
              </h3>
            </div>

            {/* Protocol Tabs */}
            <div className="flex items-center border-2 border-[#202020] bg-gray-100 p-1 gap-1">
              <button
                onClick={() => setSelectedProtocolTab('INTEROP')}
                className={`px-3 py-1.5 text-xs font-bold transition-all ${
                  selectedProtocolTab === 'INTEROP'
                    ? 'bg-[#FF6B00] text-white shadow-[2px_2px_0_0_#202020]'
                    : 'text-gray-700 hover:text-black'
                }`}
              >
                Gateway Interop
              </button>
              <button
                onClick={() => setSelectedProtocolTab('SMIME')}
                className={`px-3 py-1.5 text-xs font-bold transition-all ${
                  selectedProtocolTab === 'SMIME'
                    ? 'bg-[#202020] text-white shadow-[2px_2px_0_0_#202020]'
                    : 'text-gray-700 hover:text-black'
                }`}
              >
                S/MIME (X.509)
              </button>
              <button
                onClick={() => setSelectedProtocolTab('OPENPGP')}
                className={`px-3 py-1.5 text-xs font-bold transition-all ${
                  selectedProtocolTab === 'OPENPGP'
                    ? 'bg-[#D94B00] text-white shadow-[2px_2px_0_0_#202020]'
                    : 'text-gray-700 hover:text-black'
                }`}
              >
                OpenPGP (RFC 4880)
              </button>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#202020] text-white font-mono uppercase">
                  <th className="p-3 border border-gray-700">Security Dimension</th>
                  <th className="p-3 border border-gray-700">S/MIME (RFC 8551)</th>
                  <th className="p-3 border border-gray-700">OpenPGP (RFC 4880/9580)</th>
                  <th className="p-3 border border-gray-700 bg-[#FF6B00] text-white">Gateway Solution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-medium text-gray-800">
                <tr className="hover:bg-[#FFF0E5]/30">
                  <td className="p-3 font-bold bg-[#FFFAF5] border border-gray-300">Trust Architecture</td>
                  <td className="p-3 border border-gray-300">Hierarchical Public Key Infrastructure (Root CAs, Intermediates, CRL/OCSP)</td>
                  <td className="p-3 border border-gray-300">Decentralized Web of Trust (Key Signatures, HKP Keyservers, WKD)</td>
                  <td className="p-3 border border-gray-300 bg-[#FFF0E5]/60 font-bold text-[#D94B00]">Dual-anchored Gateway Directory with verification isolation</td>
                </tr>
                <tr className="hover:bg-[#FFF0E5]/30">
                  <td className="p-3 font-bold bg-[#FFFAF5] border border-gray-300">Wire Encoding</td>
                  <td className="p-3 border border-gray-300">ASN.1 DER/BER binary structures (CMS / PKCS#7 envelope)</td>
                  <td className="p-3 border border-gray-300">OpenPGP packet streams, Radix-64 (ASCII Armor blocks)</td>
                  <td className="p-3 border border-gray-300 bg-[#FFF0E5]/60 font-bold text-[#D94B00]">Controlled Decrypt-and-Re-encrypt at trust boundary</td>
                </tr>
                <tr className="hover:bg-[#FFF0E5]/30">
                  <td className="p-3 font-bold bg-[#FFFAF5] border border-gray-300">MIME Content-Type</td>
                  <td className="p-3 border border-gray-300"><code>application/pkcs7-mime; smime-type=enveloped-data</code></td>
                  <td className="p-3 border border-gray-300"><code>multipart/encrypted; protocol="application/pgp-encrypted"</code></td>
                  <td className="p-3 border border-gray-300 bg-[#FFF0E5]/60 font-bold text-[#D94B00]">Dynamic MIME repackaging matching destination recipient</td>
                </tr>
                <tr className="hover:bg-[#FFF0E5]/30">
                  <td className="p-3 font-bold bg-[#FFFAF5] border border-gray-300">Native Email Client Support</td>
                  <td className="p-3 border border-gray-300">Built-in: Microsoft Outlook, Apple Mail, iOS, Thunderbird</td>
                  <td className="p-3 border border-gray-300">Native in Thunderbird; requires plugins in Outlook / Apple Mail (GPGTools)</td>
                  <td className="p-3 border border-gray-300 bg-[#FFF0E5]/60 font-bold text-[#D94B00]">Enables seamless cross-client secure email exchange</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3 bg-[#FFF0E5] border border-[#FF6B00] text-xs font-mono text-[#D94B00] flex items-center gap-2">
            <Sparkles size={16} className="shrink-0" />
            <span>
              <strong>Crucial Cryptographic Truth:</strong> S/MIME and OpenPGP cannot be converted at the ciphertext level.
              The gateway acts as an authenticated decrypt-and-re-encrypt boundary with clear audit disclosure.
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          MAXIMALIST CALL TO ACTION SECTION
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#202020] text-white border-4 border-[#FF6B00] p-8 sm:p-12 shadow-brutal-xl relative overflow-hidden">
          <div className="max-w-3xl space-y-4 relative z-10">
            <span className="text-xs font-mono font-bold text-[#FF8533] uppercase tracking-wider">
              Ready to Inspect the Gateway?
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
              Launch the Interactive Security Workbench
            </h2>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-medium">
              Compose real encrypted messages, upload custom X.509 certificates, generate OpenPGP ECC keys,
              and step through all 6 cross-protocol interoperability scenarios in real-time.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                to="/composer"
                className="bg-[#FF6B00] hover:bg-[#D94B00] text-white text-sm font-black px-6 py-3 border-2 border-white shadow-[4px_4px_0_0_#FFFFFF] transition-all flex items-center gap-2"
              >
                Compose Secure Email →
              </Link>
              <Link
                to="/docs"
                className="bg-transparent hover:bg-white hover:text-[#202020] text-white text-sm font-black px-6 py-3 border-2 border-white transition-all"
              >
                Read Project Architecture & Threat Model
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
