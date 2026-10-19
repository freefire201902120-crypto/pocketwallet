import React from 'react';
import {
  Wallet,
  Globe,
  RefreshCw,
  PlusCircle,
  SlidersHorizontal,
  ShieldCheck,
  Zap,
  Smartphone,
  User,
  Key,
} from 'lucide-react';
import { Environment, Language } from '../types/pocketwallet';
import { TRANSLATIONS } from '../data/initialData';
import { walletEngine } from '../services/walletEngine';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  env: Environment;
  setEnv: (env: Environment) => void;
  onOpenNewPayment: () => void;
  onOpenSettings: () => void;
  onOpenAndroidApk: () => void;
  onOpenAuth: () => void;
  onOpenCloudStatus: () => void;
  onResetData: () => void;
  transactionCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  env,
  setEnv,
  onOpenNewPayment,
  onOpenSettings,
  onOpenAndroidApk,
  onOpenAuth,
  onOpenCloudStatus,
  onResetData,
}) => {
  const t = TRANSLATIONS[lang];
  const currentUser = walletEngine.getCurrentUser();
  const cloudInfo = walletEngine.getCloudConnectionInfo();

  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: '📊' },
    { id: 'simulator', label: t.simulator, icon: '📱' },
    { id: 'storefront', label: t.storefront, icon: '🛍️' },
    { id: 'playground', label: t.apiPlayground, icon: '⚡' },
    { id: 'invoicing', label: t.invoicing, icon: '🧾' },
    { id: 'webhooks', label: t.webhooks, icon: '📡' },
    { id: 'admin', label: t.adminPanel, icon: '🛡️' },
    { id: 'sdk', label: t.codeSdk, icon: '💻' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0d131f]/95 backdrop-blur-md border-b border-slate-800/80 shadow-lg">
      {/* Top Banner Bar */}
      <div className="bg-gradient-to-r from-pink-900/30 via-slate-900 to-amber-900/30 border-b border-slate-800/60 px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300 font-medium">
              {lang === 'bn'
                ? 'বিকাশ ও নগদ পেমেন্ট ইঞ্জিন সক্রিয়'
                : 'Unified bKash (v2.0) & Nagad (PGW 1.0) Active'}
            </span>
            <span className="hidden sm:inline-block text-slate-500">•</span>
            <span className="hidden sm:inline-block text-slate-400">
              {lang === 'bn' ? 'টোকেনাইজড পেমেন্ট ও ডিরেক্ট রিফান্ড সমর্থিত' : 'Tokenized Gateway & Direct Instant Refund Ready'}
            </span>
            {/* Interactive Cloud Connection Status Pill */}
            <button
              onClick={onOpenCloudStatus}
              className={`hidden md:inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-0.5 rounded-full border transition cursor-pointer ${
                cloudInfo.status === 'connected'
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20'
                  : cloudInfo.status === 'connecting'
                  ? 'text-sky-400 bg-sky-500/10 border-sky-500/30 hover:bg-sky-500/20'
                  : 'text-amber-300 bg-amber-500/15 border-amber-500/40 hover:bg-amber-500/25'
              }`}
              title="Click to check Cloud Firestore database sync status & rules"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  cloudInfo.status === 'connected'
                    ? 'bg-emerald-400'
                    : cloudInfo.status === 'connecting'
                    ? 'bg-sky-400 animate-ping'
                    : 'bg-amber-400 animate-pulse'
                }`}
              />
              <span>
                {cloudInfo.status === 'connected'
                  ? '☁️ Cloud Synced'
                  : cloudInfo.status === 'connecting'
                  ? '☁️ Connecting Cloud...'
                  : '⚠️ Cloud Rules Notice'}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Environment Switcher */}
            <button
              onClick={() => setEnv(env === 'sandbox' ? 'live' : 'sandbox')}
              className={`px-2.5 py-0.5 rounded-full font-mono font-semibold text-[11px] tracking-wide transition-all border ${
                env === 'sandbox'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
              }`}
              title="Toggle Environment"
            >
              {env === 'sandbox' ? '⚡ ' + t.sandboxMode : '🟢 ' + t.liveMode}
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition"
              title="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold">{lang === 'en' ? 'বাংলা' : 'English'}</span>
            </button>

            {/* Reset Data */}
            <button
              onClick={onResetData}
              className="p-1 text-slate-400 hover:text-slate-200 transition"
              title="Reset All Data to Clean State"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-500 shadow-md shadow-pink-500/20">
            <Wallet className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-bold text-white">
              ✓
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white font-sans">
                Pocket<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-amber-400">Wallet</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30 rounded">
                MFS Studio
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* User Account / Profile Button */}
          {currentUser ? (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 text-xs font-semibold border border-pink-500/30 transition shadow-sm"
              title="View Account Profile"
            >
              <div className="w-5 h-5 rounded-full bg-pink-500/30 flex items-center justify-center text-[10px] text-pink-200 font-bold uppercase">
                {currentUser.name.charAt(0)}
              </div>
              <span className="hidden sm:inline-block max-w-[100px] truncate">{currentUser.name}</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-pink-500/30 text-pink-200 uppercase font-mono">
                {currentUser.role.replace('_', ' ')}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition shadow-sm"
            >
              <User className="w-3.5 h-3.5 text-pink-400" />
              <span>{lang === 'bn' ? 'সাইন ইন / নিবন্ধন' : 'Sign In / Register'}</span>
            </button>
          )}

          <button
            onClick={onOpenAndroidApk}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition shadow-sm"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android APK</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
            title="Configure Real Gateway Credentials"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.settings}</span>
          </button>

          <button
            onClick={onOpenNewPayment}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-semibold shadow-md shadow-pink-600/30 transition transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.newPayment}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-none border-t border-slate-800/40">
        <nav className="flex space-x-1 py-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.id === 'simulator' && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                    Live UI
                  </span>
                )}
                {item.id === 'admin' && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-pink-500/20 text-pink-300 font-semibold border border-pink-500/30">
                    RBAC
                  </span>
                )}
                {item.id === 'sdk' && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30">
                    C# .NET
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
