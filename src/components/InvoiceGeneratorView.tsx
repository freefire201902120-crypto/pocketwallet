import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Copy,
  Check,
  Calendar,
  User,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { InvoiceData, WalletType, Language } from '../types/pocketwallet';
import { walletEngine } from '../services/walletEngine';

interface InvoiceGeneratorProps {
  onPayInvoice: (wallet: WalletType, amount: number, invoiceNumber: string) => void;
  lang?: Language;
}

export const InvoiceGeneratorView: React.FC<InvoiceGeneratorProps> = ({
  onPayInvoice,
  lang = 'en',
}) => {
  const [invoices, setInvoices] = useState<InvoiceData[]>(walletEngine.getInvoices());

  // Form states for new invoice (starts clean)
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  useEffect(() => {
    const unsub = walletEngine.subscribe(() => {
      setInvoices(walletEngine.getInvoices());
    });
    return unsub;
  }, []);

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !itemPrice) return;

    const price = Number(itemPrice);
    const invNumber = `INV-${Date.now().toString().slice(-6)}`;

    const newInv: InvoiceData = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invNumber,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || undefined,
      items: [
        {
          description: itemDesc.trim() || 'Payment for services/goods',
          quantity: 1,
          unitPrice: price,
          total: price,
        },
      ],
      totalAmount: price,
      status: 'Unpaid',
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    };

    walletEngine.addInvoice(newInv);
    setInvoices(walletEngine.getInvoices());

    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setItemDesc('');
    setItemPrice('');
  };

  const handleCopy = (invNumber: string) => {
    const url = `https://pay.pocketwallet.bd/invoice/${invNumber}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(invNumber);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400">
              <FileText className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white">
              {lang === 'bn' ? 'মার্চেন্ট ইনভয়েস ও পেমেন্ট লিঙ্ক জেনারেটর' : 'Invoices & Direct Payment Links'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'bn'
              ? 'গ্রাহককে বিকাশ বা নগদ পেমেন্ট লিঙ্ক পাঠিয়ে সরাসরি পেমেন্ট গ্রহণ করুন।'
              : 'Create customer bills and generate direct bKash or Nagad payment links.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Create Invoice Form (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Create Real Payment Invoice
          </h3>

          <form onSubmit={handleCreateInvoice} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Customer Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Shakil Chowdhury"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Customer Mobile (MSISDN)
              </label>
              <input
                type="tel"
                required
                placeholder="01XXXXXXXXX"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="customer@email.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Item Description
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Website Consulting / Order #991"
                value={itemDesc}
                onChange={(e) => setItemDesc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Total Amount (BDT ৳)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-bold text-xs">৳</span>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="2500"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white font-mono font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-pink-600/30 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Generate Invoice</span>
            </button>
          </form>
        </div>

        {/* Existing Invoices List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Generated Invoices ({invoices.length})
            </h3>
          </div>

          {invoices.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl space-y-3">
              <FileText className="w-10 h-10 mx-auto text-slate-600" />
              <div className="font-semibold text-slate-300 text-sm">No invoices created yet</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Use the form on the left to generate your first customer payment invoice with a direct bKash & Nagad payment link.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((inv) => {
                const isPaid = inv.status === 'Paid';

                return (
                  <div
                    key={inv.id}
                    className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-mono font-bold text-pink-400 text-xs">
                          #
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white text-sm">
                              {inv.invoiceNumber}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isPaid
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {inv.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400">
                            {inv.customerName} • {inv.customerPhone}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-black text-white font-mono">
                          ৳ {inv.totalAmount.toLocaleString()} BDT
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Due: {inv.dueDate}
                        </div>
                      </div>
                    </div>

                    <div className="py-3 text-xs space-y-1">
                      {inv.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-slate-300">
                          <span>{item.description} (x{item.quantity})</span>
                          <span className="font-mono">৳{item.total.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(inv.invoiceNumber)}
                          className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-mono flex items-center gap-1.5 border border-slate-800"
                        >
                          {copiedLink === inv.invoiceNumber ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <span>Copy Pay Link</span>
                        </button>
                      </div>

                      {!isPaid ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onPayInvoice('bkash', inv.totalAmount, inv.invoiceNumber)}
                            className="px-3 py-1.5 rounded-lg bg-[#E2136E] hover:bg-pink-600 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                          >
                            <span>Pay with bKash</span>
                          </button>
                          <button
                            onClick={() => onPayInvoice('nagad', inv.totalAmount, inv.invoiceNumber)}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#F7941D] to-[#ED1C24] hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                          >
                            <span>Pay with Nagad</span>
                          </button>
                        </div>
                      ) : (
                        <div className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Paid via {inv.walletUsed?.toUpperCase()} (TrxID: {inv.trxId})</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
