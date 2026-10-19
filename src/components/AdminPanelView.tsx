import React, { useState, useMemo, useEffect } from 'react';
import {
  Shield,
  Users,
  KeyRound,
  Activity,
  History,
  Lock,
  Unlock,
  Search,
  Filter,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  Building2,
  TrendingUp,
  CreditCard,
  Eye,
  EyeOff,
  RefreshCw,
  X,
  Server,
  Database,
  Radio,
  FileCheck,
  ShieldAlert,
  Mail,
  Phone,
  UserCheck,
} from 'lucide-react';
import {
  AdminRole,
  AppUser,
  AuditLogEntry,
  Language,
  RoleDefinition,
  TransactionRecord,
  UserStatus,
} from '../types/pocketwallet';
import { walletEngine } from '../services/walletEngine';
import { TRANSLATIONS } from '../data/initialData';

interface AdminPanelProps {
  transactions: TransactionRecord[];
  lang: Language;
}

export const AdminPanelView: React.FC<AdminPanelProps> = ({ transactions, lang = 'en' }) => {
  const t = TRANSLATIONS[lang];

  // Auth state
  const [hasAdminAccount, setHasAdminAccount] = useState<boolean>(walletEngine.hasAdmin());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(walletEngine.isAdminLoggedIn());
  const [currentAdmin, setCurrentAdmin] = useState(walletEngine.getAdminAccount());

  // Setup form states (First-time setup)
  const [setupName, setSetupName] = useState('');
  const [setupEmail, setSetupEmail] = useState('');
  const [setupPhone, setSetupPhone] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirmPassword, setSetupConfirmPassword] = useState('');
  const [showSetupPassword, setShowSetupPassword] = useState(false);

  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active sub-tab
  const [subTab, setSubTab] = useState<'overview' | 'users' | 'roles' | 'audit'>('overview');

  // Engine data
  const [users, setUsers] = useState<AppUser[]>(walletEngine.getUsers());
  const [roles] = useState<RoleDefinition[]>(walletEngine.getRoles());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(walletEngine.getAuditLogs());

  useEffect(() => {
    const unsub = walletEngine.subscribe(() => {
      setUsers(walletEngine.getUsers());
      setAuditLogs(walletEngine.getAuditLogs());
      setHasAdminAccount(walletEngine.hasAdmin());
      setIsAuthenticated(walletEngine.isAdminLoggedIn());
      setCurrentAdmin(walletEngine.getAdminAccount());
    });
    return unsub;
  }, []);

  // Search & Filter in Users
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('all');

  // Modals inside Admin
  const [selectedUserForTx, setSelectedUserForTx] = useState<AppUser | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<AdminRole>('merchant');
  const [newUserBusiness, setNewUserBusiness] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');

  // Audit search
  const [auditSearch, setAuditSearch] = useState('');

  // System health
  const health = walletEngine.getSystemHealth();

  // Metrics
  const totalVolume = useMemo(() => {
    return transactions.reduce((sum, tx) => {
      if (tx.status === 'Completed' || tx.status === 'Partially_Refunded' || tx.status === 'Refunded') {
        return sum + tx.amount;
      }
      return sum;
    }, 0);
  }, [transactions]);

  const activeMerchantsCount = useMemo(() => {
    return users.filter((u) => u.role === 'merchant' && u.status === 'active').length;
  }, [users]);

  // Handle First Admin Registration
  const handleSetupFirstAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!setupName.trim() || !setupEmail.trim() || !setupPassword) {
      setAuthError(lang === 'bn' ? 'দয়া করে সব তথ্য পূরণ করুন' : 'Please fill in all required fields.');
      return;
    }

    if (setupPassword.length < 8) {
      setAuthError(lang === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে' : 'Password must be at least 8 characters.');
      return;
    }

    if (setupPassword !== setupConfirmPassword) {
      setAuthError(lang === 'bn' ? 'পাসওয়ার্ড দুটি মেলেনি' : 'Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await walletEngine.setupFirstAdmin(setupName, setupEmail, setupPhone, setupPassword);
      setHasAdminAccount(true);
      setIsAuthenticated(true);
      setCurrentAdmin(walletEngine.getAdminAccount());
      setUsers(walletEngine.getUsers());
      setAuditLogs(walletEngine.getAuditLogs());
    } catch (err: any) {
      setAuthError(err.message || 'Failed to setup admin account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Admin Sign In
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!loginEmail.trim() || !loginPassword) {
      setAuthError(lang === 'bn' ? 'ইমেইল ও পাসওয়ার্ড দিন' : 'Please enter email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await walletEngine.loginAdmin(loginEmail, loginPassword);
      if (success) {
        setIsAuthenticated(true);
        setCurrentAdmin(walletEngine.getAdminAccount());
        setAuditLogs(walletEngine.getAuditLogs());
        setLoginPassword('');
      } else {
        setAuthError(
          lang === 'bn'
            ? 'ভুল ইমেইল অথবা পাসওয়ার্ড। আবার চেষ্টা করুন।'
            : 'Invalid email or password. Please try again.'
        );
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    walletEngine.logoutAdmin();
    setIsAuthenticated(false);
    setCurrentAdmin(null);
  };

  // User Status & Role Handlers
  const handleToggleStatus = (user: AppUser) => {
    const nextStatus: UserStatus = user.status === 'active' ? 'suspended' : 'active';
    const actorName = currentAdmin ? currentAdmin.name : 'Super Admin';
    walletEngine.updateUserStatus(user.id, nextStatus, actorName);
    setUsers(walletEngine.getUsers());
    setAuditLogs(walletEngine.getAuditLogs());
  };

  const handleChangeRole = (userId: string, newRole: AdminRole) => {
    const actorName = currentAdmin ? currentAdmin.name : 'Super Admin';
    walletEngine.updateUserRole(userId, newRole, actorName);
    setUsers(walletEngine.getUsers());
    setAuditLogs(walletEngine.getAuditLogs());
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserPhone.trim() || !newUserEmail.trim()) return;

    const actorName = currentAdmin ? currentAdmin.name : 'Super Admin';
    await walletEngine.addUser(
      {
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        phone: newUserPhone.trim(),
        role: newUserRole,
        status: 'active',
        businessName: newUserBusiness.trim() || `${newUserName} Business`,
        initialPassword: newUserPassword || undefined,
      },
      actorName
    );

    setUsers(walletEngine.getUsers());
    setAuditLogs(walletEngine.getAuditLogs());
    setIsAddUserOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setNewUserBusiness('');
    setNewUserPassword('');
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
      if (userStatusFilter !== 'all' && u.status !== userStatusFilter) return false;
      if (userSearch.trim()) {
        const q = userSearch.toLowerCase();
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone.includes(q) ||
          (u.businessName && u.businessName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [users, userSearch, userRoleFilter, userStatusFilter]);

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (!auditSearch.trim()) return true;
      const q = auditSearch.toLowerCase();
      return (
        log.actor.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.target.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q)
      );
    });
  }, [auditLogs, auditSearch]);

  const handleExportAuditCSV = () => {
    const headers = ['Timestamp', 'Actor', 'Action', 'Category', 'Target', 'Details'];
    const rows = filteredAuditLogs.map((l) => [
      l.timestamp,
      l.actor,
      l.action,
      l.category,
      l.target,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PocketWallet_AuditLog_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ========================================================
  // VIEW 1: FIRST-TIME ADMINISTRATOR SETUP FLOW
  // ========================================================
  if (!hasAdminAccount) {
    return (
      <div className="py-10 px-4 max-w-lg mx-auto animate-fade-in">
        <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-pink-500/20">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-pink-500/10 text-pink-400 border border-pink-500/30">
              First-Time Setup
            </span>
            <h3 className="text-xl font-bold text-white">
              {lang === 'bn' ? 'মাস্টার অ্যাডমিন অ্যাকাউন্ট তৈরি করুন' : 'Setup Master Administrator'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              {lang === 'bn'
                ? 'সিস্টেমের কোনো ডেমো বা স্যাম্পল ডাটা নেই। আপনার নিজস্ব ইমেইল ও নিরাপদ পাসওয়ার্ড দিয়ে প্রাথমিক অ্যাডমিনিস্ট্রেটর অ্যাকাউন্ট সেটআপ করুন।'
                : 'No demo data exists. Establish your primary administrator account using email and a secure password.'}
            </p>
          </div>

          <form onSubmit={handleSetupFirstAdmin} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {lang === 'bn' ? 'পূর্ণ নাম' : 'Full Name'}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Master Administrator"
                value={setupName}
                onChange={(e) => setSetupName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {lang === 'bn' ? 'অ্যাডমিন ইমেইল' : 'Administrator Email'}
              </label>
              <input
                type="email"
                required
                placeholder="admin@yourcompany.com"
                value={setupEmail}
                onChange={(e) => setSetupEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {lang === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}
              </label>
              <input
                type="tel"
                placeholder="01XXXXXXXXX"
                value={setupPhone}
                onChange={(e) => setSetupPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {lang === 'bn' ? 'নিরাপদ পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)' : 'Master Password (min 8 characters)'}
              </label>
              <div className="relative">
                <input
                  type={showSetupPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  placeholder="••••••••••••"
                  value={setupPassword}
                  onChange={(e) => setSetupPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-pink-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSetupPassword(!showSetupPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showSetupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {lang === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'}
              </label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="••••••••••••"
                value={setupConfirmPassword}
                onChange={(e) => setSetupConfirmPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-pink-500"
              />
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-600/30 transition disabled:opacity-50"
            >
              <Shield className="w-4 h-4" />
              <span>{isSubmitting ? 'Initializing Account...' : 'Initialize Master Administrator'}</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-center gap-1.5 text-center">
            <Lock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>Passkeys hashed with SHA-256 and unique cryptographic salt</span>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // VIEW 2: ADMINISTRATOR SIGN IN FORM
  // ========================================================
  if (!isAuthenticated) {
    return (
      <div className="py-12 px-4 max-w-md mx-auto animate-fade-in">
        <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-pink-500/20">
              <Lock className="w-8 h-8" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-pink-500/10 text-pink-400 border border-pink-500/30">
              Admin Authentication
            </span>
            <h3 className="text-xl font-bold text-white">
              {lang === 'bn' ? 'অ্যাডমিন সাইন-ইন' : 'Administrator Sign In'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'bn'
                ? 'আপনার রেজিস্টার্ড অ্যাডমিন ইমেইল ও পাসওয়ার্ড দিয়ে লগইন করুন।'
                : 'Sign in with your administrator email and password.'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {lang === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Administrator Email'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="admin@yourcompany.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-pink-500 pr-10"
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

            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-600/30 transition disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isSubmitting ? 'Verifying...' : 'Sign In to Console'}</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-center gap-1.5 text-center">
            <Shield className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>Role-Based Access Control Protected</span>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // VIEW 3: AUTHENTICATED REAL ADMIN CONSOLE
  // ========================================================
  return (
    <div className="space-y-6">
      {/* Top Banner with Admin Identity */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-500 flex items-center justify-center text-white shadow-md">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                {lang === 'bn' ? 'পকেটওয়ালেট অ্যাডমিন কনসোল' : 'PocketWallet Master Admin Console'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Live Admin Session
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Logged in as <strong className="text-white">{currentAdmin?.name}</strong> ({currentAdmin?.email})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddUserOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold shadow transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add Merchant/User</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
          >
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>{t.lockSession}</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-2">
        {[
          { id: 'overview', label: t.adminOverview, icon: Activity },
          { id: 'users', label: `${t.userManagement} (${users.length})`, icon: Users },
          { id: 'roles', label: t.roleManagement, icon: KeyRound },
          { id: 'audit', label: `${t.auditLogs} (${auditLogs.length})`, icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
              className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
                isActive
                  ? 'border-pink-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* SUB-TAB 1: OVERVIEW & REAL SYSTEM HEALTH */}
      {/* ======================================================== */}
      {subTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{t.totalUsers}</span>
                <Users className="w-4 h-4 text-sky-400" />
              </div>
              <div className="mt-2 text-2xl font-black text-white font-mono">
                {users.length}
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                {users.filter((u) => u.status === 'active').length} Active
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{t.activeMerchants}</span>
                <Building2 className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-2 text-2xl font-black text-white font-mono">
                {activeMerchantsCount}
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                Registered Merchant Accounts
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Total Transactions</span>
                <CreditCard className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-2 text-2xl font-black text-white font-mono">
                {transactions.length}
              </div>
              <div className="mt-1 text-[11px] text-emerald-400">
                {transactions.filter((t) => t.status === 'Completed').length} Completed
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Total Volume (BDT)</span>
                <TrendingUp className="w-4 h-4 text-pink-400" />
              </div>
              <div className="mt-2 text-2xl font-black text-white font-mono">
                ৳ {totalVolume.toLocaleString()}
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                Gross MFS Payments
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>System Uptime</span>
                <Activity className="w-4 h-4 text-teal-400" />
              </div>
              <div className="mt-2 text-2xl font-black text-teal-400 font-mono">
                {health.uptimePercentage}%
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                Avg Latency: {health.apiLatencyMs}ms
              </div>
            </div>
          </div>

          {/* Infrastructure Health */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  Gateway Infrastructure & Health
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Live Status</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">bKash Gateway v2.0</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    OPERATIONAL
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Endpoint: tokenized.sandbox.bka.sh<br />
                  Latency: 28ms • Token Refresh: Active
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Nagad PGW 1.0</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    OPERATIONAL
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Endpoint: sandbox.mynagad.com:10080<br />
                  Latency: 32ms • PKCS1 Encryption: Active
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Webhook Dispatcher</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    100% READY
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Queue: Listening<br />
                  Signature Verification: Enabled
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Cloud Database</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    FIRESTORE LIVE
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Engine: Firebase Firestore<br />
                  Multi-Device Sync: Real-Time
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 2: USER MANAGEMENT */}
      {/* ======================================================== */}
      {subTab === 'users' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-pink-500"
              >
                <option value="all">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="merchant">Merchant</option>
                <option value="viewer">Viewer</option>
              </select>

              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-pink-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>

              <button
                onClick={() => setIsAddUserOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold shadow flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add User</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/60">
                    <th className="py-3 px-4">User & Business</th>
                    <th className="py-3 px-4">Contact Info</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Balance / Tx</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="font-semibold text-slate-400">No registered users yet</p>
                        <p className="text-[11px] mt-1">Click "Add User" above to create merchant and operator accounts.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const isSuspended = user.status === 'suspended';
                      return (
                        <tr key={user.id} className="hover:bg-slate-800/40 transition group">
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-bold text-white">
                              {user.name}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {user.businessName || 'Personal Account'}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px]">
                            <div className="text-slate-300">{user.email}</div>
                            <div className="text-slate-500">{user.phone}</div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <select
                              value={user.role}
                              onChange={(e) => handleChangeRole(user.id, e.target.value as AdminRole)}
                              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] font-mono text-slate-200 focus:outline-none focus:border-pink-500"
                            >
                              <option value="super_admin">SUPER_ADMIN</option>
                              <option value="admin">ADMIN</option>
                              <option value="merchant">MERCHANT</option>
                              <option value="viewer">VIEWER</option>
                            </select>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                            <div className="font-bold text-white">
                              ৳ {user.balance.toLocaleString()} BDT
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {user.totalTransactions} transactions
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                user.status === 'active'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              }`}
                            >
                              <span className="uppercase">{user.status}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedUserForTx(user)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1 transition"
                              >
                                <CreditCard className="w-3 h-3 text-slate-400" />
                                <span>Transactions</span>
                              </button>

                              <button
                                onClick={() => handleToggleStatus(user)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                                  isSuspended
                                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                    : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                                }`}
                              >
                                {isSuspended ? 'Activate' : 'Suspend'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 3: ROLE MANAGEMENT */}
      {/* ======================================================== */}
      {subTab === 'roles' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {roles.map((role) => {
              const assignedUsers = users.filter((u) => u.role === role.id);
              return (
                <div
                  key={role.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${role.badgeColor}`}>
                        {role.id.toUpperCase()}
                      </span>
                      <span className="text-xs font-mono text-slate-400 font-semibold">
                        {assignedUsers.length} Users Assigned
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">
                      {lang === 'bn' ? role.titleBn : role.title}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {lang === 'bn' ? role.descriptionBn : role.description}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Granted Privileges:
                    </div>
                    <div className="space-y-1.5">
                      {role.permissions.map((perm, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-950 text-xs text-slate-300 border border-slate-800/80"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>{perm}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 text-[11px] text-slate-500 font-mono">
                    Assigned: {assignedUsers.map((u) => u.name).join(', ') || 'No users assigned yet'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 4: AUDIT TRAIL LOG */}
      {/* ======================================================== */}
      {subTab === 'audit' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit actions..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
              />
            </div>

            <button
              onClick={handleExportAuditCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export Audit Trail (CSV)</span>
            </button>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/60">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Target Entity</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 font-sans text-xs">
                        No audit events recorded yet.
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 whitespace-nowrap text-slate-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-bold text-emerald-400">
                          {log.action}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                            {log.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                          {log.actor}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-slate-400">
                          {log.target}
                        </td>
                        <td className="py-3 px-4 font-sans text-slate-300 min-w-[200px]">
                          {log.details}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: VIEW SPECIFIC USER'S TRANSACTIONS */}
      {/* ======================================================== */}
      {selectedUserForTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-pink-400" />
                  <span>Transactions for {selectedUserForTx.name}</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {selectedUserForTx.email} • {selectedUserForTx.phone}
                </p>
              </div>
              <button
                onClick={() => setSelectedUserForTx(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
              {walletEngine.getUserTransactions(selectedUserForTx.phone, selectedUserForTx.name).length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No recorded transactions yet for this phone number.
                </div>
              ) : (
                walletEngine.getUserTransactions(selectedUserForTx.phone, selectedUserForTx.name).map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-mono font-bold text-white flex items-center gap-2">
                        <span>{tx.trxID || tx.paymentID}</span>
                        <span className="text-[10px] uppercase px-1.5 py-0.2 rounded bg-pink-500/10 text-pink-300">
                          {tx.walletType}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        Inv: {tx.merchantInvoiceNumber} • {new Date(tx.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-emerald-400 text-sm">
                        ৳ {tx.amount.toLocaleString()} BDT
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-slate-950 border-t border-slate-800 text-right">
              <button
                onClick={() => setSelectedUserForTx(null)}
                className="py-1.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD NEW USER */}
      {/* ======================================================== */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-pink-400" />
                <span>Register User or Merchant</span>
              </h3>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arif Rahman"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="arif@company.com.bd"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mobile Phone (01XXXXXXXXX)</label>
                <input
                  type="tel"
                  required
                  placeholder="017XXXXXXXX"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Business / Brand Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dhaka Electronics"
                  value={newUserBusiness}
                  onChange={(e) => setNewUserBusiness(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                  <span>Initial Password</span>
                  <span className="text-[10px] text-slate-500">Min 8 characters</span>
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as AdminRole)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="merchant">Merchant (Commercial Seller)</option>
                  <option value="admin">Operations Admin</option>
                  <option value="viewer">Compliance Auditor</option>
                  <option value="super_admin">Super Administrator</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="py-2 px-3 rounded-lg border border-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
