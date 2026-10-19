import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  Phone,
  Building2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { AdminRole, AppUser, Language } from '../types/pocketwallet';
import { walletEngine } from '../services/walletEngine';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
  onLoginSuccess?: (user: AppUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  lang = 'en',
  onLoginSuccess,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const currentUser = walletEngine.getCurrentUser();

  // Sign In state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regBusiness, setRegBusiness] = useState('');
  const [regRole, setRegRole] = useState<AdminRole>('merchant');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Status
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginEmail.trim() || !loginPassword) {
      setErrorMsg(lang === 'bn' ? 'ইমেইল এবং পাসওয়ার্ড প্রদান করুন' : 'Please provide both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await walletEngine.loginUser(loginEmail, loginPassword);
      setSuccessMsg(
        lang === 'bn'
          ? `স্বাগতম, ${user.name}! সফলভাবে লগইন সম্পন্ন হয়েছে।`
          : `Welcome back, ${user.name}! Signed in successfully.`
      );
      if (onLoginSuccess) onLoginSuccess(user);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword) {
      setErrorMsg(lang === 'bn' ? 'দয়া করে সমস্ত তথ্য পূরণ করুন' : 'Please fill in all required fields.');
      return;
    }

    if (regPassword.length < 8) {
      setErrorMsg(lang === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে' : 'Password must be at least 8 characters.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg(lang === 'bn' ? 'পাসওয়ার্ড দুটি মেলেনি' : 'Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newUser = await walletEngine.registerUser({
        name: regName,
        email: regEmail,
        phone: regPhone,
        businessName: regBusiness || 'Merchant Organization',
        role: regRole,
        passwordPlain: regPassword,
      });

      setSuccessMsg(
        lang === 'bn'
          ? `অভিনন্দন! আপনার ${newUser.role.toUpperCase()} অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।`
          : `Account created successfully! Logged in as ${newUser.role.toUpperCase()}.`
      );

      if (onLoginSuccess) onLoginSuccess(newUser);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    walletEngine.logoutUser();
    setSuccessMsg(lang === 'bn' ? 'সফলভাবে লগআউট হয়েছে' : 'Signed out successfully.');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {currentUser
                  ? (lang === 'bn' ? 'ব্যবহারকারী প্রোফাইল' : 'User Account Profile')
                  : mode === 'signin'
                  ? (lang === 'bn' ? 'অ্যাকাউন্টে সাইন-ইন করুন' : 'Sign In to PocketWallet')
                  : (lang === 'bn' ? 'নতুন অ্যাকাউন্ট নিবন্ধন' : 'Create Real Account')}
              </h3>
              <p className="text-[11px] text-slate-400">
                {currentUser
                  ? 'Active session synchronized with Firebase Firestore'
                  : 'Real user authentication with SHA-256 password protection'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ALREADY LOGGED IN VIEW */}
        {currentUser ? (
          <div className="p-6 space-y-5 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 text-sm">{currentUser.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-pink-500/10 text-pink-400 border border-pink-500/30">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-1.5 text-slate-400 font-mono">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{currentUser.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{currentUser.phone || 'No phone set'}</span>
                </div>
                {currentUser.businessName && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>{currentUser.businessName}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Wallet Balance</div>
                <div className="text-base font-black text-emerald-400 font-mono mt-0.5">
                  ৳ {currentUser.balance.toLocaleString()}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Account Status</div>
                <div className="text-base font-bold text-slate-200 capitalize mt-0.5 flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{currentUser.status}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold transition flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>{lang === 'bn' ? 'সাইন আউট করুন' : 'Sign Out Account'}</span>
              </button>
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
              >
                {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Mode Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950/60">
              <button
                onClick={() => {
                  setMode('signin');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition ${
                  mode === 'signin'
                    ? 'border-pink-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === 'bn' ? 'সাইন ইন (Sign In)' : 'Sign In'}
              </button>
              <button
                onClick={() => {
                  setMode('register');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition ${
                  mode === 'register'
                    ? 'border-pink-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === 'bn' ? 'নতুন অ্যাকাউন্ট (Register)' : 'Register New Account'}
              </button>
            </div>

            {/* Notification messages */}
            {errorMsg && (
              <div className="m-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="m-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* SIGN IN FORM */}
            {mode === 'signin' && (
              <form onSubmit={handleSignIn} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {lang === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="merchant@example.com"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white font-mono focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {lang === 'bn' ? 'নিরাপদ পাসওয়ার্ড' : 'Secure Password'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-10 py-2 text-white font-mono focus:outline-none focus:border-pink-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold transition shadow-md shadow-pink-600/30 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Authenticating...' : (lang === 'bn' ? 'সাইন ইন করুন' : 'Sign In')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* REGISTER FORM */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} className="p-6 space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {lang === 'bn' ? 'পূর্ণ নাম' : 'Full Name'} *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Tanvir Ahmed"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      {lang === 'bn' ? 'ইমেইল' : 'Email'} *
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="user@domain.com"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      {lang === 'bn' ? 'মোবাইল নম্বর' : 'Phone'} *
                    </label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      {lang === 'bn' ? 'ব্যবসার নাম' : 'Business Name'}
                    </label>
                    <input
                      type="text"
                      value={regBusiness}
                      onChange={(e) => setRegBusiness(e.target.value)}
                      placeholder="Store / Company"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-[11px] focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      {lang === 'bn' ? 'অ্যাকাউন্টের ধরন' : 'Account Role'}
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as AdminRole)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-[11px] focus:outline-none focus:border-pink-500"
                    >
                      <option value="merchant">Merchant (মার্চেন্ট)</option>
                      <option value="viewer">Viewer (দর্শক / অডিটর)</option>
                      <option value="admin">Operations Admin</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {lang === 'bn' ? 'পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)' : 'Password (min 8 characters)'} *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-10 py-2 text-white font-mono focus:outline-none focus:border-pink-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {lang === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'} *
                  </label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-pink-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold transition shadow-md shadow-pink-600/30 flex items-center justify-center gap-1.5 disabled:opacity-50 mt-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSubmitting ? 'Registering...' : (lang === 'bn' ? 'অ্যাকাউন্ট তৈরি করুন' : 'Register Account')}</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
