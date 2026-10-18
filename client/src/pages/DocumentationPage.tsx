import React from 'react';
import {
  BookOpen,
  Shield,
  Lock,
  KeyRound,
  FileCheck2,
  GitCompare,
  AlertTriangle,
  Server,
  Cpu,
  Layers,
  ArrowRight,
  Terminal,
} from 'lucide-react';

export const DocumentationPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header */}
      <div className="pb-6 border-b-2 border-[#202020]">
        <div className="inline-flex items-center gap-1.5 bg-[#FF6B00] text-white px-2.5 py-0.5 text-xs font-mono font-bold uppercase mb-2">
          <BookOpen size={13} /> Project Documentation & Technical Architecture
        </div>
        <h1 className="text-3xl sm:text-5xl font-black uppercase text-[#202020] tracking-tight">
          Secure Electronic Mail Gateway Architecture
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium">
          Comprehensive reference guide on S/MIME, OpenPGP, cryptographic interoperability, and gateway security boundaries.
        </p>
      </div>

      {/* Project Metadata Card */}
      <div className="bg-[#202020] text-white border-4 border-[#FF6B00] p-6 sm:p-8 shadow-brutal-xl">
        <div className="text-xs font-mono font-bold text-[#FF8533] uppercase tracking-wider mb-2">
          ACADEMIC PROJECT SPECIFICATION
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
          <div className="space-y-2">
            <div>
              <span className="text-gray-400 block text-[10px] uppercase">Project Title</span>
              <strong className="text-sm font-sans text-white">
                Secure Electronic Mail Gateway with S/MIME and OpenPGP Interoperability
              </strong>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase">Domain</span>
              <strong className="text-white">Network Security and Secure Communication Protocols</strong>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-gray-400 block text-[10px] uppercase">Website Creator & Lead Developer</span>
              <strong className="text-sm font-sans text-[#FF6B00]">Mansi Chalak</strong>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase">Project Purpose</span>
              <p className="text-gray-300 font-sans text-xs leading-relaxed">
                Academic demonstration of secure email processing, cryptographic interoperability, digital signatures,
                asymmetric encryption, and gateway security perimeter models.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Architecture Flow Diagram */}
      <div className="bg-white border-3 border-[#202020] p-6 sm:p-8 shadow-brutal-lg space-y-6">
        <div>
          <span className="text-[10px] font-mono font-bold bg-[#FF6B00] text-white px-2 py-0.5 uppercase tracking-wider">
            SYSTEM ARCHITECTURE
          </span>
          <h2 className="text-2xl font-black uppercase text-[#202020] tracking-tight mt-1">
            End-to-End Gateway Processing Flow
          </h2>
          <p className="text-xs text-gray-600 font-medium mt-1">
            How electronic mail is ingested, assessed, cryptographically verified, transformed across standards, and securely dispatched.
          </p>
        </div>

        {/* Visual Pipeline Nodes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 font-mono text-xs text-center">
          <div className="p-3 bg-[#FFFAF5] border-2 border-[#202020]">
            <div className="font-bold text-[#FF6B00] mb-1">01. CLIENT</div>
            <div className="font-sans font-bold text-xs">Email Client</div>
            <div className="text-[10px] text-gray-500 mt-1">Outlook / Thunderbird / Web</div>
          </div>

          <div className="p-3 bg-[#FFFAF5] border-2 border-[#202020]">
            <div className="font-bold text-[#FF6B00] mb-1">02. INGESTION</div>
            <div className="font-sans font-bold text-xs">Gateway API</div>
            <div className="text-[10px] text-gray-500 mt-1">REST Envelope Submission</div>
          </div>

          <div className="p-3 bg-[#FFF0E5] border-2 border-[#FF6B00]">
            <div className="font-bold text-[#D94B00] mb-1">03. DISCOVERY</div>
            <div className="font-sans font-bold text-xs">Protocol Detection</div>
            <div className="text-[10px] text-gray-600 mt-1">MIME Header Analysis</div>
          </div>

          <div className="p-3 bg-[#FFF0E5] border-2 border-[#FF6B00]">
            <div className="font-bold text-[#D94B00] mb-1">04. VALIDATION</div>
            <div className="font-sans font-bold text-xs">Credential Validation</div>
            <div className="text-[10px] text-gray-600 mt-1">X.509 & PGP Keyring</div>
          </div>

          <div className="p-3 bg-[#202020] text-white border-2 border-[#202020]">
            <div className="font-bold text-[#FF8533] mb-1">05. CRYPTO</div>
            <div className="font-sans font-bold text-xs">Processing Engine</div>
            <div className="text-[10px] text-gray-300 mt-1">Decrypt & Re-encrypt</div>
          </div>

          <div className="p-3 bg-green-50 border-2 border-green-700">
            <div className="font-bold text-green-700 mb-1">06. DELIVERY</div>
            <div className="font-sans font-bold text-xs">Recipient Mailbox</div>
            <div className="text-[10px] text-green-800 mt-1">Target Client Standard</div>
          </div>
        </div>
      </div>

      {/* Educational Modules: Deep Dive Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Topic 1: Why Email Encryption Matters */}
        <div className="brutal-card p-6 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b-2 border-gray-100">
            <Lock className="text-[#FF6B00]" size={18} />
            <h3 className="font-black text-sm uppercase text-[#202020]">
              1. What is Secure Email & Why It Matters
            </h3>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed font-sans">
            Standard SMTP transmission (RFC 5321) was engineered in 1982 without built-in confidentiality. While opportunistic TLS (STARTTLS) protects transmission hops between mail servers, emails sit in plaintext on intermediate relays and storage servers.
          </p>
          <p className="text-xs text-gray-700 leading-relaxed font-sans">
            True end-to-end and gateway-level message protection uses asymmetric cryptography to achieve three core security goals:
          </p>
          <ul className="list-disc list-inside text-xs font-mono space-y-1 text-gray-600">
            <li><strong>Confidentiality:</strong> Encrypted with recipient's public key; readable only by matching private key.</li>
            <li><strong>Integrity:</strong> Cryptographic digests detect any byte-level tampering in transit.</li>
            <li><strong>Non-repudiation:</strong> Digital signatures prove sender identity without dispute.</li>
          </ul>
        </div>

        {/* Topic 2: S/MIME vs OpenPGP */}
        <div className="brutal-card p-6 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b-2 border-gray-100">
            <KeyRound className="text-[#FF6B00]" size={18} />
            <h3 className="font-black text-sm uppercase text-[#202020]">
              2. S/MIME & OpenPGP Standards
            </h3>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed font-sans">
            Two competing cryptographic standards dominate secure electronic mail:
          </p>
          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 bg-blue-50 border border-blue-200">
              <strong className="text-blue-900 block font-sans">S/MIME (RFC 8551 / PKCS#7 CMS):</strong>
              Rooted in hierarchical Public Key Infrastructure (X.509). Certificates are issued by trusted Certificate Authorities (CAs). Favored by enterprise, defense, and government environments.
            </div>
            <div className="p-2.5 bg-orange-50 border border-orange-200">
              <strong className="text-orange-950 block font-sans">OpenPGP (RFC 4880 / 9580):</strong>
              Employs a decentralized Web of Trust (WoT). Users certify one another's public keys. Favored by privacy advocates, open-source developers, and investigative journalists.
            </div>
          </div>
        </div>

        {/* Topic 3: The Interoperability Barrier */}
        <div className="brutal-card p-6 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b-2 border-gray-100">
            <GitCompare className="text-[#FF6B00]" size={18} />
            <h3 className="font-black text-sm uppercase text-[#202020]">
              3. The Interoperability Challenge
            </h3>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed font-sans">
            Because S/MIME and OpenPGP use incompatible data structures (ASN.1 DER objects vs OpenPGP packet streams) and distinct trust paradigms (CA hierarchy vs Web of Trust), an S/MIME user cannot natively send an encrypted message to an OpenPGP user without client-side tooling incompatibility.
          </p>
          <div className="p-3 bg-[#FFF0E5] border border-[#FF6B00] text-xs font-mono text-[#D94B00]">
            <strong>The Gateway Solution:</strong> A secure gateway acts as an authorized cryptographic translation bridge. It verifies inbound sender signatures, momentarily decrypts in memory, and re-encrypts for the recipient's supported format.
          </div>
        </div>

        {/* Topic 4: Threat Model & Boundaries */}
        <div className="brutal-card p-6 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b-2 border-gray-100">
            <AlertTriangle className="text-[#FF6B00]" size={18} />
            <h3 className="font-black text-sm uppercase text-[#202020]">
              4. Gateway Threat Model & Limitations
            </h3>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed font-sans">
            Operating a cross-protocol gateway introduces distinct security architectural trade-offs:
          </p>
          <ul className="list-disc list-inside text-xs font-mono space-y-1.5 text-gray-600">
            <li><strong>Plaintext Boundary:</strong> The gateway has momentary access to decrypted plaintext in memory during re-encryption. Hardening, HSMs, and ephemeral memory buffers are vital.</li>
            <li><strong>Signature Non-Equivalence:</strong> A gateway cannot forge the original sender's private key signature into the new format. It must verify the original signature, attest it in headers, and co-sign with its gateway identity.</li>
            <li><strong>No Silent Fallback:</strong> If keys are missing, the gateway must NEVER fall back to unencrypted plaintext silently.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
