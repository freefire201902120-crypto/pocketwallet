import React, { useState, useEffect } from 'react';
import {
  X,
  Key,
  Shield,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  HelpCircle,
  Copy,
  Info,
  Layers,
  Lock,
} from 'lucide-react';
import { BkashConfigurationOptions, NagadConfigurationOptions, Language } from '../types/pocketwallet';
import { walletEngine } from '../services/walletEngine';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  lang = 'en',
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'bkash' | 'nagad'>('bkash');
  const [bkash, setBkash] = useState<BkashConfigurationOptions>(walletEngine.getBkashConfig());
  const [nagad, setNagad] = useState<NagadConfigurationOptions>(walletEngine.getNagadConfig());
  const [saved, setSaved] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const credSummary = walletEngine.getCredentialSummary();

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await walletEngine.updateBkashConfig(bkash);
    await walletEngine.updateNagadConfig(nagad);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 900);
  };

  const setBkashUrlMode = (isProd: boolean) => {
    const url = isProd
      ? 'https://tokenized.pay.bka.sh/v1.2.0-beta'
      : 'https://tokenized.sandbox.bka.sh/v1.2.0-beta';
    setBkash({ ...bkash, baseUrl: url, isProduction: isProd });
  };

  const setNagadUrlMode = (isProd: boolean) => {
    const url = isProd
      ? 'https://api.mynagad.com/api/dfs/'
      : 'http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0/api/dfs/';
    setNagad({ ...nagad, baseUrl: url, isProduction: isProd });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{lang === 'bn' ? 'মার্চেন্ট গেটওয়ে ক্রেডেনশিয়াল ও এপিআই কি' : 'Real Merchant Gateway Credentials & API Keys'}</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  Cloud Synced
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Configure real bKash Tokenized & Nagad PGW credentials for actual money processing
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('bkash')}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'bkash'
                ? 'border-[#E2136E] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#E2136E]" />
            <span>bKash Tokenized (v2.0)</span>
            {credSummary.bkashConfigured ? (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Ready
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Keys Needed
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('nagad')}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'nagad'
                ? 'border-[#F7941D] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#F7941D]" />
            <span>Nagad PGW (v1.0)</span>
            {credSummary.nagadConfigured ? (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Ready
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Keys Needed
              </span>
            )}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
          {activeTab === 'bkash' ? (
            <>
              {/* Guidance Box for bKash */}
              <div className="p-3.5 rounded-xl bg-pink-500/10 border border-pink-500/30 space-y-2">
                <div className="flex items-center justify-between text-pink-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-pink-400" />
                    <span>Real bKash Merchant Credentials Guide</span>
                  </span>
                  <a
                    href="https://merchant.bkash.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-pink-400 hover:text-pink-200 underline flex items-center gap-1"
                  >
                    <span>bKash Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  To accept real money via bKash, obtain your official credentials from the bKash Merchant Integration Team (email <code className="text-pink-300 bg-slate-900 px-1 py-0.5 rounded">merchantpgw@bkash.com</code> or via <a href="https://merchant.bkash.com" target="_blank" rel="noreferrer" className="underline text-pink-300">merchant.bkash.com</a>). Enter the 4 keys below. All payments will execute through bKash's official PGW.
                </p>
                <div className="text-[10px] text-slate-400 flex flex-wrap gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700">1. App Key</span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700">2. App Secret</span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700">3. API Username</span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700">4. API Password</span>
                </div>
              </div>

              {/* Endpoint Mode Switch */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">Gateway Target Mode</div>
                  <div className="text-[10px] text-slate-400 font-mono">{bkash.baseUrl}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBkashUrlMode(false)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition ${
                      !bkash.isProduction
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Sandbox URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setBkashUrlMode(true)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition ${
                      bkash.isProduction
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Live Production URL
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                    <span>App Key (app_key) *</span>
                    <span className="text-[10px] text-slate-500">Public application identifier from bKash</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={bkash.appKey}
                    onChange={(e) => setBkash({ ...bkash, appKey: e.target.value })}
                    placeholder="e.g. 4f6xxxxxxxxx_bkash_app_key"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                    <span>App Secret (app_secret) *</span>
                    <span className="text-[10px] text-slate-500">Confidential secret token</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={bkash.appSecret}
                    onChange={(e) => setBkash({ ...bkash, appSecret: e.target.value })}
                    placeholder="••••••••••••••••••••••••••••••••"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      API Username (username) *
                    </label>
                    <input
                      type="text"
                      required
                      value={bkash.username}
                      onChange={(e) => setBkash({ ...bkash, username: e.target.value })}
                      placeholder="e.g. merchant_017xxxx"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      API Password (password) *
                    </label>
                    <input
                      type="password"
                      required
                      value={bkash.password}
                      onChange={(e) => setBkash({ ...bkash, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    bKash Base API Endpoint URL
                  </label>
                  <input
                    type="text"
                    value={bkash.baseUrl}
                    onChange={(e) => setBkash({ ...bkash, baseUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Guidance Box for Nagad */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between text-amber-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-amber-400" />
                    <span>Real Nagad Merchant Credentials Guide</span>
                  </span>
                  <a
                    href="https://merchant.mynagad.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-amber-400 hover:text-amber-200 underline flex items-center gap-1"
                  >
                    <span>Nagad Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  To accept real money via Nagad, contact Nagad Merchant Onboarding (<code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">pgwsupport@mynagad.com</code> or via <a href="https://merchant.mynagad.com" target="_blank" rel="noreferrer" className="underline text-amber-300">merchant.mynagad.com</a>). Nagad uses an asymmetric RSA PKCS#1 cryptography scheme to sign orders and decrypt customer payment challenges.
                </p>
                <div className="text-[10px] text-slate-400 flex flex-wrap gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700">1. Merchant ID (14 digits)</span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700">2. Merchant Private Key (PEM)</span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700">3. Nagad Public Key (PEM)</span>
                </div>
              </div>

              {/* Endpoint Mode Switch */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">Gateway Target Mode</div>
                  <div className="text-[10px] text-slate-400 font-mono">{nagad.baseUrl}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNagadUrlMode(false)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition ${
                      !nagad.isProduction
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Sandbox URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setNagadUrlMode(true)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition ${
                      nagad.isProduction
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Live Production URL
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                    <span>Merchant ID *</span>
                    <span className="text-[10px] text-slate-500">Assigned 14-digit Merchant ID (e.g. 68000000000001)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nagad.merchantId}
                    onChange={(e) => setNagad({ ...nagad, merchantId: e.target.value })}
                    placeholder="68xxxxxxxxxxxxx"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                    <span>Merchant Private Key (RSA PKCS#1 PEM) *</span>
                    <span className="text-[10px] text-slate-500">Your confidential private key to sign transactions</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={nagad.merchantPrivateKey}
                    onChange={(e) => setNagad({ ...nagad, merchantPrivateKey: e.target.value })}
                    placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;MIIEowIBAAKCAQEA...&#10;-----END RSA PRIVATE KEY-----"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-[11px] focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                    <span>Nagad PGW Public Key (PEM) *</span>
                    <span className="text-[10px] text-slate-500">Nagad's public certificate to encrypt customer payload</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={nagad.nagadPublicKey}
                    onChange={(e) => setNagad({ ...nagad, nagadPublicKey: e.target.value })}
                    placeholder="-----BEGIN PUBLIC KEY-----&#10;MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...&#10;-----END PUBLIC KEY-----"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-[11px] focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Nagad PGW Gateway Endpoint URL
                  </label>
                  <input
                    type="text"
                    value={nagad.baseUrl}
                    onChange={(e) => setNagad({ ...nagad, baseUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-700 text-slate-400 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-pink-600/30"
            >
              {saved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Saved to Cloud Firestore!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
