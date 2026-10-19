/**
 * PocketWallet Architecture Types
 * Modeled after the PocketWallet.Bkash and PocketWallet.Nagad C# library
 */

export type WalletType = 'bkash' | 'nagad';
export type PaymentStatus = 'Initiated' | 'Pending' | 'Completed' | 'Refunded' | 'Partially_Refunded' | 'Failed' | 'Cancelled';
export type Environment = 'sandbox' | 'live';
export type Language = 'en' | 'bn';

export interface BkashConfigurationOptions {
  appKey: string;
  appSecret: string;
  username: string;
  password: string;
  baseUrl: string;
  isProduction: boolean;
}

export interface NagadConfigurationOptions {
  merchantId: string;
  merchantPrivateKey: string;
  nagadPublicKey: string;
  baseUrl: string;
  isProduction: boolean;
}

export interface TokenGrantResponse {
  statusCode: string;
  statusMessage: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  issuedAt: number;
}

export interface CreatePaymentCommand {
  walletType: WalletType;
  amount: number;
  currency: 'BDT';
  intent: 'sale';
  merchantInvoiceNumber: string;
  payerReference?: string;
  callbackURL?: string;
  mode?: string;
}

export interface CreatePaymentResult {
  paymentID: string;
  paymentURL: string;
  createTime: string;
  orgLogo?: string;
  orgName: string;
  transactionStatus: PaymentStatus;
  amount: number;
  currency: string;
  intent: string;
  merchantInvoiceNumber: string;
  statusCode: string;
  statusMessage: string;
  walletType: WalletType;
}

export interface ExecutePaymentCommand {
  walletType: WalletType;
  paymentID: string;
  customerMsisdn?: string;
  otp?: string;
  pin?: string;
}

export interface ExecutePaymentResult {
  paymentID: string;
  trxID: string;
  transactionStatus: PaymentStatus;
  amount: number;
  currency: string;
  intent: string;
  paymentExecuteTime: string;
  merchantInvoiceNumber: string;
  payerType: string;
  payerAccount: string;
  customerMsisdn: string;
  statusCode: string;
  statusMessage: string;
  walletType: WalletType;
}

export interface PaymentQueryResult {
  paymentID: string;
  trxID: string;
  mode: string;
  paymentCreateTime: string;
  paymentExecuteTime?: string;
  amount: number;
  currency: string;
  intent: string;
  merchantInvoiceNumber: string;
  refundAmount: number;
  transactionStatus: PaymentStatus;
  verificationStatus: 'Verified' | 'Unverified';
  walletType: WalletType;
  customerMsisdn?: string;
}

export interface RefundPaymentCommand {
  walletType: WalletType;
  paymentID: string;
  trxID: string;
  amount: number;
  sku: string;
  reason: string;
}

export interface RefundPaymentResult {
  refundTrxID: string;
  paymentID: string;
  trxID: string;
  amount: number;
  currency: string;
  transactionStatus: 'Refunded' | 'Partially_Refunded';
  completedTime: string;
  statusCode: string;
  statusMessage: string;
  walletType: WalletType;
}

export interface TransactionRecord {
  id: string;
  paymentID: string;
  trxID?: string;
  refundTrxID?: string;
  walletType: WalletType;
  amount: number;
  refundAmount: number;
  currency: string;
  merchantInvoiceNumber: string;
  customerMsisdn: string;
  customerName?: string;
  status: PaymentStatus;
  createdAt: string;
  completedAt?: string;
  note?: string;
  fee: number;
  netAmount: number;
}

export interface WebhookEvent {
  id: string;
  event: 'payment.created' | 'payment.completed' | 'payment.failed' | 'payment.refunded';
  walletType: WalletType;
  paymentID: string;
  trxID?: string;
  amount: number;
  timestamp: string;
  payload: Record<string, any>;
  statusCode: number;
  delivered: boolean;
}

export interface StoreProduct {
  id: string;
  name: string;
  nameBn: string;
  price: number;
  image: string;
  category: string;
  categoryBn: string;
  stock: number;
  badge?: string;
}

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: { description: string; quantity: number; unitPrice: number; total: number }[];
  totalAmount: number;
  status: 'Unpaid' | 'Paid';
  createdAt: string;
  dueDate: string;
  paymentId?: string;
  trxId?: string;
  walletUsed?: WalletType;
}

export type AdminRole = 'super_admin' | 'admin' | 'merchant' | 'viewer';
export type UserStatus = 'active' | 'suspended';

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AdminRole;
  passwordHash: string;
  salt: string;
  createdAt: string;
  lastLogin?: string;
}

export interface AppUser {
  id: string;
  name: string;
  nameBn?: string;
  email: string;
  phone: string;
  role: AdminRole;
  status: UserStatus;
  createdAt: string;
  balance: number;
  businessName?: string;
  totalTransactions: number;
  lastActive: string;
  passwordHash?: string;
  salt?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  category: 'USER' | 'ROLE' | 'SECURITY' | 'GATEWAY' | 'REFUND' | 'SYSTEM' | 'TRANSACTION';
  target: string;
  details: string;
}

export interface RoleDefinition {
  id: AdminRole;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  permissions: string[];
  badgeColor: string;
}

export interface SystemHealthInfo {
  bkashStatus: 'operational' | 'degraded' | 'outage';
  nagadStatus: 'operational' | 'degraded' | 'outage';
  apiLatencyMs: number;
  databaseStorage: 'healthy';
  webhookSuccessRate: number;
  uptimePercentage: number;
  activeSessions: number;
}
