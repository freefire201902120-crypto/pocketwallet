import React, { useState } from 'react';
import {
  Radio,
  Copy,
  Check,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { WebhookEvent, Language } from '../types/pocketwallet';

interface WebhookViewProps {
  webhooks: WebhookEvent[];
  lang?: Language;
}

export const WebhookView: React.FC<WebhookViewProps> = ({ webhooks, lang = 'en' }) => {
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookEvent | null>(
    webhooks.length > 0 ? webhooks[0] : null
  );
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400">
              <Radio className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white">
              {lang === 'bn' ? 'রিয়েলটাইম ওয়েবহুক ও ইভেন্ট লগ' : 'Real-time Webhook Events & Dispatcher'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'bn'
              ? 'বিকাশ ও নগদ পেমেন্ট সম্পন্ন বা রিফান্ড হলে মার্চেন্ট সার্ভারে পাঠানো স্বয়ংক্রিয় নোটিফিকেশন।'
              : 'Asynchronous event dispatches delivered to merchant webhook endpoints upon payment completion or refund.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-mono text-emerald-400 font-semibold">Listener Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Webhooks Stream List (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-semibold uppercase tracking-wider">
            <span>Delivered Events ({webhooks.length})</span>
            <span>HTTP Status</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {webhooks.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No webhook events yet. Test a checkout to generate one!
              </div>
            ) : (
              webhooks.map((wh) => {
                const isSelected = selectedWebhook?.id === wh.id;
                const isBkash = wh.walletType === 'bkash';

                return (
                  <button
                    key={wh.id}
                    onClick={() => setSelectedWebhook(wh)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-pink-500/50 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isBkash ? 'bg-[#E2136E]' : 'bg-[#F7941D]'
                          }`}
                        />
                        <span className="font-mono text-xs font-bold text-slate-200">
                          {wh.event}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {wh.statusCode} OK
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>{wh.paymentID}</span>
                      <span>{new Date(wh.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Payload Inspector (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          {selectedWebhook ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-pink-400">
                    Webhook Details
                  </div>
                  <div className="text-sm font-bold text-white font-mono mt-0.5">
                    {selectedWebhook.event}
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(JSON.stringify(selectedWebhook.payload, null, 2))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>Copy Payload</span>
                </button>
              </div>

              {/* Meta details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-500">MFS Provider</div>
                  <div className="text-slate-200 uppercase font-bold">{selectedWebhook.walletType}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-500">Amount</div>
                  <div className="text-emerald-400 font-bold">৳ {selectedWebhook.amount} BDT</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-500">Timestamp</div>
                  <div className="text-slate-300">{new Date(selectedWebhook.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>

              {/* Payload code */}
              <div>
                <div className="text-[11px] font-semibold text-slate-400 mb-1">
                  JSON Body:
                </div>
                <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-emerald-400 font-mono text-xs overflow-x-auto max-h-80 leading-relaxed">
                  {JSON.stringify(selectedWebhook.payload, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500">
              <Radio className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-xs font-semibold">Select a webhook event to inspect payload</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
