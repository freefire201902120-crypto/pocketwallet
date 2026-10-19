import React, { useState } from 'react';
import { X, RotateCcw, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { TransactionRecord, Language } from '../types/pocketwallet';
import { walletEngine } from '../services/walletEngine';

interface RefundModalProps {
  transaction: TransactionRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onRefundCompleted?: () => void;
  lang?: Language;
}

export const RefundModal: React.FC<RefundModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onRefundCompleted,
  lang = 'en',
}) => {
  if (!isOpen || !transaction) return null;

  const maxRefundable = transaction.amount - transaction.refundAmount;
  const [refundAmount, setRefundAmount] = useState<number>(maxRefundable);
  const [reason, setReason] = useState('Customer returned goods');
  const [sku, setSku] = useState('PROD-DEFAULT');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState<{ refundTrxId: string; amount: number } | null>(
    null
  );

  const handleRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (refundAmount <= 0 || refundAmount > maxRefundable) {
      setErrorMsg(`Amount must be between ৳1 and ৳${maxRefundable}`);
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await walletEngine.refundPayment({
        walletType: transaction.walletType,
        paymentID: transaction.paymentID,
        trxID: transaction.trxID || '',
        amount: Number(refundAmount),
        sku,
        reason,
      });

      setSuccessInfo({
        refundTrxId: res.refundTrxID,
        amount: res.amount,
      });

      if (onRefundCompleted) {
        onRefundCompleted();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Refund processing failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {lang === 'bn' ? 'এমএফএস রিফান্ড সম্পন্ন করুন' : 'Initiate Instant MFS Refund'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {transaction.walletType.toUpperCase()} • TrxID: {transaction.trxID}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {successInfo ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">
                {lang === 'bn' ? 'রিফান্ড সফল হয়েছে!' : 'Refund Dispatched Successfully!'}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Amount of <strong className="text-white">৳ {successInfo.amount}</strong> credited back to {transaction.customerMsisdn}
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-left space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Refund TrxID</span>
                <span className="text-emerald-400 font-bold">{successInfo.refundTrxId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Original TrxID</span>
                <span className="text-slate-300">{transaction.trxID}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleRefund} className="p-5 space-y-4">
            {/* Transaction summary pill */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Paid Amount:</span>
                <span className="text-white font-bold">৳ {transaction.amount} BDT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Already Refunded:</span>
                <span className="text-amber-400">৳ {transaction.refundAmount} BDT</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-1 text-slate-300">
                <span>Maximum Refundable:</span>
                <span className="text-emerald-400 font-bold">৳ {maxRefundable} BDT</span>
              </div>
            </div>

            {/* Inputs */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {lang === 'bn' ? 'রিফান্ডের পরিমাণ (৳)' : 'Refund Amount (BDT ৳)'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold">৳</span>
                <input
                  type="number"
                  min="1"
                  max={maxRefundable}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-white font-mono font-bold text-sm focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {lang === 'bn' ? 'রিফান্ডের কারণ' : 'Refund Reason'}
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-rose-500"
              >
                <option value="Customer returned goods">Customer returned goods</option>
                <option value="Product out of stock">Product out of stock</option>
                <option value="Duplicate payment by customer">Duplicate payment by customer</option>
                <option value="Order cancelled before shipping">Order cancelled before shipping</option>
                <option value="Damaged item received">Damaged item received</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                SKU / Item Reference
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {errorMsg}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition disabled:opacity-50"
              >
                {isLoading ? 'Processing Refund...' : 'Confirm Instant Refund'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
