import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  ArrowUpRight,
  RefreshCw,
  Eye,
  RotateCcw,
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  CreditCard,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { TransactionRecord, WalletType, Language, PaymentStatus } from '../types/pocketwallet';
import { TRANSLATIONS } from '../data/initialData';

interface DashboardViewProps {
  transactions: TransactionRecord[];
  onOpenReceipt: (tx: TransactionRecord) => void;
  onOpenRefund: (tx: TransactionRecord) => void;
  onQueryTx: (tx: TransactionRecord) => void;
  onNewPayment: () => void;
  lang: Language;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  onOpenReceipt,
  onOpenRefund,
  onQueryTx,
  onNewPayment,
  lang,
}) => {
  const t = TRANSLATIONS[lang];

  // Filters
  const [search, setSearch] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<'all' | WalletType>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Statistics Calculation
  const stats = useMemo(() => {
    let totalVolume = 0;
    let bkashVolume = 0;
    let nagadVolume = 0;
    let netSettlement = 0;
    let completedCount = 0;
    let refundedVolume = 0;

    transactions.forEach((tx) => {
      if (tx.status === 'Completed' || tx.status === 'Partially_Refunded' || tx.status === 'Refunded') {
        totalVolume += tx.amount;
        netSettlement += tx.netAmount;
        completedCount++;

        if (tx.walletType === 'bkash') {
          bkashVolume += tx.amount;
        } else {
          nagadVolume += tx.amount;
        }

        refundedVolume += tx.refundAmount;
      }
    });

    const successRate =
      transactions.length > 0 ? Math.round((completedCount / transactions.length) * 100) : 100;

    return {
      totalVolume,
      bkashVolume,
      nagadVolume,
      netSettlement,
      totalCount: transactions.length,
      completedCount,
      successRate,
      refundedVolume,
    };
  }, [transactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Wallet filter
      if (selectedWallet !== 'all' && tx.walletType !== selectedWallet) {
        return false;
      }
      // Status filter
      if (selectedStatus !== 'all' && tx.status !== selectedStatus) {
        return false;
      }
      // Search
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesId = tx.paymentID.toLowerCase().includes(query);
        const matchesTrx = tx.trxID?.toLowerCase().includes(query) ?? false;
        const matchesInv = tx.merchantInvoiceNumber.toLowerCase().includes(query);
        const matchesPhone = tx.customerMsisdn.toLowerCase().includes(query);
        const matchesCustomer = tx.customerName?.toLowerCase().includes(query) ?? false;
        return matchesId || matchesTrx || matchesInv || matchesPhone || matchesCustomer;
      }
      return true;
    });
  }, [transactions, selectedWallet, selectedStatus, search]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'PaymentID',
      'TrxID',
      'Wallet',
      'Amount(BDT)',
      'Fee(BDT)',
      'Net(BDT)',
      'Status',
      'Customer',
      'Phone',
      'Invoice',
      'Date',
    ];
    const rows = filteredTransactions.map((tx) => [
      tx.paymentID,
      tx.trxID || '',
      tx.walletType,
      tx.amount,
      tx.fee,
      tx.netAmount,
      tx.status,
      tx.customerName || 'N/A',
      tx.customerMsisdn,
      tx.merchantInvoiceNumber,
      tx.createdAt,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PocketWallet_Transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Processed Volume */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">{t.totalVolume}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-white font-mono">
              ৳ {stats.totalVolume.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-semibold">BDT</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>100% Guaranteed MFS settlement</span>
          </div>
        </div>

        {/* Net Settlement (After Fee) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">{t.netRevenue}</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-sky-400 font-mono">
              ৳ {Math.round(stats.netSettlement).toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-semibold">BDT</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Refunds: ৳ {stats.refundedVolume.toLocaleString()}</span>
            <span className="text-[11px] text-slate-500">Auto-reconciliation</span>
          </div>
        </div>

        {/* bKash Volume */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-pink-500/30 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E2136E]" />
              <span className="font-medium">{t.bkashVolume}</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20">
              bKash PGW
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-white font-mono">
              ৳ {stats.bkashVolume.toLocaleString()}
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-3">
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#E2136E] h-full rounded-full transition-all duration-500"
                style={{
                  width: `${
                    stats.totalVolume > 0
                      ? Math.round((stats.bkashVolume / stats.totalVolume) * 100)
                      : 50
                  }%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>
                {stats.totalVolume > 0
                  ? Math.round((stats.bkashVolume / stats.totalVolume) * 100)
                  : 50}
                % Share
              </span>
              <span>Fee: 1.5%</span>
            </div>
          </div>
        </div>

        {/* Nagad Volume */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-amber-500/30 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F7941D]" />
              <span className="font-medium">{t.nagadVolume}</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Nagad PGW
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-white font-mono">
              ৳ {stats.nagadVolume.toLocaleString()}
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-3">
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#F7941D] to-[#ED1C24] h-full rounded-full transition-all duration-500"
                style={{
                  width: `${
                    stats.totalVolume > 0
                      ? Math.round((stats.nagadVolume / stats.totalVolume) * 100)
                      : 50
                  }%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>
                {stats.totalVolume > 0
                  ? Math.round((stats.nagadVolume / stats.totalVolume) * 100)
                  : 50}
                % Share
              </span>
              <span>Fee: 1.2%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics & Flow status banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly Settlement Trend Chart */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">
                {lang === 'bn' ? 'সাপ্তাহিক ট্রানজেকশন ভলিউম' : 'MFS Collection Trend (7 Days)'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'bn'
                  ? 'বিকাশ ও নগদে সংগৃহীত দৈনিক পেমেন্ট গ্রাফ'
                  : 'Daily gross merchant collections in BDT'}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E2136E]" />
                <span className="text-slate-300">bKash</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F7941D]" />
                <span className="text-slate-300">Nagad</span>
              </div>
            </div>
          </div>

          {/* SVG Line / Bar visualization */}
          <div className="h-44 w-full flex items-end justify-between gap-3 pt-6 px-2">
            {[
              { day: 'Mon', bkash: 3200, nagad: 2100 },
              { day: 'Tue', bkash: 4500, nagad: 3400 },
              { day: 'Wed', bkash: 2800, nagad: 1900 },
              { day: 'Thu', bkash: 5100, nagad: 4200 },
              { day: 'Fri', bkash: 6800, nagad: 5800 },
              { day: 'Sat', bkash: 7400, nagad: 6200 },
              { day: 'Sun (Today)', bkash: stats.bkashVolume, nagad: stats.nagadVolume },
            ].map((d, idx) => {
              const maxVal = 14000;
              const bkashHeight = Math.min(100, Math.round((d.bkash / maxVal) * 100));
              const nagadHeight = Math.min(100, Math.round((d.nagad / maxVal) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full flex items-end justify-center gap-1.5 h-32">
                    {/* bKash bar */}
                    <div
                      className="w-1/2 bg-[#E2136E]/80 group-hover:bg-[#E2136E] rounded-t transition-all relative"
                      style={{ height: `${Math.max(12, bkashHeight)}%` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-slate-950 text-[10px] text-pink-300 font-mono whitespace-nowrap border border-pink-500/30 z-10 pointer-events-none">
                        ৳{d.bkash}
                      </div>
                    </div>
                    {/* Nagad bar */}
                    <div
                      className="w-1/2 bg-gradient-to-t from-[#ED1C24] to-[#F7941D] group-hover:brightness-110 rounded-t transition-all relative"
                      style={{ height: `${Math.max(12, nagadHeight)}%` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-slate-950 text-[10px] text-amber-300 font-mono whitespace-nowrap border border-amber-500/30 z-10 pointer-events-none">
                        ৳{d.nagad}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium truncate max-w-full">
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Integration Architecture Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-pink-400">
                Architecture Blueprint
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-base font-bold text-white mt-1">PocketWallet .NET Core</h4>
            <p className="text-xs text-slate-400 mt-1">
              Modeled directly on the clean CQRS & DI design of PocketWallet:
            </p>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-emerald-400 font-mono font-bold">✓</span>
                <span className="text-slate-300">
                  <strong className="text-white">TokenProvider:</strong> Automatic Token Grant & Refresh caching
                </span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-emerald-400 font-mono font-bold">✓</span>
                <span className="text-slate-300">
                  <strong className="text-white">HttpProxy:</strong> Secure REST proxy with resilient retries
                </span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-emerald-400 font-mono font-bold">✓</span>
                <span className="text-slate-300">
                  <strong className="text-white">WalletsController:</strong> Unified endpoints for all MFS
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Bangladeshi MFS PGW 2026</span>
            <button
              onClick={onNewPayment}
              className="text-xs font-bold text-pink-400 hover:text-pink-300 flex items-center gap-1"
            >
              Test Checkout →
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Table Filters & Toolbar */}
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Filters & Export */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            {/* Wallet Filter Buttons */}
            <div className="flex items-center rounded-lg bg-slate-950 p-1 border border-slate-800">
              <button
                onClick={() => setSelectedWallet('all')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition ${
                  selectedWallet === 'all'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.allWallets}
              </button>
              <button
                onClick={() => setSelectedWallet('bkash')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition flex items-center gap-1 ${
                  selectedWallet === 'bkash'
                    ? 'bg-[#E2136E] text-white shadow-sm'
                    : 'text-slate-400 hover:text-pink-300'
                }`}
              >
                <span>bKash</span>
              </button>
              <button
                onClick={() => setSelectedWallet('nagad')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition flex items-center gap-1 ${
                  selectedWallet === 'nagad'
                    ? 'bg-[#F7941D] text-white shadow-sm'
                    : 'text-slate-400 hover:text-amber-300'
                }`}
              >
                <span>Nagad</span>
              </button>
            </div>

            {/* Status Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-pink-500"
            >
              <option value="all">{t.statusAll}</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Refunded">Refunded</option>
              <option value="Initiated">Initiated</option>
            </select>

            {/* Export */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
              title="Export to CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/60">
                <th className="py-3 px-4">{t.wallet}</th>
                <th className="py-3 px-4">{t.trxId} / {t.paymentId}</th>
                <th className="py-3 px-4">{t.customer}</th>
                <th className="py-3 px-4">{t.invoice}</th>
                <th className="py-3 px-4">{t.amount}</th>
                <th className="py-3 px-4">{t.status}</th>
                <th className="py-3 px-4">{t.date}</th>
                <th className="py-3 px-4 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <p className="text-sm font-semibold">No transactions recorded</p>
                    <p className="text-xs mt-1">Adjust filters or initiate a payment checkout to start your real transaction ledger</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isBkash = tx.walletType === 'bkash';

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-800/40 transition group"
                    >
                      {/* Wallet */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-white text-[11px] shadow ${
                              isBkash ? 'bg-[#E2136E]' : 'bg-gradient-to-br from-[#F7941D] to-[#ED1C24]'
                            }`}
                          >
                            {isBkash ? 'bK' : 'নগদ'}
                          </div>
                          <div>
                            <span className="font-bold text-white uppercase text-[11px]">
                              {tx.walletType}
                            </span>
                            <div className="text-[10px] text-slate-400">
                              {isBkash ? 'Tokenized' : 'PKCS1'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* TrxID & PaymentID */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-emerald-400 flex items-center gap-1">
                          {tx.trxID || <span className="text-amber-400 font-normal">Pending PIN</span>}
                        </div>
                        <div className="font-mono text-[10px] text-slate-500">
                          {tx.paymentID}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-slate-200 font-medium">
                          {tx.customerName || 'Direct Checkout'}
                        </div>
                        <div className="font-mono text-[11px] text-slate-400">
                          {tx.customerMsisdn}
                        </div>
                      </td>

                      {/* Invoice */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-300">
                        {tx.merchantInvoiceNumber}
                      </td>

                      {/* Amount & Fee */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-white">
                          ৳ {tx.amount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Fee: ৳{tx.fee.toFixed(2)} • Net: ৳{tx.netAmount.toFixed(2)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            tx.status === 'Completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : tx.status === 'Refunded'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : tx.status === 'Partially_Refunded'
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {tx.status === 'Completed' && <CheckCircle2 className="w-3 h-3" />}
                          {tx.status === 'Refunded' && <RotateCcw className="w-3 h-3" />}
                          {tx.status === 'Pending' && <Clock className="w-3 h-3" />}
                          {tx.status === 'Initiated' && <Clock className="w-3 h-3" />}
                          <span>{tx.status}</span>
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                        <div>{new Date(tx.createdAt).toLocaleDateString()}</div>
                        <div className="text-slate-500">{new Date(tx.createdAt).toLocaleTimeString()}</div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Receipt button */}
                          {tx.status === 'Completed' && (
                            <button
                              onClick={() => onOpenReceipt(tx)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                              title={t.receipt}
                            >
                              <Receipt className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Query Status API */}
                          <button
                            onClick={() => onQueryTx(tx)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            title={t.query}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Refund Button */}
                          {(tx.status === 'Completed' || tx.status === 'Partially_Refunded') && (
                            <button
                              onClick={() => onOpenRefund(tx)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                              title={t.refund}
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
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
  );
};
