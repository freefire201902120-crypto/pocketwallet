import React, { useState } from 'react';
import {
  Play,
  Copy,
  Check,
  Code2,
  Terminal,
  Send,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';
import { WalletType, Language } from '../types/pocketwallet';
import { walletEngine } from '../services/walletEngine';

type EndpointId = 'grant_token' | 'refresh_token' | 'create_payment' | 'execute_payment' | 'query_payment' | 'refund_payment';

interface ApiPlaygroundProps {
  onOpenCheckoutWithData?: (wallet: WalletType, amount: number, invoice: string) => void;
  lang?: Language;
}

export const ApiPlayground: React.FC<ApiPlaygroundProps> = ({
  onOpenCheckoutWithData,
  lang = 'en',
}) => {
  const [wallet, setWallet] = useState<WalletType>('bkash');
  const [endpoint, setEndpoint] = useState<EndpointId>('create_payment');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const recentTxs = walletEngine.getTransactions();
  const latestTx = recentTxs[0];

  // Form parameters
  const [amount, setAmount] = useState('1500');
  const [invoice, setInvoice] = useState(`INV-${Date.now().toString().slice(-6)}`);
  const [paymentId, setPaymentId] = useState(latestTx?.paymentID || '');
  const [trxId, setTrxId] = useState(latestTx?.trxID || '');
  const [customerPhone, setCustomerPhone] = useState(latestTx?.customerMsisdn || '');
  const [otpInput, setOtpInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [refundAmount, setRefundAmount] = useState('500');
  const [refundReason, setRefundReason] = useState('Merchant refund request');

  // Response State
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [responseBody, setResponseBody] = useState<any>(null);

  // Endpoints list
  const endpoints = [
    { id: 'create_payment', method: 'POST', path: `/api/wallets/${wallet}/create`, label: 'Create Payment' },
    { id: 'execute_payment', method: 'POST', path: `/api/wallets/${wallet}/execute`, label: 'Execute Payment' },
    { id: 'query_payment', method: 'GET', path: `/api/wallets/${wallet}/query/{id}`, label: 'Query Payment' },
    { id: 'refund_payment', method: 'POST', path: `/api/wallets/${wallet}/refund`, label: 'Refund Payment' },
    { id: 'grant_token', method: 'POST', path: `/api/wallets/${wallet}/token/grant`, label: 'Grant Auth Token' },
    { id: 'refresh_token', method: 'POST', path: `/api/wallets/${wallet}/token/refresh`, label: 'Refresh Auth Token' },
  ];

  // Generate Current Request Payload
  const getRequestPayload = () => {
    switch (endpoint) {
      case 'grant_token':
        return {
          app_key: walletEngine.getBkashConfig().appKey,
          app_secret: walletEngine.getBkashConfig().appSecret,
        };
      case 'refresh_token':
        return {
          app_key: walletEngine.getBkashConfig().appKey,
          app_secret: walletEngine.getBkashConfig().appSecret,
          refresh_token: 'rf_a9821k029m_sample',
        };
      case 'create_payment':
        return {
          mode: '0011',
          payerReference: customerPhone,
          callbackURL: `https://pocketwallet.demo/api/wallets/${wallet}/callback`,
          amount: Number(amount),
          currency: 'BDT',
          intent: 'sale',
          merchantInvoiceNumber: invoice,
        };
      case 'execute_payment':
        return {
          paymentID: paymentId,
        };
      case 'query_payment':
        return null; // GET request
      case 'refund_payment':
        return {
          paymentID: paymentId,
          trxID: trxId,
          amount: Number(refundAmount),
          sku: 'SKU-MERCHANT-892',
          reason: refundReason,
        };
    }
  };

  // Generate cURL command
  const getCurlCommand = () => {
    const payload = getRequestPayload();
    const url = `https://api.pocketwallet.demo/api/wallets/${wallet}/${
      endpoint === 'query_payment' ? `query/${paymentId}` : endpoint.replace('_', '/')
    }`;

    let cmd = `curl -X ${endpoint === 'query_payment' ? 'GET' : 'POST'} "${url}" \\\n`;
    cmd += `  -H "Content-Type: application/json" \\\n`;
    cmd += `  -H "X-APP-Key: ${walletEngine.getBkashConfig().appKey}" \\\n`;
    cmd += `  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."`;

    if (payload) {
      cmd += ` \\\n  -d '${JSON.stringify(payload, null, 2)}'`;
    }
    return cmd;
  };

  // Execute Gateway API Request
  const handleExecuteRequest = async () => {
    setIsLoading(true);
    setResponseStatus(null);
    const start = performance.now();

    try {
      let resData: any = null;

      switch (endpoint) {
        case 'grant_token':
          resData = await walletEngine.grantToken(wallet);
          break;
        case 'refresh_token':
          resData = await walletEngine.refreshToken(wallet, 'rf_sample_token');
          break;
        case 'create_payment':
          resData = await walletEngine.createPayment({
            walletType: wallet,
            amount: Number(amount),
            currency: 'BDT',
            intent: 'sale',
            merchantInvoiceNumber: invoice,
            payerReference: customerPhone,
          });
          setPaymentId(resData.paymentID);
          break;
        case 'execute_payment':
          resData = await walletEngine.executePayment({
            walletType: wallet,
            paymentID: paymentId,
            customerMsisdn: customerPhone,
            otp: '123456',
            pin: '12345',
          });
          setTrxId(resData.trxID);
          break;
        case 'query_payment':
          resData = await walletEngine.queryPayment(wallet, paymentId);
          break;
        case 'refund_payment':
          resData = await walletEngine.refundPayment({
            walletType: wallet,
            paymentID: paymentId,
            trxID: trxId,
            amount: Number(refundAmount),
            sku: 'SKU-PROD-TEST',
            reason: refundReason,
          });
          break;
      }

      const duration = Math.round(performance.now() - start);
      setResponseTime(duration);
      setResponseStatus(200);
      setResponseHeaders({
        'content-type': 'application/json; charset=utf-8',
        'x-request-id': `req-${Date.now()}`,
        'x-rate-limit-remaining': '994',
        'server': 'PocketWallet-Gateway/1.0.0 (ASP.NET Core)',
      });
      setResponseBody(resData);
    } catch (err: any) {
      const duration = Math.round(performance.now() - start);
      setResponseTime(duration);
      setResponseStatus(400);
      setResponseHeaders({
        'content-type': 'application/problem+json',
        'server': 'PocketWallet-Gateway/1.0.0',
      });
      setResponseBody({
        statusCode: '4001',
        statusMessage: err.message || 'Validation error or invalid transaction state',
        type: 'https://pocketwallet.demo/errors/bad-request',
        title: 'PocketWallet Problem Detail',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400">
              <Terminal className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white">
              {lang === 'bn' ? 'পকেটওয়ালেট এপিআই প্লেগ্রাউন্ড' : 'PocketWallet API Playground'}
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              v2.0 REST
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {lang === 'bn'
              ? 'বিকাশ ও নগদ এর সকল রিকোয়েস্ট এবং রেসপন্স সরাসরি ব্রাউজারে টেস্ট করুন। PocketWallet.Bkash এবং PocketWallet.Nagad লাইব্রেরির সমতুল্য।'
              : 'Directly test REST endpoints and C# models for bKash and Nagad. Replicates the WalletsController and BkashPayment service methods.'}
          </p>
        </div>

        {/* Wallet Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWallet('bkash')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition ${
              wallet === 'bkash'
                ? 'bg-[#E2136E] text-white shadow-md shadow-pink-600/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-white" />
            <span>bKash API</span>
          </button>
          <button
            onClick={() => setWallet('nagad')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition ${
              wallet === 'nagad'
                ? 'bg-gradient-to-r from-[#F7941D] to-[#ED1C24] text-white shadow-md shadow-orange-600/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-white" />
            <span>Nagad API</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Endpoints + Request Builder + Response Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Endpoints List (3 cols) */}
        <div className="lg:col-span-3 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
            Wallet Endpoints
          </div>
          <div className="space-y-1.5">
            {endpoints.map((ep) => {
              const isSelected = endpoint === ep.id;
              return (
                <button
                  key={ep.id}
                  onClick={() => setEndpoint(ep.id as EndpointId)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-slate-800 border-pink-500/40 text-white shadow-sm'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold">{ep.label}</span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        ep.method === 'POST'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-sky-500/20 text-sky-300'
                      }`}
                    >
                      {ep.method}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 truncate">
                    {ep.path}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Middle Column: Request Parameters & JSON Payload (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Request Parameters
              </span>
              <span className="text-[10px] font-mono text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded">
                JSON Body
              </span>
            </div>
            <button
              onClick={() => handleCopy(getCurlCommand())}
              className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1"
              title="Copy cURL command"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>cURL</span>
            </button>
          </div>

          {/* Dynamic input controls based on endpoint */}
          <div className="space-y-3">
            {endpoint === 'create_payment' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Amount (BDT ৳)
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Invoice Number
                    </label>
                    <input
                      type="text"
                      value={invoice}
                      onChange={(e) => setInvoice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Customer Phone (payerReference)
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </>
            )}

            {(endpoint === 'execute_payment' || endpoint === 'query_payment') && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Payment ID (paymentID)
                </label>
                <input
                  type="text"
                  value={paymentId}
                  onChange={(e) => setPaymentId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
            )}

            {endpoint === 'refund_payment' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Payment ID
                    </label>
                    <input
                      type="text"
                      value={paymentId}
                      onChange={(e) => setPaymentId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Original TrxID
                    </label>
                    <input
                      type="text"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Refund Amount (৳)
                    </label>
                    <input
                      type="number"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Reason
                    </label>
                    <input
                      type="text"
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* JSON Preview */}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 mb-1">
              Constructed JSON Payload:
            </div>
            <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-48 leading-relaxed">
              {JSON.stringify(getRequestPayload(), null, 2) || '// No payload body needed for GET'}
            </pre>
          </div>

          {/* Execute Button */}
          <button
            onClick={handleExecuteRequest}
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-600/30 transition disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Executing API...</span>
              </span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Send Request</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Live Response (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                HTTP Response
              </span>

              {responseStatus && (
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      responseStatus === 200
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {responseStatus} {responseStatus === 200 ? 'OK' : 'ERROR'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {responseTime}ms
                  </span>
                </div>
              )}
            </div>

            {responseBody ? (
              <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-96 leading-relaxed">
                {JSON.stringify(responseBody, null, 2)}
              </pre>
            ) : (
              <div className="h-64 rounded-xl border border-dashed border-slate-800 flex flex-col items-center justify-center text-center p-4 text-slate-500">
                <Code2 className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs font-semibold">No response yet</p>
                <p className="text-[11px] mt-1">
                  Click 'Send Request' to trigger the PocketWallet handler
                </p>
              </div>
            )}
          </div>

          {/* Quick Action when a payment is created */}
          {endpoint === 'create_payment' && responseBody && responseBody.paymentID && onOpenCheckoutWithData && (
            <button
              onClick={() => onOpenCheckoutWithData(wallet, Number(amount), invoice)}
              className="w-full py-2 px-3 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition"
            >
              <span>Test In Checkout Simulator</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
