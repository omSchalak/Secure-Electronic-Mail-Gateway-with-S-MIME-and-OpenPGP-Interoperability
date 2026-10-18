import React, { useState } from 'react';
import {
  GitCompare,
  ArrowRight,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  KeyRound,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RotateCw,
  Terminal,
  FileText,
  Copy,
  Check,
  Info,
} from 'lucide-react';
import { ApiService } from '../services/api';
import { GatewayInteropResult } from '../types/index';

export const InteropLabPage: React.FC = () => {
  const [activeScenarioId, setActiveScenarioId] = useState('scenario-3');
  const [customMessage, setCustomMessage] = useState('CONFIDENTIAL: Strategic Interoperability Evaluation Payload');
  const [result, setResult] = useState<GatewayInteropResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const scenarios = [
    {
      id: 'scenario-1',
      number: '01',
      title: 'S/MIME Sender → S/MIME Recipient',
      type: 'DIRECT PASS-THROUGH',
      sender: 'alice@smime.local (X.509)',
      recipient: 'david@smime.local (X.509)',
      description: 'Transparent gateway routing preserving end-to-end encryption without intermediate decryption.',
      color: 'border-blue-600',
    },
    {
      id: 'scenario-2',
      number: '02',
      title: 'OpenPGP Sender → OpenPGP Recipient',
      type: 'DIRECT PASS-THROUGH',
      sender: 'bob@pgp.local (OpenPGP)',
      recipient: 'charlie@pgp.local (OpenPGP)',
      description: 'Direct OpenPGP packet stream pass-through. Cryptographic payload remains unaccessed by gateway.',
      color: 'border-amber-600',
    },
    {
      id: 'scenario-3',
      number: '03',
      title: 'S/MIME Sender → OpenPGP Recipient',
      type: 'CROSS-PROTOCOL TRANSFORM',
      sender: 'alice@smime.local (S/MIME)',
      recipient: 'bob@pgp.local (OpenPGP)',
      description: 'Controlled Decrypt-and-Re-encrypt pipeline. S/MIME signature verified before OpenPGP re-encapsulation.',
      color: 'border-[#FF6B00]',
      highlight: true,
    },
    {
      id: 'scenario-4',
      number: '04',
      title: 'OpenPGP Sender → S/MIME Recipient',
      type: 'CROSS-PROTOCOL TRANSFORM',
      sender: 'bob@pgp.local (OpenPGP)',
      recipient: 'david@smime.local (S/MIME)',
      description: 'Controlled Decrypt-and-Re-encrypt pipeline. Bob OpenPGP signature verified; S/MIME PKCS#7 envelope generated.',
      color: 'border-[#FF6B00]',
      highlight: true,
    },
    {
      id: 'scenario-5',
      number: '05',
      title: 'Missing Recipient Key/Certificate',
      type: 'POLICY HALT & MITIGATION',
      sender: 'alice@smime.local (S/MIME)',
      recipient: 'external-target@unregistered.org',
      description: 'Gateway enforces strict NO_PLAINTEXT_FALLBACK security rule. Halts delivery with security non-delivery alert.',
      color: 'border-red-600',
    },
    {
      id: 'scenario-6',
      number: '06',
      title: 'Tampered Signature / Corrupted Message',
      type: 'TAMPER DETECTION ALERT',
      sender: 'attacker@spoofed.org (Tampered)',
      recipient: 'bob@pgp.local (OpenPGP)',
      description: 'Digest verification failure detected at ingestion. Quarantines compromised payload prior to plaintext boundary.',
      color: 'border-red-600',
    },
  ];

  const handleRunSimulation = async (idToRun?: string) => {
    const targetId = idToRun || activeScenarioId;
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.simulateGatewayScenario(targetId, customMessage);
      setResult(res.data);
    } catch (err: any) {
      setError(err.message || 'Simulation execution failed');
    } finally {
      setLoading(false);
    }
  };

  const activeScenario = scenarios.find((s) => s.id === activeScenarioId) || scenarios[2];

  const handleCopyPayload = () => {
    if (result?.finalOutput.payloadPreview) {
      navigator.clipboard.writeText(result.finalOutput.payloadPreview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b-2 border-[#202020] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#FF6B00] text-white px-2.5 py-0.5 text-xs font-mono font-bold uppercase mb-2">
            <GitCompare size={13} /> Core Research Module
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase text-[#202020] tracking-tight">
            Protocol Interoperability Lab
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium">
            Step-by-step cryptographic assessment of S/MIME and OpenPGP interoperability boundaries and transformation pipelines.
          </p>
        </div>

        <button
          onClick={() => handleRunSimulation()}
          disabled={loading}
          className="brutal-btn-primary px-6 py-3 text-xs sm:text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Play size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Executing Real Cryptography...' : 'Run Selected Scenario'}
        </button>
      </div>

      {/* Crucial Security Principle Callout */}
      <div className="bg-[#202020] text-white border-3 border-[#FF6B00] p-5 shadow-brutal">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#FF6B00] text-white shrink-0 mt-0.5">
            <ShieldAlert size={20} />
          </div>
          <div className="space-y-1 text-xs">
            <h4 className="font-extrabold uppercase text-[#FF8533] tracking-wide text-sm">
              Critical Cryptographic Interoperability Principle
            </h4>
            <p className="text-gray-300 leading-relaxed font-sans">
              <strong>S/MIME and OpenPGP use fundamentally incompatible cryptographic encapsulation schemes.</strong> S/MIME relies on ASN.1 BER/DER encoded PKCS#7 / CMS enveloped data anchored to hierarchical X.509 CAs. OpenPGP uses OpenPGP packet streams (RFC 4880/9580) with decentralized Web-of-Trust keyrings.
            </p>
            <p className="text-gray-400 font-mono text-[11px] leading-relaxed pt-1">
              Therefore, <strong>ciphertext cannot simply be re-encoded on the wire</strong>. Interoperability requires an authenticated gateway to operate as a <em>Controlled Decrypt-and-Re-encrypt Boundary</em>: verifying incoming signatures, accessing plaintext strictly within ephemeral RAM, re-encrypting with destination keys, and attesting origin through gateway provenance headers.
            </p>
          </div>
        </div>
      </div>

      {/* Scenario Selector Carousel / Cards */}
      <div>
        <div className="text-xs font-mono font-bold text-gray-500 uppercase mb-3 flex items-center justify-between">
          <span>Select Interoperability Scenario (6 Cases)</span>
          <span className="text-[#FF6B00]">Active: {activeScenario.title}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {scenarios.map((sc) => {
            const isSelected = sc.id === activeScenarioId;
            return (
              <div
                key={sc.id}
                onClick={() => {
                  setActiveScenarioId(sc.id);
                  handleRunSimulation(sc.id);
                }}
                className={`cursor-pointer p-4 border-2 transition-all relative ${
                  isSelected
                    ? 'bg-[#FFF0E5] border-[#FF6B00] shadow-brutal-orange -translate-y-1'
                    : 'bg-white border-[#202020] hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 border ${
                      isSelected
                        ? 'bg-[#FF6B00] text-white border-[#202020]'
                        : 'bg-gray-100 text-gray-700 border-gray-300'
                    }`}
                  >
                    {sc.type}
                  </span>
                  <span className="text-xs font-mono font-bold text-gray-400">
                    SCENARIO {sc.number}
                  </span>
                </div>

                <h3 className="font-extrabold text-xs text-[#202020] mb-1">
                  {sc.title}
                </h3>

                <p className="text-[11px] text-gray-600 line-clamp-2 leading-tight mb-2">
                  {sc.description}
                </p>

                <div className="text-[10px] font-mono text-gray-500 pt-2 border-t border-gray-100 truncate">
                  {sc.sender} → {sc.recipient}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Custom Message Payload Input */}
      <div className="bg-white border-2 border-[#202020] p-4 flex flex-col sm:flex-row items-center gap-3">
        <label className="text-xs font-mono font-bold text-[#202020] uppercase shrink-0">
          Simulation Payload:
        </label>
        <input
          type="text"
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          placeholder="Enter message to encrypt and trace through gateway..."
          className="flex-1 p-2 text-xs font-mono border border-gray-300 focus:outline-none focus:border-[#FF6B00]"
        />
        <button
          onClick={() => handleRunSimulation()}
          disabled={loading}
          className="brutal-btn-primary px-4 py-2 text-xs shrink-0"
        >
          Re-Run Simulation
        </button>
      </div>

      {/* Active Scenario Execution Workbench */}
      {loading ? (
        <div className="p-16 bg-white border-3 border-[#202020] text-center space-y-4 shadow-brutal">
          <div className="w-12 h-12 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="font-bold text-sm uppercase text-[#202020]">
            Executing Real Asymmetric Cryptographic Operations...
          </h3>
          <p className="text-xs font-mono text-gray-500 max-w-md mx-auto">
            Generating PKCS#7 / CMS digital signatures, computing SHA-256 digests, negotiating recipient keys, and evaluating gateway trust boundaries.
          </p>
        </div>
      ) : result ? (
        <div className="space-y-8">
          {/* Step 1: Gateway Decision Header Panel */}
          <div className="bg-white border-3 border-[#202020] p-6 shadow-brutal-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b-2 border-gray-100">
              <div>
                <span className="text-[10px] font-mono font-bold bg-[#202020] text-white px-2 py-0.5 uppercase">
                  SIMULATION AUDIT LOG: {result.auditLogId}
                </span>
                <h2 className="text-2xl font-black uppercase text-[#202020] mt-1">
                  {result.scenarioName}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 text-xs font-mono font-black uppercase border-2 ${
                    result.status === 'SUCCESS'
                      ? 'bg-green-100 text-green-900 border-green-600'
                      : 'bg-red-100 text-red-900 border-red-600'
                  }`}
                >
                  GATEWAY DECISION: {result.decision}
                </span>
              </div>
            </div>

            {/* Protocol Conversion Visual Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-xs font-mono">
              <div className="p-4 bg-[#FFFAF5] border border-[#FFE0CC]">
                <div className="text-gray-500 text-[10px]">INBOUND SENDER PROTECTION</div>
                <div className="font-bold text-[#FF6B00] text-sm mt-1">{result.senderProtocol} Standard</div>
                <div className="text-[11px] text-gray-600 mt-1">
                  Format: {result.incomingProtection.format}
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  Signed: {result.incomingProtection.signed ? 'YES' : 'NO'} | Encrypted: {result.incomingProtection.encrypted ? 'YES' : 'NO'}
                </div>
              </div>

              <div className="p-4 bg-[#202020] text-white border border-[#202020]">
                <div className="text-[#FF8533] text-[10px]">GATEWAY BOUNDARY ASSESSMENT</div>
                <div className="font-bold text-white text-sm mt-1">{result.decision}</div>
                <div className="text-[11px] text-gray-300 mt-1">
                  Signature Verification: {result.verificationOutcome.signatureValid ? 'VALID (PASSED)' : 'REJECTED/FAILED'}
                </div>
                <div className="text-[10px] text-gray-400 mt-1">
                  Trust Anchor: {result.verificationOutcome.trustChainEstablished ? 'Anchored' : 'Unanchored (Demo)'}
                </div>
              </div>

              <div className="p-4 bg-[#FFFAF5] border border-[#FFE0CC]">
                <div className="text-gray-500 text-[10px]">OUTBOUND RECIPIENT DISPATCH</div>
                <div className="font-bold text-[#D94B00] text-sm mt-1">{result.recipientProtocol} Standard</div>
                <div className="text-[11px] text-gray-600 mt-1">
                  Delivered Format: {result.finalOutput.deliveredFormat}
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  Recipient Notified: {result.finalOutput.recipientNotified ? 'YES' : 'NO (HALTED)'}
                </div>
              </div>
            </div>

            {/* Transformation Boundary Notice (for Cross-Protocol) */}
            {result.transformationDetails && (
              <div className="mt-6 p-4 bg-[#FFF0E5] border-2 border-[#FF6B00] text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#D94B00]">
                  <AlertTriangle size={16} /> Controlled Decrypt-and-Re-encrypt Disclosure:
                </div>
                <p className="text-gray-700 leading-relaxed font-sans">
                  {result.transformationDetails.plaintextBoundaryNotice}
                </p>
                <div className="font-mono text-[11px] text-[#202020] pt-1">
                  <strong>Gateway Re-signing Identity:</strong> {result.transformationDetails.gatewayIdentity}
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Step-by-Step Technical Execution Trace */}
          <div className="bg-white border-3 border-[#202020] p-6 shadow-brutal">
            <h3 className="font-black text-lg uppercase text-[#202020] mb-4 pb-2 border-b-2 border-gray-100">
              Cryptographic Execution Trace (Timeline)
            </h3>

            <div className="space-y-4">
              {result.steps.map((st) => (
                <div
                  key={st.stepNumber}
                  className="flex items-start gap-4 p-3 bg-gray-50 border border-gray-200 font-mono text-xs"
                >
                  <div
                    className={`w-7 h-7 shrink-0 flex items-center justify-center font-bold text-white ${
                      st.status === 'COMPLETED'
                        ? 'bg-green-700'
                        : st.status === 'WARNING'
                        ? 'bg-[#FF6B00]'
                        : 'bg-red-600'
                    }`}
                  >
                    0{st.stepNumber}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#202020] font-sans text-sm">{st.name}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 ${
                          st.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : st.status === 'WARNING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {st.status}
                      </span>
                    </div>
                    <p className="text-gray-700 font-sans mt-0.5">{st.description}</p>
                    <div className="text-[11px] text-gray-500 mt-1 bg-white p-1.5 border border-gray-200">
                      {st.technicalDetails}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 3: Raw Ciphertext Payload Preview */}
          <div className="bg-[#202020] text-white border-3 border-[#202020] p-6 shadow-brutal-xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-700 mb-3">
              <span className="text-xs font-mono font-bold text-[#FF8533] uppercase">
                Cryptographic Output Payload (Delivered Wire Format)
              </span>
              <button
                onClick={handleCopyPayload}
                className="text-xs text-white hover:text-[#FF8533] flex items-center gap-1 font-mono"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Copied' : 'Copy Payload'}
              </button>
            </div>

            <pre className="p-3 bg-[#111] text-[11px] font-mono text-green-400 overflow-x-auto border border-gray-800 leading-relaxed">
              {result.finalOutput.payloadPreview}
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  );
};
