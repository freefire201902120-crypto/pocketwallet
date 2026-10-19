import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Smartphone,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Copy,
  ArrowRight,
  Clock,
  RotateCcw,
  Sparkles,
  Lock,
} from 'lucide-react';
import { WalletType, Language } from '../types/pocketwallet';
import { walletEngine } from '../services/walletEngine';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletType?: WalletType;
  initialAmount?: number;
  initialInvoice?: string;
  initialCustomerPhone?: string;
  onSuccess?: (trxId: string, paymentId: string) => void;
  lang?: Language;
}

export const CheckoutSimulatorModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  walletType: initialWallet = 'bkash',
  initialAmount = 500,
  initialInvoice,
  initialCustomerPhone = '',
  onSuccess,
  lang = 'en',
}) => {
  const [wallet, setWallet] = useState<WalletType>(initialWallet);
  const [amount, setAmount] = useState<number>(initialAmount);
  const [invoice, setInvoice] = useState<string>(
    initialInvoice || `INV-${Date.now().toString().slice(-6)}`
  );
  const [step, setStep] = useState<'config' | 'msisdn' | 'otp' | 'pin' | 'processing' | 'success' | 'failed'>('config');

  // Form states
  const [phone, setPhone] = useState(initialCustomerPhone);
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [showSmsToast, setShowSmsToast] = useState(false);
  const [otpTimer, setOtpTimer] = useState(30);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const isBkashReady = walletEngine.hasRealBkashCredentials();
  const isNagadReady = walletEngine.hasRealNagadCredentials();
  const isCurrentWalletReady = wallet === 'bkash' ? isBkashReady : isNagadReady;

  // Results
  const [paymentId, setPaymentId] = useState('');
  const [trxId, setTrxId] = useState('');
  const [completedTime, setCompletedTime] = useState('');

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setWallet(initialWallet);
      setAmount(initialAmount);
      setInvoice(initialInvoice || `INV-${Date.now().toString().slice(-6)}`);
      setPhone(initialCustomerPhone);
      setStep('config');
      setErrorMsg('');
      setOtp('');
      setPin('');
      setShowSmsToast(false);
    }
  }, [isOpen, initialWallet, initialAmount, initialInvoice, initialCustomerPhone]);

  // OTP Countdown timer
  useEffect(() => {
    let timer: any;
    if (step === 'otp' && otpTimer > 0) {
      timer = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, otpTimer]);

  if (!isOpen) return null;

  // Initiate Payment
  const handleStartPayment = async () => {
    try {
      setErrorMsg('');
      const res = await walletEngine.createPayment({
        walletType: wallet,
        amount: Number(amount),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: invoice,
        payerReference: phone,
      });
      setPaymentId(res.paymentID);
      setStep('msisdn');
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment initiation failed.');
    }
  };

  // Submit Phone Number -> Go to OTP
  const handleSubmitPhone = () => {
    if (!phone || phone.length < 11) {
      setErrorMsg(lang === 'bn' ? 'সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন' : 'Please enter a valid 11-digit mobile number');
      return;
    }
    setErrorMsg('');
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setOtpTimer(30);
    setStep('otp');

    // Simulate incoming SMS notification toast
    setTimeout(() => {
      setShowSmsToast(true);
    }, 600);
  };

  // Submit OTP -> Go to PIN
  const handleSubmitOtp = () => {
    if (!otp || otp.length < 4) {
      setErrorMsg(lang === 'bn' ? 'সঠিক ভেরিফিকেশন কোড লিখুন' : 'Please enter the verification code');
      return;
    }
    setErrorMsg('');
    setShowSmsToast(false);
    setStep('pin');
  };

  // Submit PIN -> Execute Payment
  const handleSubmitPin = async () => {
    if (!pin || pin.length < 4) {
      setErrorMsg(lang === 'bn' ? 'সঠিক পিন নম্বর দিন' : 'Please enter valid PIN');
      return;
    }

    setStep('processing');
    setErrorMsg('');

    try {
      const res = await walletEngine.executePayment({
        walletType: wallet,
        paymentID: paymentId,
        customerMsisdn: phone,
        otp,
        pin,
      });

      setTrxId(res.trxID);
      setCompletedTime(res.paymentExecuteTime);
      setStep('success');
      if (onSuccess) {
        onSuccess(res.trxID, res.paymentID);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment execution failed');
      setStep('failed');
    }
  };

  // Quick Preset Phone Numbers
  const setPresetPhone = (num: string) => {
    setPhone(num);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      {/* Simulated SMS Toast for OTP */}
      {showSmsToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[60] w-11/12 max-w-md bg-slate-900 text-white rounded-xl shadow-2xl border border-pink-500/40 p-3.5 flex items-start gap-3 animate-bounce">
          <div className="p-2 rounded-lg bg-pink-600/30 text-pink-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between font-semibold text-slate-200">
              <span>{wallet === 'bkash' ? 'bKash Security' : 'Nagad Auth'}</span>
              <span className="text-[10px] text-slate-400">Just now</span>
            </div>
            <p className="mt-1 text-slate-300">
              Your {wallet.toUpperCase()} verification code is <strong className="text-pink-400 font-mono text-sm tracking-wider">{generatedOtp}</strong>. Do not share this with anyone.
            </p>
            <button
              onClick={() => {
                setOtp(generatedOtp);
                setShowSmsToast(false);
              }}
              className="mt-2 text-[11px] font-bold text-pink-400 hover:text-pink-300 flex items-center gap-1"
            >
              <Copy className="w-3 h-3" /> Auto-fill {generatedOtp}
            </button>
          </div>
          <button
            onClick={() => setShowSmsToast(false)}
            className="text-slate-500 hover:text-slate-300 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Modal Card */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden transition-all my-8">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-200 uppercase tracking-wider">
              PocketWallet Unified Gateway Emulator
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP 0: Payment Configuration / Initializer */}
        {step === 'config' && (
          <div className="p-6 space-y-5">
            <div className="text-center">
              <h3 className="text-lg font-bold text-white">
                {lang === 'bn' ? 'পেমেন্ট গেটওয়ে সিমুলেটর শুরু করুন' : 'Launch MFS Checkout Simulator'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'bn'
                  ? 'বিকাশ অথবা নগদ সিলেক্ট করে আসল পেমেন্ট ফ্লো পরীক্ষা করুন'
                  : 'Test the real-world customer payment journey for bKash or Nagad'}
              </p>
            </div>

            {/* Wallet Selector Tabs */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setWallet('bkash')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${
                  wallet === 'bkash'
                    ? 'border-[#E2136E] bg-pink-500/10 shadow-lg shadow-pink-500/10'
                    : 'border-slate-800 bg-slate-850 hover:border-slate-700 opacity-60'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-[#E2136E] flex items-center justify-center text-white font-black text-xl shadow">
                  bK
                </div>
                <div className="text-center">
                  <div className="font-bold text-white text-sm">bKash PGW</div>
                  <div className="text-[11px] text-pink-400">Tokenized v2.0</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setWallet('nagad')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${
                  wallet === 'nagad'
                    ? 'border-[#F7941D] bg-amber-500/10 shadow-lg shadow-amber-500/10'
                    : 'border-slate-800 bg-slate-850 hover:border-slate-700 opacity-60'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F7941D] to-[#ED1C24] flex items-center justify-center text-white font-black text-xl shadow">
                  নগদ
                </div>
                <div className="text-center">
                  <div className="font-bold text-white text-sm">Nagad PGW</div>
                  <div className="text-[11px] text-amber-400">Public/Private Key 1.0</div>
                </div>
              </button>
            </div>

            {/* Amount & Invoice form */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {lang === 'bn' ? 'পেমেন্টের পরিমাণ (টাকা ৳)' : 'Payment Amount (BDT ৳)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">৳</span>
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-white font-mono font-semibold focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {lang === 'bn' ? 'মার্চেন্ট ইনভয়েস নম্বর' : 'Merchant Invoice Reference'}
                </label>
                <input
                  type="text"
                  value={invoice}
                  onChange={(e) => setInvoice(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {lang === 'bn' ? 'গ্রাহকের ফোন নম্বর' : 'Customer Phone Number'}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            {/* Gateway Credential Status Banner */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                isCurrentWalletReady
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isCurrentWalletReady ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span className="font-semibold">
                  {isCurrentWalletReady
                    ? `🟢 Real ${wallet.toUpperCase()} Merchant Gateway Active`
                    : `⚠️ ${wallet.toUpperCase()} Credentials Missing: Configure in Settings for real money`}
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              onClick={handleStartPayment}
              className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition flex items-center justify-center gap-2 ${
                wallet === 'bkash'
                  ? 'bg-gradient-to-r from-[#D12053] to-[#E2136E] hover:opacity-95 shadow-pink-500/25'
                  : 'bg-gradient-to-r from-[#F7941D] to-[#ED1C24] hover:opacity-95 shadow-orange-500/25'
              }`}
            >
              <span>{lang === 'bn' ? 'পেমেন্ট চেকআউট লোড করুন' : 'Launch Customer Checkout'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* BKASH AUTHENTIC CHECKOUT UI */}
        {/* ======================================================== */}
        {wallet === 'bkash' && (step === 'msisdn' || step === 'otp' || step === 'pin') && (
          <div className="bg-white text-slate-800">
            {/* bKash Header Banner */}
            <div className="bg-[#E2136E] text-white p-4 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white text-[#E2136E] font-black flex items-center justify-center text-sm shadow">
                  bK
                </div>
                <div>
                  <div className="text-[11px] font-medium tracking-wide uppercase text-pink-100">
                    PocketWallet Merchant
                  </div>
                  <div className="text-xs font-mono text-pink-200">
                    Inv: {invoice}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-pink-200">Amount</div>
                <div className="text-lg font-black font-mono">৳ {amount.toLocaleString()}</div>
              </div>
            </div>

            {/* bKash Body */}
            <div className="p-6">
              {/* STAGE 1: Enter bKash Phone */}
              {step === 'msisdn' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-900">
                      Your bKash Account Number
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Enter the 11 digit account number
                    </p>
                  </div>

                  <div>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">🇧🇩 +88</span>
                      <input
                        type="tel"
                        maxLength={11}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full pl-20 pr-4 py-2.5 text-center text-base font-mono font-bold tracking-widest border-2 border-slate-300 rounded-lg focus:outline-none focus:border-[#E2136E]"
                      />
                    </div>
                  </div>

                  <div className="text-center text-[11px] text-slate-500">
                    By clicking Confirm, you agree to the <span className="text-[#E2136E] underline cursor-pointer">terms & conditions</span>.
                  </div>

                  {errorMsg && (
                    <div className="p-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded text-center">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep('config')}
                      className="py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitPhone}
                      className="py-2.5 rounded-lg bg-[#E2136E] text-white font-bold text-xs hover:bg-[#c90f5f] shadow"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 2: Enter OTP */}
              {step === 'otp' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-900">
                      bKash Verification Code
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Enter the 6 digit code sent to <strong className="text-slate-800">{phone}</strong>
                    </p>
                  </div>

                  <div>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="• • • • • •"
                      className="w-full text-center text-xl font-mono font-bold tracking-widest border-2 border-slate-300 rounded-lg py-2.5 focus:outline-none focus:border-[#E2136E]"
                    />

                    <div className="flex items-center justify-between text-xs text-slate-500 mt-2 px-1">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Resend in {otpTimer}s</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newCode = Math.floor(100000 + Math.random() * 900000).toString();
                          setGeneratedOtp(newCode);
                          setOtpTimer(30);
                          setShowSmsToast(true);
                        }}
                        disabled={otpTimer > 0}
                        className={`text-[11px] font-semibold ${
                          otpTimer > 0 ? 'text-slate-300 cursor-not-allowed' : 'text-[#E2136E] hover:underline'
                        }`}
                      >
                        Resend Code
                      </button>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded text-center">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep('msisdn')}
                      className="py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitOtp}
                      className="py-2.5 rounded-lg bg-[#E2136E] text-white font-bold text-xs hover:bg-[#c90f5f] shadow"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 3: Enter PIN */}
              {step === 'pin' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-900">
                      Enter bKash PIN
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Enter your 5 digit bKash account PIN
                    </p>
                  </div>

                  <div className="relative">
                    <input
                      type="password"
                      maxLength={5}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="• • • • •"
                      className="w-full text-center text-2xl font-mono font-bold tracking-widest border-2 border-slate-300 rounded-lg py-2.5 focus:outline-none focus:border-[#E2136E]"
                    />
                    <div className="text-center text-[10px] text-slate-400 mt-2 flex items-center justify-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>{isBkashReady ? 'Secure MFS Execution: Encrypted bKash 5-digit PIN' : 'Encrypted PIN verification for bKash payment execution'}</span>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded text-center">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep('otp')}
                      className="py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitPin}
                      className="py-2.5 rounded-lg bg-[#E2136E] text-white font-bold text-xs hover:bg-[#c90f5f] shadow"
                    >
                      Confirm Payment
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* bKash Footer Contact Bar */}
            <div className="bg-slate-100 px-4 py-2.5 border-t border-slate-200 text-center text-[11px] text-slate-500">
              Dial 16247 for bKash Support • 24/7 Helpline
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* NAGAD AUTHENTIC CHECKOUT UI */}
        {/* ======================================================== */}
        {wallet === 'nagad' && (step === 'msisdn' || step === 'otp' || step === 'pin') && (
          <div className="bg-white text-slate-800">
            {/* Nagad Header Banner */}
            <div className="bg-gradient-to-r from-[#F7941D] to-[#ED1C24] text-white p-4 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white text-[#F7941D] font-black flex items-center justify-center text-sm shadow">
                  নগদ
                </div>
                <div>
                  <div className="text-[11px] font-medium tracking-wide uppercase text-amber-100">
                    PocketWallet Merchant
                  </div>
                  <div className="text-xs font-mono text-amber-200">
                    Ref: {invoice}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-amber-200">Total BDT</div>
                <div className="text-lg font-black font-mono">৳ {amount.toLocaleString()}</div>
              </div>
            </div>

            {/* Nagad Body */}
            <div className="p-6">
              {step === 'msisdn' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-900">
                      Your Nagad Account Number
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Please enter your active Nagad wallet number
                    </p>
                  </div>

                  <div>
                    <input
                      type="tel"
                      maxLength={11}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full text-center text-base font-mono font-bold tracking-widest border-2 border-slate-300 rounded-lg py-2.5 focus:outline-none focus:border-[#F7941D]"
                    />

                    </div>

                  <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span>I agree to the terms and conditions of Nagad Payment Gateway.</span>
                  </label>

                  {errorMsg && (
                    <div className="p-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded text-center">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep('config')}
                      className="py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitPhone}
                      disabled={!agreeTerms}
                      className="py-2.5 rounded-lg bg-gradient-to-r from-[#F7941D] to-[#ED1C24] text-white font-bold text-xs hover:opacity-95 shadow disabled:opacity-50"
                    >
                      Proceed
                    </button>
                  </div>
                </div>
              )}

              {step === 'otp' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-900">
                      Nagad Verification Code (OTP)
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      OTP sent to <strong className="text-slate-800">{phone}</strong>
                    </p>
                  </div>

                  <div>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="• • • • • •"
                      className="w-full text-center text-xl font-mono font-bold tracking-widest border-2 border-slate-300 rounded-lg py-2.5 focus:outline-none focus:border-[#F7941D]"
                    />

                    <div className="flex items-center justify-between text-xs text-slate-500 mt-2 px-1">
                      <span className="text-[11px]">Expires in {otpTimer}s</span>
                      <button
                        type="button"
                        onClick={() => {
                          const newCode = Math.floor(100000 + Math.random() * 900000).toString();
                          setGeneratedOtp(newCode);
                          setOtpTimer(30);
                          setShowSmsToast(true);
                        }}
                        disabled={otpTimer > 0}
                        className={`text-[11px] font-semibold ${
                          otpTimer > 0 ? 'text-slate-300 cursor-not-allowed' : 'text-orange-600 hover:underline'
                        }`}
                      >
                        Resend OTP
                      </button>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded text-center">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep('msisdn')}
                      className="py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitOtp}
                      className="py-2.5 rounded-lg bg-gradient-to-r from-[#F7941D] to-[#ED1C24] text-white font-bold text-xs hover:opacity-95 shadow"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              )}

              {step === 'pin' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-900">
                      Enter Nagad PIN
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Enter your 4 digit confidential PIN
                    </p>
                  </div>

                  <div>
                    <input
                      type="password"
                      maxLength={4}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="• • • •"
                      className="w-full text-center text-2xl font-mono font-bold tracking-widest border-2 border-slate-300 rounded-lg py-2.5 focus:outline-none focus:border-[#F7941D]"
                    />
                    <div className="text-center text-[10px] text-slate-400 mt-2 flex items-center justify-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>{isNagadReady ? 'Secure MFS Execution: Encrypted Nagad 4-digit PIN' : 'Encrypted PIN verification for Nagad payment execution'}</span>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded text-center">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep('otp')}
                      className="py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitPin}
                      className="py-2.5 rounded-lg bg-gradient-to-r from-[#F7941D] to-[#ED1C24] text-white font-bold text-xs hover:opacity-95 shadow"
                    >
                      Pay Now
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-100 px-4 py-2.5 border-t border-slate-200 text-center text-[11px] text-slate-500">
              Dial 16167 for Nagad Help • ডাক বিভাগের ডিজিটাল লেনদেন
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PROCESSING LOADER */}
        {/* ======================================================== */}
        {step === 'processing' && (
          <div className="p-10 text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto">
              <div
                className={`w-16 h-16 rounded-full border-4 border-t-transparent animate-spin ${
                  wallet === 'bkash' ? 'border-[#E2136E]' : 'border-[#F7941D]'
                }`}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Shield className="w-6 h-6 text-slate-400" />
              </div>
            </div>
            <div>
              <h4 className="text-base font-bold text-white">
                {lang === 'bn' ? 'পেমেন্ট প্রক্রিয়াধীন...' : 'Processing Transaction...'}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Executing payment with {wallet.toUpperCase()} MFS network and recording in ledger
              </p>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SUCCESS CONFIRMATION */}
        {/* ======================================================== */}
        {step === 'success' && (
          <div className="p-6 space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Payment Completed
              </span>
              <h3 className="text-xl font-black text-white mt-2">
                ৳ {amount.toLocaleString()} BDT
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Paid via {wallet.toUpperCase()} to PocketWallet Merchant
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left text-xs space-y-2.5 font-mono">
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Transaction ID (TrxID)</span>
                <span className="text-emerald-400 font-bold">{trxId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Payment ID</span>
                <span className="text-slate-300">{paymentId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Invoice Number</span>
                <span className="text-slate-300">{invoice}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Payer Mobile</span>
                <span className="text-slate-300">{phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Executed At</span>
                <span className="text-slate-300">{new Date(completedTime).toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* FAILED VIEW */}
        {step === 'failed' && (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto">
              <AlertCircle className="w-9 h-9" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Payment Failed</h3>
              <p className="text-xs text-rose-400 mt-1">{errorMsg || 'Unable to execute transaction.'}</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep('config')}
                className="w-full py-2.5 rounded-xl bg-slate-800 text-white text-xs font-semibold"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-700 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
