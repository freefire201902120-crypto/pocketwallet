import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { CheckoutSimulatorModal } from './components/CheckoutSimulatorModal';
import { ApiPlayground } from './components/ApiPlayground';
import { CodeGeneratorView } from './components/CodeGeneratorView';
import { StorefrontView } from './components/StorefrontView';
import { InvoiceGeneratorView } from './components/InvoiceGeneratorView';
import { WebhookView } from './components/WebhookView';
import { ReceiptModal } from './components/ReceiptModal';
import { RefundModal } from './components/RefundModal';
import { SettingsModal } from './components/SettingsModal';
import { AndroidApkModal } from './components/AndroidApkModal';
import { AdminPanelView } from './components/AdminPanelView';
import { AuthModal } from './components/AuthModal';
import { CloudStatusModal } from './components/CloudStatusModal';
import { walletEngine } from './services/walletEngine';
import { Environment, Language, TransactionRecord, WalletType } from './types/pocketwallet';
import { ShieldCheck, Heart, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [lang, setLang] = useState<Language>('en');
  const [env, setEnv] = useState<Environment>(walletEngine.getEnvironment());
  const [transactions, setTransactions] = useState<TransactionRecord[]>(walletEngine.getTransactions());
  const [webhooks, setWebhooks] = useState(walletEngine.getWebhooks());
  const [cloudInfo, setCloudInfo] = useState(walletEngine.getCloudConnectionInfo());

  // Modals
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutParams, setCheckoutParams] = useState<{
    wallet: WalletType;
    amount: number;
    invoice?: string;
    phone?: string;
  }>({
    wallet: 'bkash',
    amount: 1450,
    phone: '',
  });

  const [receiptTx, setReceiptTx] = useState<TransactionRecord | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const [refundTx, setRefundTx] = useState<TransactionRecord | null>(null);
  const [isRefundOpen, setIsRefundOpen] = useState(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCloudStatusOpen, setIsCloudStatusOpen] = useState(false);
  const [isNoticeDismissed, setIsNoticeDismissed] = useState(false);

  // Subscribe to walletEngine changes
  useEffect(() => {
    const unsubscribe = walletEngine.subscribe(() => {
      setTransactions(walletEngine.getTransactions());
      setWebhooks(walletEngine.getWebhooks());
      setEnv(walletEngine.getEnvironment());
      setCloudInfo(walletEngine.getCloudConnectionInfo());
    });
    return unsubscribe;
  }, []);

  const handleOpenNewPayment = () => {
    setCheckoutParams({
      wallet: 'bkash',
      amount: 500,
      invoice: `INV-${Date.now().toString().slice(-6)}`,
      phone: '',
    });
    setIsCheckoutOpen(true);
  };

  const handleOpenReceipt = (tx: TransactionRecord) => {
    setReceiptTx(tx);
    setIsReceiptOpen(true);
  };

  const handleOpenRefund = (tx: TransactionRecord) => {
    setRefundTx(tx);
    setIsRefundOpen(true);
  };

  const handleQueryTx = (tx: TransactionRecord) => {
    setActiveTab('playground');
  };

  const handleResetData = () => {
    if (window.confirm('Wipe and clear all transactions, invoices, users, and audit logs?')) {
      walletEngine.resetToDefault();
    }
  };

  const handleTriggerCheckoutFromStore = (wallet: WalletType, amount: number, invoice: string) => {
    setCheckoutParams({
      wallet,
      amount,
      invoice,
      phone: '',
    });
    setIsCheckoutOpen(true);
  };

  const handlePayInvoice = (wallet: WalletType, amount: number, invoiceNumber: string) => {
    setCheckoutParams({
      wallet,
      amount,
      invoice: invoiceNumber,
      phone: '',
    });
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans selection:bg-pink-500/30 selection:text-pink-200">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        env={env}
        setEnv={(newEnv) => {
          walletEngine.setEnvironment(newEnv);
          setEnv(newEnv);
        }}
        onOpenNewPayment={handleOpenNewPayment}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAndroidApk={() => setIsAndroidModalOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCloudStatus={() => setIsCloudStatusOpen(true)}
        onResetData={handleResetData}
        transactionCount={transactions.length}
      />

      {/* Human-Readable Firestore Custom Auth Security Rules Notice */}
      {cloudInfo.status === 'permission_denied' && !isNoticeDismissed && (
        <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-b border-amber-500/30 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                <strong>Firebase Notice:</strong> Firestore returned <em>"Missing or insufficient permissions"</em> because custom Web Crypto auth rules are waiting to be published in Firebase Console.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCloudStatusOpen(true)}
                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 transition shadow cursor-pointer"
              >
                <span>Publish Rules (4 Steps)</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                onClick={() => setIsNoticeDismissed(true)}
                className="px-2 py-1 rounded-lg text-slate-400 hover:text-slate-200 text-[11px] transition cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            transactions={transactions}
            onOpenReceipt={handleOpenReceipt}
            onOpenRefund={handleOpenRefund}
            onQueryTx={handleQueryTx}
            onNewPayment={handleOpenNewPayment}
            lang={lang}
          />
        )}

        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-rose-950/20 to-slate-950 border border-slate-800 text-center max-w-3xl mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-600 to-amber-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-pink-500/20">
                <Sparkles className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black text-white">
                {lang === 'bn' ? 'এমএফএস পেমেন্ট গেটওয়ে সিমুলেটর' : 'Interactive MFS Checkout Simulator'}
              </h2>
              <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
                {lang === 'bn'
                  ? 'বিকাশ ও নগদ এর একদম আসল মোবাইল চেকআউট ইন্টারফেস পরীক্ষা করুন — ফোন নম্বর যাচাই, ওটিপি এসএমএস কোড এবং পিন নম্বর ভেরিফিকেশন সহ।'
                  : 'Experience the authentic bKash (v2.0) and Nagad (PGW 1.0) customer checkout experience with automated SMS OTP simulation and PIN verification.'}
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setCheckoutParams({
                      wallet: 'bkash',
                      amount: 1450,
                      invoice: `INV-BK-${Date.now().toString().slice(-4)}`,
                      phone: '',
                    });
                    setIsCheckoutOpen(true);
                  }}
                  className="px-5 py-3 rounded-xl bg-[#E2136E] hover:bg-pink-600 text-white text-xs font-bold shadow-lg shadow-pink-600/30 transition transform hover:-translate-y-0.5"
                >
                  Launch bKash Checkout
                </button>

                <button
                  onClick={() => {
                    setCheckoutParams({
                      wallet: 'nagad',
                      amount: 2800,
                      invoice: `INV-NG-${Date.now().toString().slice(-4)}`,
                      phone: '',
                    });
                    setIsCheckoutOpen(true);
                  }}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#F7941D] to-[#ED1C24] hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-orange-600/30 transition transform hover:-translate-y-0.5"
                >
                  Launch Nagad Checkout
                </button>
              </div>
            </div>

            {/* Gateway Flow Architecture */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#E2136E]" />
                  <h4 className="font-bold text-white text-sm">bKash PGW Flow</h4>
                </div>
                <p className="text-xs text-slate-400">
                  Token grant &gt; Create payment (mode 0011) &gt; Customer phone verification &gt; OTP dispatch &gt; 5-digit PIN &gt; Execute payment &gt; Webhook notification.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#F7941D]" />
                  <h4 className="font-bold text-white text-sm">Nagad PGW Flow</h4>
                </div>
                <p className="text-xs text-slate-400">
                  Merchant sensitive encryption with RSA PKCS1 &gt; Challenge generation &gt; Nagad hosted checkout &gt; OTP & 4-digit PIN &gt; Verification &gt; Settlement ledger.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'storefront' && (
          <StorefrontView
            onTriggerCheckout={handleTriggerCheckoutFromStore}
            lang={lang}
          />
        )}

        {activeTab === 'playground' && (
          <ApiPlayground
            onOpenCheckoutWithData={(wallet, amount, invoice) => {
              setCheckoutParams({ wallet, amount, invoice, phone: '' });
              setIsCheckoutOpen(true);
            }}
            lang={lang}
          />
        )}

        {activeTab === 'invoicing' && (
          <InvoiceGeneratorView
            onPayInvoice={handlePayInvoice}
            lang={lang}
          />
        )}

        {activeTab === 'webhooks' && (
          <WebhookView webhooks={webhooks} lang={lang} />
        )}

        {activeTab === 'admin' && (
          <AdminPanelView transactions={transactions} lang={lang} />
        )}

        {activeTab === 'sdk' && (
          <CodeGeneratorView lang={lang} />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-5 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">PocketWallet</span>
            <span>• Unified MFS Gateway Architecture (bKash & Nagad)</span>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>PCI-DSS & MFS Compliant Simulator</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CheckoutSimulatorModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        walletType={checkoutParams.wallet}
        initialAmount={checkoutParams.amount}
        initialInvoice={checkoutParams.invoice}
        initialCustomerPhone={checkoutParams.phone}
        onSuccess={(trxId) => {
          // Success toast or receipt trigger
        }}
        lang={lang}
      />

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        transaction={receiptTx}
        lang={lang}
      />

      <RefundModal
        isOpen={isRefundOpen}
        onClose={() => setIsRefundOpen(false)}
        transaction={refundTx}
        onRefundCompleted={() => {
          setTransactions(walletEngine.getTransactions());
        }}
        lang={lang}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        lang={lang}
      />

      <AndroidApkModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
        lang={lang}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        lang={lang}
      />

      <CloudStatusModal
        isOpen={isCloudStatusOpen}
        onClose={() => setIsCloudStatusOpen(false)}
        lang={lang}
      />
    </div>
  );
}
