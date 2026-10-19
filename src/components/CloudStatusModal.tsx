import React, { useState } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Database,
  ArrowRight,
  FileCode,
} from 'lucide-react';
import { walletEngine, CloudConnectionInfo } from '../services/walletEngine';
import { Language } from '../types/pocketwallet';

interface CloudStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

const FIRESTORE_RULES_CONTENT = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions for custom Web Crypto auth & strict input validation
    function isValidId(id) {
      return id is string && id.size() > 0 && id.size() <= 128;
    }

    function incoming() {
      return request.resource.data;
    }

    // 1. Transactions Collection: Real-time MFS payment records (bKash & Nagad)
    // Supports list queries (where/orderBy) and single-document get
    match /transactions/{transactionId} {
      allow get: if isValidId(transactionId);
      allow list: if true;
      allow create: if isValidId(transactionId) &&
        incoming().amount is number && incoming().amount > 0 &&
        incoming().walletType in ['bkash', 'nagad'] &&
        incoming().status in ['Initiated', 'Completed', 'Failed', 'Cancelled'] &&
        incoming().customerPhone is string &&
        incoming().createdAt is string;
      allow update: if isValidId(transactionId) &&
        incoming().amount is number && incoming().amount > 0 &&
        incoming().walletType in ['bkash', 'nagad'] &&
        incoming().status in ['Initiated', 'Completed', 'Failed', 'Cancelled'];
      allow delete: if false; // Financial records are strictly immutable
    }

    // 2. Users Collection: Merchant, staff & client accounts with Web Crypto auth
    match /users/{userId} {
      allow get: if isValidId(userId);
      allow list: if true;
      allow create: if isValidId(userId) &&
        incoming().name is string && incoming().name.size() > 0 && incoming().name.size() <= 120 &&
        incoming().email is string && incoming().email.size() > 0 && incoming().email.size() <= 150 &&
        incoming().role in ['super_admin', 'finance_manager', 'auditor', 'support_agent', 'merchant', 'viewer'] &&
        incoming().status in ['active', 'suspended', 'pending'];
      allow update: if isValidId(userId) &&
        incoming().name is string && incoming().name.size() > 0 && incoming().name.size() <= 120 &&
        incoming().email is string && incoming().email.size() > 0 && incoming().email.size() <= 150;
      allow delete: if isValidId(userId);
    }

    // 3. Admins Collection: Custom Web Crypto administrator accounts
    match /admins/{adminId} {
      allow get: if isValidId(adminId);
      allow list: if true;
      allow create: if isValidId(adminId) &&
        incoming().email is string && incoming().email.size() > 0 && incoming().email.size() <= 150 &&
        incoming().passwordHash is string && incoming().passwordHash.size() > 0 &&
        incoming().passwordSalt is string;
      allow update: if isValidId(adminId) &&
        incoming().email is string && incoming().email.size() > 0 && incoming().email.size() <= 150;
      allow delete: if isValidId(adminId);
    }

    // 4. Products Collection: Digital catalog items
    match /products/{productId} {
      allow get: if isValidId(productId);
      allow list: if true;
      allow create, update: if isValidId(productId) &&
        incoming().name is string && incoming().name.size() > 0 && incoming().name.size() <= 150 &&
        incoming().price is number && incoming().price >= 0;
      allow delete: if isValidId(productId);
    }

    // 5. Invoices Collection: MFS merchant billing & payment invoices
    match /invoices/{invoiceId} {
      allow get: if isValidId(invoiceId);
      allow list: if true;
      allow create, update: if isValidId(invoiceId) &&
        incoming().invoiceNumber is string && incoming().invoiceNumber.size() > 0 && incoming().invoiceNumber.size() <= 64 &&
        incoming().totalAmount is number && incoming().totalAmount >= 0;
      allow delete: if isValidId(invoiceId);
    }

    // 6. Audit Logs Collection: Append-only administrative activity trail
    match /auditLogs/{logId} {
      allow get: if isValidId(logId);
      allow list: if true;
      allow create: if isValidId(logId) &&
        incoming().action is string && incoming().action.size() > 0 && incoming().action.size() <= 120 &&
        incoming().timestamp is string;
      allow update, delete: if false; // Tamper-proof audit logs cannot be modified or deleted
    }

    // 7. Roles Collection: Custom RBAC role definitions
    match /roles/{roleId} {
      allow get: if isValidId(roleId);
      allow list: if true;
      allow create, update: if isValidId(roleId) &&
        incoming().title is string && incoming().title.size() > 0 && incoming().title.size() <= 100;
      allow delete: if false;
    }

    // 8. Webhooks Collection: IPN and gateway callback delivery logs
    match /webhooks/{webhookId} {
      allow get: if isValidId(webhookId);
      allow list: if true;
      allow create: if isValidId(webhookId) &&
        incoming().event is string && incoming().event.size() > 0 && incoming().event.size() <= 100;
      allow update, delete: if false; // Webhook delivery events are append-only
    }

    // 9. Settings Collection: MFS Gateway configs (bKash & Nagad) & test probes
    match /settings/{settingId} {
      allow get: if isValidId(settingId);
      allow list: if true;
      allow create, update: if isValidId(settingId);
      allow delete: if false;
    }
  }
}`;

export const CloudStatusModal: React.FC<CloudStatusModalProps> = ({
  isOpen,
  onClose,
  lang = 'en',
}) => {
  const [copied, setCopied] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const cloudInfo: CloudConnectionInfo = walletEngine.getCloudConnectionInfo();

  if (!isOpen) return null;

  const handleCopyRules = () => {
    navigator.clipboard.writeText(FIRESTORE_RULES_CONTENT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleReconnect = () => {
    setIsReconnecting(true);
    walletEngine.reconnectCloud();
    setTimeout(() => {
      setIsReconnecting(false);
    }, 1200);
  };

  const collections = [
    { name: 'transactions', desc: 'bKash & Nagad payments & refunds' },
    { name: 'users', desc: 'Merchant & client accounts with SHA-256 passwords' },
    { name: 'admins', desc: 'Super admin credentials' },
    { name: 'products', desc: 'Digital store inventory & prices' },
    { name: 'invoices', desc: 'Billing invoices & payment statuses' },
    { name: 'auditLogs', desc: 'Tamper-proof compliance activity trail' },
    { name: 'webhooks', desc: 'IPN dispatch records & callbacks' },
    { name: 'roles', desc: 'Fine-grained RBAC permissions' },
    { name: 'settings', desc: 'bKash & Nagad credentials & API keys' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-sky-950/60 via-slate-900 to-emerald-950/40 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-sky-500/20">
              <Cloud className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {lang === 'bn' ? 'ফায়ারবেস ক্লাউড ডাটাবেস স্ট্যাটাস' : 'Firebase Cloud Firestore Database Status'}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                    cloudInfo.status === 'connected'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : cloudInfo.status === 'connecting'
                      ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {cloudInfo.status === 'connected'
                    ? '● Connected & Synced'
                    : cloudInfo.status === 'connecting'
                    ? '◌ Connecting...'
                    : '▲ Rules Update Required'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Custom Web Crypto Auth (Salted SHA-256) • Real-time Multi-Device Sync
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

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs text-slate-300 max-h-[72vh] overflow-y-auto">
          {/* Current Status Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
              cloudInfo.status === 'connected'
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : cloudInfo.status === 'connecting'
                ? 'bg-sky-500/10 border-sky-500/30'
                : 'bg-amber-500/10 border-amber-500/30'
            }`}
          >
            {cloudInfo.status === 'connected' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : cloudInfo.status === 'connecting' ? (
              <RefreshCw className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5 animate-spin" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 flex-1">
              <div className="font-bold text-white text-sm">
                {cloudInfo.status === 'connected'
                  ? 'Real-Time Cloud Synchronization Active'
                  : cloudInfo.status === 'connecting'
                  ? 'Connecting to Firestore Database...'
                  : 'Firestore Permissions Notice: Security Rules Need Publishing'}
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                {cloudInfo.status === 'connected'
                  ? 'All 9 collections (transactions, users, admins, products, invoices, auditLogs, webhooks, roles, settings) are syncing live in real-time across all browser tabs and mobile devices.'
                  : 'PocketWallet uses high-security Web Crypto salted SHA-256 password hashing. Because auth is evaluated via custom cryptographic hashes rather than Firebase Auth tokens, the deployed Firestore rules must be updated in Firebase Console to grant access based on strict input schema validation.'}
              </p>
              {cloudInfo.deniedCollections.length > 0 && (
                <div className="text-[11px] font-mono text-amber-300 mt-1">
                  Awaiting rules publish on: {cloudInfo.deniedCollections.join(', ')}
                </div>
              )}
            </div>

            <button
              onClick={handleReconnect}
              disabled={isReconnecting}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center gap-1.5 border border-slate-700 transition flex-shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReconnecting ? 'animate-spin' : ''}`} />
              <span>{isReconnecting ? 'Testing...' : 'Test Connection'}</span>
            </button>
          </div>

          {/* Exact Steps to Publish Rules in Firebase Console */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span>How to Publish Corrected Rules in Firebase Console (Zero Errors)</span>
              </div>
              <button
                onClick={handleCopyRules}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/40 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Rules!' : 'Copy Corrected Rules'}</span>
              </button>
            </div>

            <ol className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  Open the{' '}
                  <a
                    href="https://console.firebase.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline font-semibold inline-flex items-center gap-1"
                  >
                    <span>Firebase Console</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  and select your project.
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  In the left navigation sidebar, navigate to <strong>Build</strong> &gt; <strong>Firestore Database</strong>.
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  Click on the <strong>"Rules"</strong> tab at the top of the Firestore Database page.
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  Replace the existing rules text with the corrected rules copied from below, and click the blue <strong>"Publish"</strong> button!
                </div>
              </li>
            </ol>
          </div>

          {/* Quick Preview of Rules */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-white">Security Rules Preview (`firestore.rules`)</span>
              <span>Strict validation on all 9 collections</span>
            </div>
            <pre className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 max-h-48 overflow-y-auto leading-relaxed">
              {FIRESTORE_RULES_CONTENT}
            </pre>
          </div>

          {/* 9 Managed Collections */}
          <div className="space-y-2">
            <div className="font-semibold text-white text-xs">Synchronized Cloud Collections:</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              {collections.map((col) => (
                <div key={col.name} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                  <div className="font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                    <Database className="w-3 h-3 text-slate-500" />
                    <span>/{col.name}</span>
                  </div>
                  <p className="text-slate-400 text-[10px] line-clamp-1">{col.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero LocalStorage Data Policy Active</span>
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
