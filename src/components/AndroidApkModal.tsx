import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  Copy,
  Check,
  Terminal,
  FileCode,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  ChevronRight,
  FolderGit2,
  Cpu,
} from 'lucide-react';
import { Language } from '../types/pocketwallet';

interface AndroidApkModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const AndroidApkModal: React.FC<AndroidApkModalProps> = ({
  isOpen,
  onClose,
  lang = 'en',
}) => {
  const [activeTab, setActiveTab] = useState<'cloud' | 'local' | 'phone'>('cloud');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-pink-950/40 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <Smartphone className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {lang === 'bn' ? 'অ্যান্ড্রয়েড এপিকে (APK) তৈরি ও ইনস্টলেশন' : 'PocketWallet Android APK Generator'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Ready to Build
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Package: <code className="text-emerald-300 font-mono">com.pocketwallet.mfs</code> • Capacitor 8 Native
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/70 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('cloud')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'cloud'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>GitHub Actions Cloud (Zero Setup)</span>
          </button>

          <button
            onClick={() => setActiveTab('local')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'local'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Android Studio / Local Gradle</span>
          </button>

          <button
            onClick={() => setActiveTab('phone')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'phone'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Install on Phone</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-5 text-xs text-slate-300 max-h-[70vh] overflow-y-auto">
          {/* TAB 1: GITHUB ACTIONS CLOUD BUILD */}
          {activeTab === 'cloud' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-sm">
                    {lang === 'bn' ? 'কোনো সফটওয়্যার ইনস্টল করা ছাড়াই এপিকে তৈরি করুন' : 'Easiest Method: Automatic Cloud APK Build'}
                  </h4>
                  <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                    We have already created the automated workflow file <code className="text-emerald-300 font-mono">.github/workflows/build-apk.yml</code>. Whenever code is in GitHub, it builds the APK on Ubuntu cloud runners for free in 2 minutes!
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Step 1: Push or sync your project to GitHub</span>
                    <span className="text-[10px] font-mono text-emerald-400">Automated</span>
                  </div>
                  <p className="text-slate-400">
                    If this repo is connected to your GitHub, pushing any commit triggers the build immediately.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Step 2: Go to GitHub "Actions" Tab</span>
                  </div>
                  <p className="text-slate-400">
                    Navigate to your GitHub repository in your browser and click on the <strong>Actions</strong> tab. You will see <strong>"Build PocketWallet Android APK"</strong> running.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Step 3: Download your APK from Artifacts</span>
                  </div>
                  <p className="text-slate-400">
                    Once the checkmark turns green (approx. 2 minutes), scroll to the bottom of the run summary under <strong>"Artifacts"</strong> and click <strong>PocketWallet-Debug-APK</strong> to download the zip containing <code className="text-emerald-300 font-mono">app-debug.apk</code>!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LOCAL GRADLE & ANDROID STUDIO */}
          {activeTab === 'local' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <h4 className="font-bold text-white text-sm">
                  Full Native Android Project Ready in <code className="text-pink-400">/android</code>
                </h4>
                <p className="text-slate-400">
                  The Android project has been generated with package <code className="text-slate-200">com.pocketwallet.mfs</code>, AndroidManifest with all required permissions, dark theme launcher background, and splash screen.
                </p>
              </div>

              {/* Command 1: Build & Sync */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                  <span>1. Sync web assets into Android project:</span>
                  <button
                    onClick={() => handleCopy('npm run build:android', 'cmd1')}
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    {copiedCmd === 'cmd1' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCmd === 'cmd1' ? 'Copied' : 'Copy Command'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-emerald-400 text-xs">
                  npm run build:android
                </pre>
              </div>

              {/* Command 2: Open in Android Studio */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                  <span>2. Open directly in Android Studio:</span>
                  <button
                    onClick={() => handleCopy('npx cap open android', 'cmd2')}
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    {copiedCmd === 'cmd2' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCmd === 'cmd2' ? 'Copied' : 'Copy Command'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-emerald-400 text-xs">
                  npx cap open android
                </pre>
                <p className="text-[11px] text-slate-400">
                  In Android Studio, click <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong>.
                </p>
              </div>

              {/* Command 3: Build directly via Terminal / CLI */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                  <span>3. Or build directly in 1 command (Mac / Linux / WSL):</span>
                  <button
                    onClick={() => handleCopy('npm run build:apk', 'cmd3')}
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    {copiedCmd === 'cmd3' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCmd === 'cmd3' ? 'Copied' : 'Copy Command'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-emerald-400 text-xs">
                  npm run build:apk
                </pre>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-[11px] space-y-1">
                  <div className="font-semibold text-white">Generated APK Path:</div>
                  <code className="text-pink-300 font-mono block break-all">
                    android/app/build/outputs/apk/debug/app-debug.apk
                  </code>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INSTALL ON PHONE */}
          {activeTab === 'phone' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-sm">
                  {lang === 'bn' ? 'কীভাবে ফোনে APK ফাইল ইন্সটল করবেন' : 'How to Install APK on your Android Phone'}
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-slate-300 text-xs pl-1">
                  <li>
                    Transfer the generated <strong>app-debug.apk</strong> to your phone (via USB cable, Google Drive, WhatsApp, or Telegram).
                  </li>
                  <li>
                    On your phone, tap on <strong>app-debug.apk</strong> in your Files or Downloads app.
                  </li>
                  <li>
                    If prompted with <em>"Install unknown apps"</em>, toggle <strong>"Allow from this source"</strong> for your file manager or browser.
                  </li>
                  <li>
                    Tap <strong>Install</strong>. Once completed, tap <strong>Open</strong>!
                  </li>
                </ol>
              </div>

              {/* Instant PWA Install on Android */}
              <div className="p-4 rounded-2xl bg-pink-500/10 border border-pink-500/30 space-y-2">
                <div className="flex items-center gap-2 text-pink-300 font-bold">
                  <Smartphone className="w-4 h-4" />
                  <span>Instant Install without waiting for APK:</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  You can also open the PocketWallet URL on Google Chrome on your Android phone, tap the <strong>⋮ (three dots)</strong> menu, and select <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>. PocketWallet will immediately install onto your phone's home screen with an official icon and splash screen!
                </p>
              </div>
            </div>
          )}

          {/* Configuration Summary Pill */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-slate-500 block">App Name</span>
              <span className="text-white font-bold">PocketWallet</span>
            </div>
            <div>
              <span className="text-slate-500 block">Package ID</span>
              <span className="text-white font-bold">com.pocketwallet.mfs</span>
            </div>
            <div>
              <span className="text-slate-500 block">Min SDK</span>
              <span className="text-emerald-400 font-bold">24 (Android 7.0+)</span>
            </div>
            <div>
              <span className="text-slate-500 block">Target SDK</span>
              <span className="text-emerald-400 font-bold">34 / 36</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Capacitor Android Build Verified</span>
          </div>
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
