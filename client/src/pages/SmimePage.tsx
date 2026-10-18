import React, { useState, useEffect } from 'react';
import {
  Lock,
  ShieldCheck,
  FileText,
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Key,
  Copy,
  Check,
  FileCheck2,
  RefreshCw,
} from 'lucide-react';
import { ApiService } from '../services/api';
import { CertInspectionResult } from '../types/index';

export const SmimePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'INSPECT' | 'SIGN_VERIFY' | 'ENCRYPT_DECRYPT'>('INSPECT');
  const [certInput, setCertInput] = useState('');
  const [inspection, setInspection] = useState<CertInspectionResult | null>(null);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [inspectError, setInspectError] = useState<string | null>(null);

  // Sign & Verify state
  const [signMessageText, setSignMessageText] = useState('Official Academic S/MIME Authenticated Notice.');
  const [signedOutput, setSignedOutput] = useState<any | null>(null);
  const [signVerifyResult, setSignVerifyResult] = useState<any | null>(null);
  const [signLoading, setSignLoading] = useState(false);

  // Encrypt & Decrypt state
  const [encryptPlaintext, setEncryptPlaintext] = useState('Confidential corporate communication payload.');
  const [encryptedOutput, setEncryptedOutput] = useState<any | null>(null);
  const [decryptedPlaintext, setDecryptedPlaintext] = useState<string | null>(null);
  const [encLoading, setEncLoading] = useState(false);

  // Load sample Alice cert on initial mount
  useEffect(() => {
    loadSampleCert();
  }, []);

  const loadSampleCert = async () => {
    try {
      setInspectLoading(true);
      const sample = await ApiService.getSmimeSampleCredentials();
      if (sample?.alice?.certPem) {
        setCertInput(sample.alice.certPem);
        const res = await ApiService.inspectSmimeCertificate(sample.alice.certPem);
        setInspection(res.data);
      }
    } catch (err: any) {
      console.warn('Could not load sample cert:', err.message);
    } finally {
      setInspectLoading(false);
    }
  };

  const handleInspect = async () => {
    if (!certInput.trim()) {
      setInspectError('Please paste or upload an X.509 certificate');
      return;
    }
    setInspectLoading(true);
    setInspectError(null);
    try {
      const res = await ApiService.inspectSmimeCertificate(certInput);
      setInspection(res.data);
    } catch (err: any) {
      setInspectError(err.message || 'Failed to parse certificate');
      setInspection(null);
    } finally {
      setInspectLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        setCertInput(text);
        ApiService.inspectSmimeCertificate(text)
          .then((res) => setInspection(res.data))
          .catch((err) => setInspectError(err.message));
      };
      reader.readAsText(file);
    }
  };

  const handleSign = async () => {
    setSignLoading(true);
    try {
      const res = await ApiService.signSmime(signMessageText, undefined, undefined, true);
      setSignedOutput(res);
      setSignVerifyResult(null);
    } catch (err: any) {
      alert(`Signing failed: ${err.message}`);
    } finally {
      setSignLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!signedOutput?.signedPem) return;
    setSignLoading(true);
    try {
      const res = await ApiService.verifySmimeSignature(signedOutput.signedPem, signMessageText);
      setSignVerifyResult(res);
    } catch (err: any) {
      alert(`Verification error: ${err.message}`);
    } finally {
      setSignLoading(false);
    }
  };

  const handleEncrypt = async () => {
    setEncLoading(true);
    try {
      const res = await ApiService.encryptSmime(encryptPlaintext, undefined, true);
      setEncryptedOutput(res);
      setDecryptedPlaintext(null);
    } catch (err: any) {
      alert(`Encryption failed: ${err.message}`);
    } finally {
      setEncLoading(false);
    }
  };

  const handleDecrypt = async () => {
    if (!encryptedOutput?.encryptedPem) return;
    setEncLoading(true);
    try {
      const res = await ApiService.decryptSmime(encryptedOutput.encryptedPem, undefined, true);
      setDecryptedPlaintext(res.plaintext);
    } catch (err: any) {
      alert(`Decryption failed: ${err.message}`);
    } finally {
      setEncLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b-2 border-[#202020] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#FF6B00] text-white px-2.5 py-0.5 text-xs font-mono font-bold uppercase mb-2">
            <Lock size={13} /> RFC 8551 Protocol Studio
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase text-[#202020] tracking-tight">
            S/MIME Security Module
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium">
            X.509 Certificate inspection, PKCS#7 / CMS digital signatures, EnvelopedData encryption, and trust-chain validation.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-2 border-[#202020] bg-white p-1">
          <button
            onClick={() => setActiveTab('INSPECT')}
            className={`px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'INSPECT'
                ? 'bg-[#FF6B00] text-white shadow-[2px_2px_0_0_#202020]'
                : 'text-gray-700 hover:text-black'
            }`}
          >
            Cert Inspector
          </button>
          <button
            onClick={() => setActiveTab('SIGN_VERIFY')}
            className={`px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'SIGN_VERIFY'
                ? 'bg-[#202020] text-white shadow-[2px_2px_0_0_#202020]'
                : 'text-gray-700 hover:text-black'
            }`}
          >
            Sign & Verify
          </button>
          <button
            onClick={() => setActiveTab('ENCRYPT_DECRYPT')}
            className={`px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'ENCRYPT_DECRYPT'
                ? 'bg-[#D94B00] text-white shadow-[2px_2px_0_0_#202020]'
                : 'text-gray-700 hover:text-black'
            }`}
          >
            Encrypt & Decrypt
          </button>
        </div>
      </div>

      {/* TAB 1: CERTIFICATE INSPECTOR */}
      {activeTab === 'INSPECT' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Certificate Input */}
          <div className="lg:col-span-6 bg-white border-3 border-[#202020] p-6 shadow-brutal space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-gray-100">
              <h3 className="font-bold text-sm uppercase text-[#202020] flex items-center gap-2">
                <FileText size={16} className="text-[#FF6B00]" /> X.509 Certificate (PEM / CRT)
              </h3>
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold bg-[#FFF0E5] text-[#D94B00] px-2 py-1 border border-[#FF6B00] cursor-pointer hover:bg-[#FF6B00] hover:text-white transition-colors flex items-center gap-1">
                  <Upload size={12} /> Upload File
                  <input
                    type="file"
                    accept=".pem,.crt,.cer,.der,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={loadSampleCert}
                  className="text-xs font-bold text-gray-600 hover:text-black underline"
                >
                  Load Sample
                </button>
              </div>
            </div>

            <textarea
              rows={12}
              value={certInput}
              onChange={(e) => setCertInput(e.target.value)}
              placeholder="Paste PEM certificate (-----BEGIN CERTIFICATE-----...)"
              className="w-full p-3 text-[11px] font-mono border-2 border-[#202020] focus:outline-none focus:border-[#FF6B00]"
            />

            {inspectError && (
              <p className="text-xs font-mono text-red-600 flex items-center gap-1">
                <AlertTriangle size={13} /> {inspectError}
              </p>
            )}

            <button
              onClick={handleInspect}
              disabled={inspectLoading}
              className="brutal-btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck size={14} /> Parse & Validate Certificate
            </button>
          </div>

          {/* Certificate Inspection Details */}
          <div className="lg:col-span-6 bg-white border-3 border-[#202020] p-6 shadow-brutal-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-gray-100">
              <h3 className="font-black text-sm uppercase text-[#202020]">
                Cryptographic Parsing Report
              </h3>
              {inspection && (
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 border ${
                    inspection.isDateValid
                      ? 'bg-green-100 text-green-900 border-green-600'
                      : 'bg-red-100 text-red-900 border-red-600'
                  }`}
                >
                  VALIDITY: {inspection.isDateValid ? 'ACTIVE' : 'EXPIRED'}
                </span>
              )}
            </div>

            {inspection ? (
              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 bg-[#FFFAF5] border border-[#FFE0CC] space-y-1">
                  <div><strong>Subject:</strong> <span className="font-sans font-bold text-[#202020]">{inspection.subject}</span></div>
                  <div><strong>Issuer:</strong> <span className="font-sans text-gray-700">{inspection.issuer}</span></div>
                  <div><strong>Serial Number:</strong> {inspection.serialNumber}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-gray-50 border border-gray-200">
                    <span className="text-[10px] text-gray-500 block">VALID FROM</span>
                    <span className="text-[11px] font-bold">{new Date(inspection.validFrom).toLocaleDateString()}</span>
                  </div>
                  <div className="p-2.5 bg-gray-50 border border-gray-200">
                    <span className="text-[10px] text-gray-500 block">EXPIRES AT</span>
                    <span className="text-[11px] font-bold">{new Date(inspection.validTo).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-gray-50 border border-gray-200">
                  <span className="text-[10px] text-gray-500 block">SHA-256 FINGERPRINT</span>
                  <span className="text-[11px] break-all font-bold text-[#FF6B00]">
                    {inspection.fingerprint256}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-gray-50 border border-gray-200">
                    <span className="text-[10px] text-gray-500 block">ALGORITHM</span>
                    <span className="text-[11px] font-bold uppercase">{inspection.keyAlgorithm} ({inspection.keySize || '2048'}-bit)</span>
                  </div>
                  <div className="p-2.5 bg-gray-50 border border-gray-200">
                    <span className="text-[10px] text-gray-500 block">KEY USAGES</span>
                    <span className="text-[10px] font-bold text-gray-700">
                      {inspection.keyUsage?.join(', ') || 'digitalSignature'}
                    </span>
                  </div>
                </div>

                {/* Honest Trust Chain Notice */}
                <div className="p-3 bg-[#FFF0E5] border border-[#FF6B00] text-[11px] space-y-1">
                  <div className="font-bold text-[#D94B00] flex items-center gap-1.5">
                    <AlertTriangle size={13} /> Trust Chain Assessment:
                  </div>
                  <p className="text-gray-700 font-sans leading-relaxed">
                    {inspection.trustNotice}
                  </p>
                  <p className="text-[10px] text-gray-500 italic">
                    Standard cryptographic distinction: Certificate syntax parses correctly; trust verification requires pre-installed Root CA in OS store.
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-gray-500 font-mono">
                No certificate parsed yet. Paste PEM or click "Load Sample" to begin.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SIGN & VERIFY WORKBENCH */}
      {activeTab === 'SIGN_VERIFY' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 bg-white border-3 border-[#202020] p-6 shadow-brutal space-y-4">
            <h3 className="font-black text-sm uppercase text-[#202020] flex items-center gap-2 pb-2 border-b-2 border-gray-100">
              <FileCheck2 size={16} className="text-[#FF6B00]" /> S/MIME PKCS#7 Digital Signing
            </h3>
            <p className="text-xs text-gray-600">
              Signs data using Alice RSA private key and packages the result into a standard PKCS#7 / CMS SignedData structure with SHA-256 digest.
            </p>

            <div>
              <label className="block text-xs font-mono font-bold text-[#202020] uppercase mb-1">
                Content to Digitally Sign:
              </label>
              <textarea
                rows={4}
                value={signMessageText}
                onChange={(e) => setSignMessageText(e.target.value)}
                className="w-full p-2.5 text-xs font-mono border-2 border-[#202020] focus:outline-none focus:border-[#FF6B00]"
              />
            </div>

            <button
              onClick={handleSign}
              disabled={signLoading}
              className="brutal-btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Sign Content with RSA-2048 Private Key
            </button>

            {signedOutput && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <span className="text-[10px] font-mono font-bold text-green-700 bg-green-50 px-2 py-0.5 border border-green-300">
                  SIGNED PKCS#7 STRUCTURE GENERATED
                </span>
                <pre className="p-2.5 bg-[#111] text-green-400 font-mono text-[10px] overflow-x-auto max-h-40 border border-gray-800">
                  {signedOutput.signedPem}
                </pre>
              </div>
            )}
          </div>

          <div className="lg:col-span-6 bg-white border-3 border-[#202020] p-6 shadow-brutal-lg space-y-4">
            <h3 className="font-black text-sm uppercase text-[#202020] pb-2 border-b-2 border-gray-100">
              Signature Verification Workbench
            </h3>
            <p className="text-xs text-gray-600">
              Parses the CMS SignedData envelope, extracts the signer's certificate, recomputes the SHA-256 message digest, and verifies mathematical authenticity.
            </p>

            <button
              onClick={handleVerify}
              disabled={!signedOutput || signLoading}
              className="brutal-btn-secondary w-full py-2.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              Verify Generated S/MIME Signature
            </button>

            {signVerifyResult && (
              <div className="p-4 bg-[#FFFAF5] border-2 border-[#202020] space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <span className="font-bold">VERIFICATION RESULT:</span>
                  <span
                    className={`font-black px-2 py-0.5 text-[11px] ${
                      signVerifyResult.verified
                        ? 'bg-green-100 text-green-900 border border-green-600'
                        : 'bg-red-100 text-red-900 border border-red-600'
                    }`}
                  >
                    {signVerifyResult.verified ? 'MATHEMATICALLY VALID' : 'FAILED'}
                  </span>
                </div>
                <div><strong>Signer Subject:</strong> {signVerifyResult.signerCertSubject}</div>
                <div><strong>Issuer:</strong> {signVerifyResult.signerCertIssuer}</div>
                <div><strong>Serial:</strong> {signVerifyResult.serialNumber}</div>
                <div><strong>Validity Period:</strong> {signVerifyResult.isDateValid ? 'ACTIVE' : 'EXPIRED'}</div>
                <div className="p-2 bg-white border border-gray-200 text-[11px] text-gray-600 mt-2">
                  {signVerifyResult.trustNote}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ENCRYPT & DECRYPT WORKBENCH */}
      {activeTab === 'ENCRYPT_DECRYPT' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 bg-white border-3 border-[#202020] p-6 shadow-brutal space-y-4">
            <h3 className="font-black text-sm uppercase text-[#202020] flex items-center gap-2 pb-2 border-b-2 border-gray-100">
              <Lock size={16} className="text-[#D94B00]" /> PKCS#7 EnvelopedData Encryption
            </h3>
            <p className="text-xs text-gray-600">
              Encapsulates plaintext into an S/MIME EnvelopedData container using David Vance recipient X.509 certificate.
            </p>

            <div>
              <label className="block text-xs font-mono font-bold text-[#202020] uppercase mb-1">
                Plaintext Body:
              </label>
              <textarea
                rows={4}
                value={encryptPlaintext}
                onChange={(e) => setEncryptPlaintext(e.target.value)}
                className="w-full p-2.5 text-xs font-mono border-2 border-[#202020] focus:outline-none focus:border-[#FF6B00]"
              />
            </div>

            <button
              onClick={handleEncrypt}
              disabled={encLoading}
              className="brutal-btn-primary w-full py-2.5 text-xs cursor-pointer"
            >
              Encrypt for Recipient Certificate (AES-256-CBC)
            </button>

            {encryptedOutput && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <span className="text-[10px] font-mono font-bold text-[#D94B00] bg-[#FFF0E5] px-2 py-0.5 border border-[#FF6B00]">
                  ENCRYPTED PKCS#7 ENVELOPE
                </span>
                <pre className="p-2.5 bg-[#111] text-green-400 font-mono text-[10px] overflow-x-auto max-h-40 border border-gray-800">
                  {encryptedOutput.encryptedPem}
                </pre>
              </div>
            )}
          </div>

          <div className="lg:col-span-6 bg-white border-3 border-[#202020] p-6 shadow-brutal-lg space-y-4">
            <h3 className="font-black text-sm uppercase text-[#202020] pb-2 border-b-2 border-gray-100">
              Recipient Decryption Workbench
            </h3>
            <p className="text-xs text-gray-600">
              Unwraps the PKCS#7 envelope using David Vance RSA private key to recover the authenticated plaintext.
            </p>

            <button
              onClick={handleDecrypt}
              disabled={!encryptedOutput || encLoading}
              className="brutal-btn-secondary w-full py-2.5 text-xs cursor-pointer disabled:opacity-50"
            >
              Decrypt with Matching Private Key
            </button>

            {decryptedPlaintext && (
              <div className="p-4 bg-green-50 border-2 border-green-600 space-y-2">
                <span className="text-xs font-bold text-green-900 flex items-center gap-1.5 font-mono">
                  <CheckCircle2 size={14} /> DECRYPTED PLAINTEXT RECOVERED:
                </span>
                <div className="p-3 bg-white border border-green-300 font-mono text-xs text-[#202020]">
                  {decryptedPlaintext}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
