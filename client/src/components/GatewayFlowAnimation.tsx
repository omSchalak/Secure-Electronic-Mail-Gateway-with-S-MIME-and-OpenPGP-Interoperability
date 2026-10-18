import React, { useState, useEffect } from 'react';
import { Mail, ShieldCheck, ArrowRight, Lock, Key, CheckCircle2, RefreshCw } from 'lucide-react';

export const GatewayFlowAnimation: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: '1. Inbound Ingestion',
      subtitle: 'Sender dispatches encrypted/signed message (S/MIME or OpenPGP)',
      badge: 'INGEST',
      icon: Mail,
      color: 'border-[#202020]',
    },
    {
      title: '2. Policy & Header Inspection',
      subtitle: 'Gateway parses MIME headers, detects crypto type, verifies signature',
      badge: 'PARSE & VERIFY',
      icon: ShieldCheck,
      color: 'border-[#FF6B00]',
    },
    {
      title: '3. Gateway Boundary Transit',
      subtitle: 'Direct pass-through OR authorized decrypt-and-re-encrypt',
      badge: 'TRANSFORMATION',
      icon: Lock,
      color: 'border-[#D94B00]',
    },
    {
      title: '4. Verified Outbound Dispatch',
      subtitle: 'Delivered in recipient format with gateway provenance audit',
      badge: 'DELIVERED',
      icon: CheckCircle2,
      color: 'border-[#202020]',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="w-full bg-[#FFFFFF] border-3 border-[#202020] p-6 shadow-brutal-xl relative overflow-hidden">
      {/* Decorative Corner Accents */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFF0E5] -mr-8 -mt-8 rotate-45 border-b-2 border-l-2 border-[#FF6B00]" />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <span className="text-[10px] font-mono font-bold bg-[#FF6B00] text-white px-2 py-0.5 uppercase tracking-wider">
            Live Gateway Pipeline Visualizer
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-[#202020] uppercase tracking-tight mt-1">
            End-to-End Cryptographic Gateway Flow
          </h3>
        </div>
        <button
          onClick={() => setActiveStep((prev) => (prev + 1) % steps.length)}
          className="flex items-center gap-1.5 text-xs font-mono font-bold bg-[#FFF0E5] hover:bg-[#FF6B00] hover:text-white text-[#D94B00] border-2 border-[#202020] px-3 py-1.5 transition-all shadow-[2px_2px_0_0_#202020]"
        >
          <RefreshCw size={13} className="animate-spin" />
          Cycle Step
        </button>
      </div>

      {/* Pipeline Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx === activeStep;
          const isPassed = idx < activeStep;

          return (
            <div
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`cursor-pointer p-4 border-2 transition-all relative ${
                isActive
                  ? 'bg-[#FFF0E5] border-[#FF6B00] shadow-[4px_4px_0_0_#FF6B00] -translate-y-1'
                  : isPassed
                  ? 'bg-white border-[#202020] shadow-[2px_2px_0_0_#202020]'
                  : 'bg-white/70 border-gray-300 opacity-70'
              }`}
            >
              {/* Step indicator pill */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.5 border ${
                    isActive
                      ? 'bg-[#FF6B00] text-white border-[#202020]'
                      : 'bg-gray-100 text-gray-700 border-gray-300'
                  }`}
                >
                  {step.badge}
                </span>
                <span className="text-xs font-mono font-bold text-gray-400">
                  0{idx + 1}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-8 h-8 rounded-none border-2 flex items-center justify-center ${
                    isActive
                      ? 'bg-[#FF6B00] text-white border-[#202020]'
                      : 'bg-[#FFFAF5] text-[#202020] border-[#202020]'
                  }`}
                >
                  <Icon size={16} />
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-[#202020]">
                  {step.title}
                </h4>
              </div>

              <p className="text-[11px] text-gray-600 leading-tight">
                {step.subtitle}
              </p>

              {/* Active pulsing bar */}
              {isActive && (
                <div className="absolute -bottom-1 left-0 right-0 h-1 bg-[#FF6B00]" />
              )}
            </div>
          );
        })}
      </div>

      {/* Dynamic Explanation Panel for Active Step */}
      <div className="mt-6 p-4 bg-[#202020] text-white border-2 border-[#202020] font-mono text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-[#FF6B00] animate-ping" />
          <div>
            <span className="text-[#FF8533] font-bold">STATE INSPECTOR: </span>
            {activeStep === 0 && 'Sender encapsulates email into S/MIME PKCS#7 or OpenPGP ASCII Armor block.'}
            {activeStep === 1 && 'Gateway reads recipient metadata, verifies digital signature, and validates certificates.'}
            {activeStep === 2 && 'Gateway assesses format compatibility. In cross-protocol delivery, controlled decrypt-and-re-encrypt occurs within the secure gateway boundary.'}
            {activeStep === 3 && 'Recipient receives verified message with cryptographic authentication and non-repudiation headers.'}
          </div>
        </div>
        <div className="text-[10px] bg-[#333] border border-gray-600 px-2 py-1 text-gray-300 shrink-0">
          SECURE PERIMETER: ACTIVE
        </div>
      </div>
    </div>
  );
};
