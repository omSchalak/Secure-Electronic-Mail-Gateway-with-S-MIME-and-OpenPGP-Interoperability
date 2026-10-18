import React, { useState } from 'react';
import {
  Send,
  Lock,
  FileCheck2,
  Paperclip,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Shield,
  Layers,
  Copy,
  Check,
} from 'lucide-react';
import { ApiService } from '../services/api';

export const ComposerPage: React.FC = () => {
  const [sender, setSender] = useState('alice@smime.local');
  const [recipient, setRecipient] = useState('bob@pgp.local');
  const [subject, setSubject] = useState('CONFIDENTIAL: Quarterly Cryptographic Interoperability Report');
  const [body, setBody] = useState(
    'Hello Bob,\n\nPlease find the encrypted assessment attached. Our gateway verifies that S/MIME X.509 signatures are verified before controlled re-encryption into OpenPGP packets for your destination mailbox.\n\nRegards,\nAlice'
  );
  const [protocol, setProtocol] = useState<'SMIME' | 'OPENPGP' | 'AUTO'>('AUTO');
  const [encrypt, setEncrypt] = useState(true);
  const [sign, setSign] = useState(true);
  const [attachmentName, setAttachmentName] = useState<string | null>('interop-spec-v1.pdf');

  // Form states
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<string>('');
  const [dispatchError, setDispatchError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  // Quick fill samples
  const handleQuickFill = (preset: 'smime-to-pgp' | 'pgp-to-smime' | 'smime-direct') => {
    setDispatchError(null);
    if (preset === 'smime-to-pgp') {
      setSender('alice@smime.local');
      setRecipient('bob@pgp.local');
      setProtocol('AUTO');
      setSubject('Cross-Protocol S/MIME to OpenPGP Dispatch');
      setEncrypt(true);
      setSign(true);
    } else if (preset === 'pgp-to-smime') {
      setSender('bob@pgp.local');
      setRecipient('david@smime.local');
      setProtocol('AUTO');
      setSubject('Cross-Protocol OpenPGP to S/MIME Dispatch');
      setEncrypt(true);
      setSign(true);
    } else {
      setSender('alice@smime.local');
      setRecipient('david@smime.local');
      setProtocol('SMIME');
      setSubject('Direct S/MIME Enterprise Communication');
      setEncrypt(true);
      setSign(true);
    }
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!sender.trim()) errs.sender = 'Sender email address is required';
    else if (!emailRegex.test(sender)) errs.sender = 'Invalid sender email format';

    if (!recipient.trim()) errs.recipient = 'Recipient email address is required';
    else if (!emailRegex.test(recipient)) errs.recipient = 'Invalid recipient email format';

    if (!subject.trim()) errs.subject = 'Subject cannot be empty';
    if (!body.trim()) errs.body = 'Message body cannot be empty';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    setDispatchError(null);
    if (validate()) {
      setShowReviewModal(true);
    }
  };

  const handleExecuteDispatch = async () => {
    setIsProcessing(true);
    setDispatchError(null);
    setProcessStep('1/3: Inspecting cryptographic prerequisites & local directory...');

    try {
      await new Promise((r) => setTimeout(r, 400));
      setProcessStep('2/3: Applying cryptographic transformation & digital signature...');

      const res = await ApiService.processComposerMessage({
        sender,
        recipient,
        subject,
        body,
        protocol,
        encrypt,
        sign,
        attachmentName: attachmentName || undefined,
      });

      await new Promise((r) => setTimeout(r, 300));
      setProcessStep('3/3: Finalizing gateway audit event...');

      setResult(res);
      setShowReviewModal(false);
    } catch (err: any) {
      setDispatchError(err.message || 'Cryptographic processing failed');
    } finally {
      setIsProcessing(false);
      setProcessStep('');
    }
  };

  const handleCopyPayload = () => {
    if (result?.payloadPreview) {
      navigator.clipboard.writeText(result.payloadPreview);
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
            <Send size={13} /> Interactive Email Studio
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase text-[#202020] tracking-tight">
            Secure Email Composer
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium">
            Compose and cryptographically protect electronic mail using S/MIME, OpenPGP, or automatic gateway recommendation.
          </p>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-gray-500">Demo Presets:</span>
          <button
            onClick={() => handleQuickFill('smime-to-pgp')}
            className="text-xs font-bold px-2.5 py-1 bg-[#FFF0E5] text-[#D94B00] border border-[#FF6B00] hover:bg-[#FF6B00] hover:text-white transition-colors"
          >
            S/MIME → PGP
          </button>
          <button
            onClick={() => handleQuickFill('pgp-to-smime')}
            className="text-xs font-bold px-2.5 py-1 bg-[#FFF0E5] text-[#D94B00] border border-[#FF6B00] hover:bg-[#FF6B00] hover:text-white transition-colors"
          >
            PGP → S/MIME
          </button>
          <button
            onClick={() => handleQuickFill('smime-direct')}
            className="text-xs font-bold px-2.5 py-1 bg-gray-100 text-[#202020] border border-[#202020] hover:bg-[#202020] hover:text-white transition-colors"
          >
            S/MIME Direct
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Composition Form */}
        <div className="lg:col-span-8 bg-white border-3 border-[#202020] p-6 sm:p-8 shadow-brutal-lg">
          <form onSubmit={handleReview} className="space-y-6">
            {/* Sender & Recipient Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-[#202020] uppercase mb-1.5">
                  Sender Email (RFC 5322) *
                </label>
                <input
                  type="email"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  placeholder="alice@smime.local"
                  className={`w-full p-2.5 text-xs font-mono border-2 ${
                    errors.sender ? 'border-red-600 bg-red-50' : 'border-[#202020] bg-white'
                  } focus:outline-none focus:border-[#FF6B00]`}
                />
                {errors.sender && (
                  <p className="text-[11px] text-red-600 font-mono mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.sender}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#202020] uppercase mb-1.5">
                  Recipient Email (RFC 5322) *
                </label>
                <input
                  type="email"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="bob@pgp.local"
                  className={`w-full p-2.5 text-xs font-mono border-2 ${
                    errors.recipient ? 'border-red-600 bg-red-50' : 'border-[#202020] bg-white'
                  } focus:outline-none focus:border-[#FF6B00]`}
                />
                {errors.recipient && (
                  <p className="text-[11px] text-red-600 font-mono mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.recipient}
                  </p>
                )}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#202020] uppercase mb-1.5">
                Email Subject *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Confidential subject..."
                className={`w-full p-2.5 text-xs font-bold border-2 ${
                  errors.subject ? 'border-red-600 bg-red-50' : 'border-[#202020] bg-white'
                } focus:outline-none focus:border-[#FF6B00]`}
              />
              {errors.subject && (
                <p className="text-[11px] text-red-600 font-mono mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.subject}
                </p>
              )}
            </div>

            {/* Protocol Selector Radio Pills */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#202020] uppercase mb-2">
                Security Protocol Selection
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'AUTO', label: 'Automatic Recommendation', sub: 'Gateway selects matching protocol' },
                  { id: 'SMIME', label: 'S/MIME (X.509 PKI)', sub: 'RFC 8551 PKCS#7 envelope' },
                  { id: 'OPENPGP', label: 'OpenPGP (RFC 4880)', sub: 'Web of Trust & PGP Armor' },
                ].map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setProtocol(opt.id as any)}
                    className={`cursor-pointer p-3 border-2 transition-all ${
                      protocol === opt.id
                        ? 'bg-[#FFF0E5] border-[#FF6B00] shadow-[2px_2px_0_0_#FF6B00]'
                        : 'bg-white border-[#202020] hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={`w-3 h-3 rounded-full border-2 ${
                          protocol === opt.id ? 'border-[#FF6B00] bg-[#FF6B00]' : 'border-gray-400 bg-white'
                        }`}
                      />
                      <span className="text-xs font-bold text-[#202020]">{opt.label}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-mono ml-5">{opt.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Cryptographic Flags (Toggles) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#FFFAF5] border-2 border-[#FFE0CC]">
              {/* Encryption Toggle */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={encrypt}
                  onChange={(e) => setEncrypt(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[#FF6B00]"
                />
                <div>
                  <div className="text-xs font-bold text-[#202020] flex items-center gap-1.5">
                    <Lock size={14} className="text-[#FF6B00]" /> Enable Message Encryption
                  </div>
                  <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
                    Protects body confidentiality using recipient public key / certificate.
                  </p>
                </div>
              </label>

              {/* Digital Signature Toggle */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sign}
                  onChange={(e) => setSign(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[#FF6B00]"
                />
                <div>
                  <div className="text-xs font-bold text-[#202020] flex items-center gap-1.5">
                    <FileCheck2 size={14} className="text-green-700" /> Apply Digital Signature
                  </div>
                  <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
                    Provides sender non-repudiation and anti-tamper message integrity digest.
                  </p>
                </div>
              </label>
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#202020] uppercase mb-1.5">
                Message Body *
              </label>
              <textarea
                rows={6}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Type confidential communication..."
                className={`w-full p-3 text-xs font-mono border-2 ${
                  errors.body ? 'border-red-600 bg-red-50' : 'border-[#202020] bg-white'
                } focus:outline-none focus:border-[#FF6B00]`}
              />
              {errors.body && (
                <p className="text-[11px] text-red-600 font-mono mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.body}
                </p>
              )}
            </div>

            {/* Attachment Simulator */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#202020] uppercase mb-1.5">
                Simulated File Attachment
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-2 bg-gray-50 border-2 border-dashed border-[#202020] text-xs font-mono flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-700">
                    <Paperclip size={14} className="text-[#FF6B00]" />
                    {attachmentName ? attachmentName : 'No file attached'}
                  </span>
                  {attachmentName && (
                    <button
                      type="button"
                      onClick={() => setAttachmentName(null)}
                      className="text-red-600 hover:text-red-800 text-xs font-bold"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {!attachmentName && (
                  <button
                    type="button"
                    onClick={() => setAttachmentName('academic-analysis.pdf')}
                    className="brutal-btn-secondary px-3 py-2 text-xs"
                  >
                    Attach Sample PDF
                  </button>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setSender('');
                  setRecipient('');
                  setSubject('');
                  setBody('');
                  setResult(null);
                }}
                className="text-xs font-mono font-bold text-gray-500 hover:text-red-600 flex items-center gap-1"
              >
                <Trash2 size={13} /> Clear Form
              </button>

              <button
                type="submit"
                className="brutal-btn-primary px-6 py-3 text-sm flex items-center gap-2 cursor-pointer"
              >
                <Send size={15} /> Review & Cryptographically Process →
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar: Technical Protocol Explanation & Result Preview */}
        <div className="lg:col-span-4 space-y-6">
          {/* Explanation Box */}
          <div className="bg-[#FFFFFF] border-3 border-[#202020] p-6 shadow-brutal">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-gray-100 mb-3">
              <HelpCircle size={18} className="text-[#FF6B00]" />
              <h3 className="font-bold text-sm uppercase text-[#202020]">
                Protocol Mechanics
              </h3>
            </div>

            <div className="text-xs text-gray-700 space-y-3 leading-relaxed">
              {protocol === 'AUTO' && (
                <>
                  <p>
                    <strong>Automatic Protocol Recommendation:</strong> The gateway queries its local directory and recipient domain to select the optimal cryptographic scheme.
                  </p>
                  <p className="text-[11px] font-mono text-gray-500 bg-[#FFFAF5] p-2 border border-[#FFE0CC]">
                    If the sender uses S/MIME while the recipient uses OpenPGP, the gateway will engage its <strong>Controlled Decrypt-and-Re-encrypt pipeline</strong>.
                  </p>
                </>
              )}
              {protocol === 'SMIME' && (
                <>
                  <p>
                    <strong>S/MIME (RFC 8551):</strong> Encapsulates data into a PKCS#7 / Cryptographic Message Syntax (CMS) binary structure. Requires X.509 v3 certificates.
                  </p>
                  <ul className="list-disc list-inside text-[11px] space-y-1 font-mono text-gray-600">
                    <li>Signing: RSA-SHA256 digest</li>
                    <li>Encryption: AES-256-CBC EnvelopedData</li>
                    <li>Identity: Subject Alternative Name (SAN)</li>
                  </ul>
                </>
              )}
              {protocol === 'OPENPGP' && (
                <>
                  <p>
                    <strong>OpenPGP (RFC 4880):</strong> Employs OpenPGP packet streams wrapped in ASCII Armor blocks. Works with decentralized Web of Trust keyrings.
                  </p>
                  <ul className="list-disc list-inside text-[11px] space-y-1 font-mono text-gray-600">
                    <li>Signing: Ed25519 / RSA detached</li>
                    <li>Encryption: Curve25519 session key</li>
                    <li>Identity: User ID packet binding</li>
                  </ul>
                </>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] font-mono text-[#D94B00]">
              Notice: Plaintext is processed locally in demonstration memory. No external SMTP delivery.
            </div>
          </div>

          {/* Result Inspector Panel */}
          {result && (
            <div className="bg-[#202020] text-white border-3 border-[#FF6B00] p-6 shadow-brutal-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-700">
                <span className="text-xs font-mono font-bold text-green-400 flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Processed Successfully
                </span>
                <span className="text-[10px] font-mono bg-[#FF6B00] text-white px-1.5 py-0.5">
                  DEMO LOCAL
                </span>
              </div>

              <div className="text-xs font-mono space-y-1.5 text-gray-300">
                <div><strong>Audit Event ID:</strong> <span className="text-[#FF8533]">{result.auditLogId}</span></div>
                <div><strong>Protocol Selected:</strong> {result.selectedProtocol}</div>
                <div><strong>Delivery Status:</strong> {result.deliveryStatus}</div>
                {result.isCrossProtocol && (
                  <div className="p-2 bg-yellow-900/40 border border-yellow-500 text-yellow-300 text-[11px] mt-2">
                    {result.crossProtocolWarning}
                  </div>
                )}
              </div>

              {/* Payload Preview */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-gray-400 uppercase">Wire Payload Preview</span>
                  <button
                    onClick={handleCopyPayload}
                    className="text-[10px] text-[#FF8533] hover:text-white flex items-center gap-1 font-mono"
                  >
                    {copied ? <Check size={11} /> : <Copy size={11} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-[#111] p-2.5 text-[10px] font-mono text-green-400 overflow-x-auto max-h-40 border border-gray-800">
                  {result.payloadPreview}
                </pre>
              </div>

              <div className="text-[10px] font-mono text-gray-400 italic">
                {result.notice}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal before Cryptographic Execution */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#202020] max-w-lg w-full p-6 shadow-brutal-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#202020]">
              <div className="flex items-center gap-2">
                <Shield className="text-[#FF6B00]" size={20} />
                <h3 className="font-black text-sm uppercase text-[#202020]">
                  Pre-Execution Cryptographic Review
                </h3>
              </div>
              {!isProcessing && (
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-500 hover:text-black font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {isProcessing ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-10 h-10 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-mono font-bold text-[#202020]">{processStep}</p>
                <p className="text-[11px] text-gray-500 font-mono">
                  Performing real asymmetric cryptographic algorithms on gateway server...
                </p>
              </div>
            ) : dispatchError ? (
              <div className="space-y-4">
                <div className="p-3 bg-red-50 border-2 border-red-600 text-xs font-mono text-red-700 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-red-800">
                    <AlertCircle size={15} /> Cryptographic Processing Error
                  </div>
                  <p className="font-sans leading-relaxed">{dispatchError}</p>
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      setDispatchError(null);
                      setShowReviewModal(false);
                    }}
                    className="px-4 py-2 text-xs font-bold border-2 border-[#202020] hover:bg-gray-100"
                  >
                    Cancel / Edit
                  </button>
                  <button
                    onClick={handleExecuteDispatch}
                    className="brutal-btn-primary px-5 py-2 text-xs flex items-center gap-1.5"
                  >
                    Retry Dispatch →
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2 text-xs font-mono bg-[#FFFAF5] p-3 border border-[#202020]">
                  <div><strong>Sender:</strong> {sender}</div>
                  <div><strong>Recipient:</strong> {recipient}</div>
                  <div><strong>Subject:</strong> {subject}</div>
                  <div><strong>Protocol Mode:</strong> {protocol}</div>
                  <div><strong>Encryption:</strong> {encrypt ? 'Enabled (Asymmetric Cipher)' : 'Disabled'}</div>
                  <div><strong>Digital Signature:</strong> {sign ? 'Enabled (Integrity & Non-Repudiation)' : 'Disabled'}</div>
                  <div><strong>Attachment:</strong> {attachmentName || 'None'}</div>
                </div>

                <div className="p-3 bg-[#FFF0E5] border border-[#FF6B00] text-[11px] font-mono text-[#D94B00]">
                  <strong>Security Note:</strong> The message will be cryptographically processed, validated, and recorded in the local demonstration audit ledger. External mail transmission will not occur.
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2 text-xs font-bold border-2 border-[#202020] hover:bg-gray-100"
                  >
                    Modify
                  </button>
                  <button
                    onClick={handleExecuteDispatch}
                    className="brutal-btn-primary px-5 py-2 text-xs flex items-center gap-1.5"
                  >
                    Confirm & Execute Cryptography →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
