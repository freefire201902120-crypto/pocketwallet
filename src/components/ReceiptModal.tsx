import React from 'react';
import { X, Printer, CheckCircle, ShieldCheck, Download, Share2 } from 'lucide-react';
import { TransactionRecord, Language } from '../types/pocketwallet';

interface ReceiptModalProps {
  transaction: TransactionRecord | null;
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  isOpen,
  onClose,
  lang = 'en',
}) => {
  if (!isOpen || !transaction) return null;

  const isBkash = transaction.walletType === 'bkash';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-6 border border-slate-200">
        {/* Top brand header */}
        <div
          className={`p-5 text-white flex items-center justify-between ${
            isBkash ? 'bg-[#E2136E]' : 'bg-gradient-to-r from-[#F7941D] to-[#ED1C24]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-slate-900 font-black text-sm flex items-center justify-center shadow">
              {isBkash ? (
                <span className="text-[#E2136E] font-bold">bK</span>
              ) : (
                <span className="text-orange-600 font-bold">নগদ</span>
              )}
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider font-semibold opacity-90">
                Official Payment Receipt
              </div>
              <div className="text-base font-extrabold">
                {isBkash ? 'bKash Merchant Pay' : 'Nagad Digital Payment'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/10 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="p-6 space-y-5">
          {/* Status and Amount */}
          <div className="text-center pb-4 border-b border-dashed border-slate-300">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Payment Successful</span>
            </div>
            <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
              ৳ {transaction.amount.toLocaleString()} <span className="text-sm font-semibold text-slate-500">BDT</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Collected via PocketWallet Unified MFS Engine
            </p>
          </div>

          {/* Details Table */}
          <div className="space-y-2.5 text-xs font-sans">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Transaction ID (TrxID)</span>
              <span className="font-mono font-bold text-slate-900 select-all">
                {transaction.trxID || 'Pending'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Payment ID</span>
              <span className="font-mono text-slate-700">{transaction.paymentID}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Merchant Invoice</span>
              <span className="font-mono font-semibold text-slate-800">
                {transaction.merchantInvoiceNumber}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Customer Mobile</span>
              <span className="font-mono text-slate-800">{transaction.customerMsisdn}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Date & Time</span>
              <span className="text-slate-700">
                {new Date(transaction.createdAt).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Gateway Fee (MFS Charge)</span>
              <span className="text-slate-600 font-mono">৳ {transaction.fee.toFixed(2)}</span>
            </div>

            <div className="flex justify-between py-1 font-semibold text-slate-900 pt-1">
              <span>Merchant Net Payout</span>
              <span className="font-mono text-emerald-700">৳ {transaction.netAmount.toFixed(2)}</span>
            </div>

            {transaction.status === 'Refunded' && (
              <div className="mt-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs space-y-1">
                <div className="font-bold flex items-center justify-between">
                  <span>Status: Refunded</span>
                  <span>- ৳ {transaction.refundAmount.toLocaleString()}</span>
                </div>
                {transaction.refundTrxID && (
                  <div className="font-mono text-[11px]">Refund TrxID: {transaction.refundTrxID}</div>
                )}
              </div>
            )}
          </div>

          {/* Barcode & Security Badge */}
          <div className="pt-3 border-t border-slate-200 flex flex-col items-center justify-center gap-2 text-center">
            {/* Visual Barcode imitation */}
            <div className="flex items-center justify-center gap-[2px] h-8 w-48 opacity-75">
              {[12, 28, 16, 32, 8, 24, 18, 30, 10, 22, 14, 26, 32, 10, 24, 18, 28, 12, 20].map(
                (h, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-800 w-[3px] rounded-[1px]"
                    style={{ height: `${h}px` }}
                  />
                )
              )}
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              {transaction.paymentID}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Digitally verified via PocketWallet PGW</span>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
