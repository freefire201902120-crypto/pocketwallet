import React, { useState } from 'react';
import { Copy, Check, FileCode, Server, Terminal, Shield, BookOpen, Layers } from 'lucide-react';
import { Language } from '../types/pocketwallet';

interface CodeGeneratorProps {
  lang?: Language;
}

export const CodeGeneratorView: React.FC<CodeGeneratorProps> = ({ lang = 'en' }) => {
  const [selectedLang, setSelectedLang] = useState<'csharp' | 'node' | 'python' | 'curl'>('csharp');
  const [copied, setCopied] = useState(false);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const csharpCode = `// -------------------------------------------------------------
// PocketWallet: Unified MFS Payment Gateway Integration (C# .NET)
// -------------------------------------------------------------

// 1. Program.cs (Register Services via Dependency Injection)
using PocketWallet.Bkash.DependencyInjection;
using PocketWallet.Nagad.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

// Register bKash & Nagad Payment Engines
builder.Services.AddBkash(options =>
{
    options.AppKey = builder.Configuration["Bkash:AppKey"]!;
    options.AppSecret = builder.Configuration["Bkash:AppSecret"]!;
    options.Username = builder.Configuration["Bkash:Username"]!;
    options.Password = builder.Configuration["Bkash:Password"]!;
    options.IsProduction = false; // Set true for Live
});

builder.Services.AddNagad(options =>
{
    options.MerchantId = builder.Configuration["Nagad:MerchantId"]!;
    options.MerchantPrivateKey = builder.Configuration["Nagad:PrivateKey"]!;
    options.NagadPublicKey = builder.Configuration["Nagad:PublicKey"]!;
    options.IsProduction = false;
});

builder.Services.AddControllers();
var app = builder.Build();
app.MapControllers();
app.Run();

// -------------------------------------------------------------
// 2. WalletsController.cs (Unified Controller for bKash & Nagad)
// -------------------------------------------------------------
using Microsoft.AspNetCore.Mvc;
using PocketWallet.Bkash;

[ApiController]
[Route("api/wallets")]
public class WalletsController : ControllerBase
{
    private readonly IBkashPayment _bkashPayment;

    public WalletsController(IBkashPayment bkashPayment)
    {
        _bkashPayment = bkashPayment;
    }

    [HttpPost("bkash/create")]
    public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentCommand command)
    {
        var result = await _bkashPayment.CreateAsync(command);
        if (!result.IsSuccess)
        {
            return BadRequest(result.Problem);
        }
        return Ok(result.Value);
    }

    [HttpPost("bkash/execute")]
    public async Task<IActionResult> ExecutePayment([FromBody] ExecutePaymentCommand command)
    {
        var result = await _bkashPayment.ExecuteAsync(command);
        if (!result.IsSuccess)
        {
            return BadRequest(result.Problem);
        }
        return Ok(result.Value);
    }

    [HttpGet("bkash/query/{paymentId}")]
    public async Task<IActionResult> QueryPayment(string paymentId)
    {
        var result = await _bkashPayment.QueryAsync(new PaymentQuery { PaymentID = paymentId });
        if (!result.IsSuccess)
        {
            return NotFound(result.Problem);
        }
        return Ok(result.Value);
    }

    [HttpPost("bkash/refund")]
    public async Task<IActionResult> RefundPayment([FromBody] RefundPaymentCommand command)
    {
        var result = await _bkashPayment.RefundAsync(command);
        if (!result.IsSuccess)
        {
            return BadRequest(result.Problem);
        }
        return Ok(result.Value);
    }
}`;

  const nodeCode = `// -------------------------------------------------------------
// Node.js (TypeScript / Express) Integration with PocketWallet API
// -------------------------------------------------------------
import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

const POCKETWALLET_BASE = 'https://api.pocketwallet.demo/api/wallets';
const APP_KEY = process.env.POCKETWALLET_APP_KEY;

// Create Payment
app.post('/api/checkout/create', async (req, res) => {
  const { walletType, amount, invoiceNo, phone } = req.body;
  try {
    const response = await axios.post(\`\${POCKETWALLET_BASE}/\${walletType}/create\`, {
      amount,
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: invoiceNo,
      payerReference: phone,
      callbackURL: 'https://myshop.com.bd/api/payment/callback'
    }, {
      headers: { 'X-APP-Key': APP_KEY }
    });
    res.json(response.data);
  } catch (error) {
    res.status(400).json(error.response?.data || { error: 'Payment failed' });
  }
});

// Execute Payment
app.post('/api/checkout/execute', async (req, res) => {
  const { walletType, paymentID } = req.body;
  try {
    const response = await axios.post(\`\${POCKETWALLET_BASE}/\${walletType}/execute\`, {
      paymentID
    });
    res.json(response.data);
  } catch (error) {
    res.status(400).json(error.response?.data);
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));`;

  const pythonCode = `# -------------------------------------------------------------
# Python (FastAPI / Requests) Integration with PocketWallet API
# -------------------------------------------------------------
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="PocketWallet Python Client")

BASE_URL = "https://api.pocketwallet.demo/api/wallets"
APP_KEY = "your_pocketwallet_app_key"

class PaymentCreateReq(BaseModel):
    wallet_type: str
    amount: float
    invoice_no: str
    phone: str

@app.post("/create-payment")
def create_payment(payload: PaymentCreateReq):
    url = f"{BASE_URL}/{payload.wallet_type}/create"
    data = {
        "amount": payload.amount,
        "currency": "BDT",
        "intent": "sale",
        "merchantInvoiceNumber": payload.invoice_no,
        "payerReference": payload.phone,
    }
    headers = {"X-APP-Key": APP_KEY, "Content-Type": "application/json"}
    response = requests.post(url, json=data, headers=headers)
    
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail=response.json())
        
    return response.json()`;

  const curlCode = `# -------------------------------------------------------------
# cURL Quick Start Commands for bKash & Nagad
# -------------------------------------------------------------

# 1. Grant Token
curl -X POST "https://api.pocketwallet.demo/api/wallets/bkash/token/grant" \\
  -H "Content-Type: application/json" \\
  -d '{
    "app_key": "your_app_key",
    "app_secret": "your_app_secret"
  }'

# 2. Create Payment
curl -X POST "https://api.pocketwallet.demo/api/wallets/bkash/create" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <id_token>" \\
  -d '{
    "mode": "0011",
    "payerReference": "01XXXXXXXXX",
    "amount": 1500,
    "currency": "BDT",
    "intent": "sale",
    "merchantInvoiceNumber": "INV-2026-9021"
  }'

# 3. Execute Payment
curl -X POST "https://api.pocketwallet.demo/api/wallets/bkash/execute" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <id_token>" \\
  -d '{
    "paymentID": "<payment_id>"
  }'`;

  const activeSnippet =
    selectedLang === 'csharp'
      ? csharpCode
      : selectedLang === 'node'
      ? nodeCode
      : selectedLang === 'python'
      ? pythonCode
      : curlCode;

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
            <BookOpen className="w-5 h-5" />
          </span>
          <h2 className="text-lg font-bold text-white">
            {lang === 'bn' ? 'পকেটওয়ালেট আর্কিটেকচার ও কোড গাইড' : 'PocketWallet Architecture & Code Guide'}
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          {lang === 'bn'
            ? 'আপনার সি-শার্প (.NET) প্রজেক্টে PocketWallet.Bkash এবং PocketWallet.Nagad যেভাবে তৈরি করা হয়েছে তার বিস্তারিত বিবরণ ও ব্যবহারবিধি।'
            : 'Detailed explanation of the C# .NET solution structure from your repository (PocketWallet.Bkash, PocketWallet.Nagad, and PocketWallet Web API).'}
        </p>
      </div>

      {/* Code Viewer Panel */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        {/* Language Tabs & Copy Button */}
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'csharp', label: 'C# .NET (PocketWallet)', icon: '🟦' },
              { id: 'node', label: 'Node.js (TypeScript)', icon: '🟩' },
              { id: 'python', label: 'Python (FastAPI)', icon: '🟨' },
              { id: 'curl', label: 'cURL Terminal', icon: '💻' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedLang(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  selectedLang === tab.id
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => handleCopy(activeSnippet)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code Block */}
        <pre className="p-5 text-xs font-mono text-slate-300 bg-slate-950 overflow-x-auto leading-relaxed max-h-[500px]">
          {activeSnippet}
        </pre>
      </div>

      {/* Architecture Deep Dive & Error Code Reference Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Architecture Breakdown */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-pink-400" />
            <h4 className="text-sm font-bold text-white">
              C# Solution Architecture Breakdown
            </h4>
          </div>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <strong className="text-white">PocketWallet.Bkash:</strong> Contains `IBkashAuthorizationHandler`, `ITokenProvider`, and `DateTimeProvider` which automatically request, validate expiry, and refresh tokens before making calls.
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <strong className="text-white">PocketWallet.Nagad:</strong> Implements PKCS1 encryption and verification algorithms for authenticating with Nagad PGW 1.0.
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <strong className="text-white">Result&lt;T&gt; Pattern:</strong> Instead of throwing raw exceptions, all operations return a fluent <code className="text-pink-300 font-mono">Result&lt;T&gt;</code> with <code className="text-slate-200">IsSuccess</code>, <code className="text-slate-200">Value</code>, or <code className="text-slate-200">BkashProblem</code>.
            </div>
          </div>
        </div>

        {/* MFS Status & Error Codes Table */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-white">
              Common MFS Response Error Codes
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase font-semibold">
                  <th className="py-2 px-2 font-mono">Code</th>
                  <th className="py-2 px-2">Meaning</th>
                  <th className="py-2 px-2">Resolution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="py-2 px-2 font-mono text-emerald-400 font-bold">0000</td>
                  <td className="py-2 px-2">Success</td>
                  <td className="py-2 px-2 text-slate-400">Operation succeeded</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 font-mono text-amber-400">2001</td>
                  <td className="py-2 px-2">Invalid App Key</td>
                  <td className="py-2 px-2 text-slate-400">Check AppKey / AppSecret in settings</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 font-mono text-amber-400">2002</td>
                  <td className="py-2 px-2">Already Executed</td>
                  <td className="py-2 px-2 text-slate-400">Payment already paid</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 font-mono text-rose-400">2023</td>
                  <td className="py-2 px-2">Insufficient Balance</td>
                  <td className="py-2 px-2 text-slate-400">Customer bKash wallet is low</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 font-mono text-rose-400">2029</td>
                  <td className="py-2 px-2">Duplicate Invoice</td>
                  <td className="py-2 px-2 text-slate-400">Use unique merchant invoice number</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
