import { api } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TPaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type TPayment = {
  _id: string;
  sessionId: string;
  learnerId: string;
  mentorId: string;
  amount: number;
  currency: string;
  status: TPaymentStatus;
  stripeSessionId?: string;
  transactionId?: string;
  createdAt: string;
};

type CheckoutResponse = {
  success: boolean;
  message: string;
  data: { url: string };
};

type PaymentStatusResponse = {
  success: boolean;
  message: string;
  data: TPayment | null;
};

export type TEarningPayment = {
  _id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  session: {
    title: string;
    scheduledAt: string;
    durationMinutes: number;
  } | null;
  learner: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  } | null;
};

type EarningsResponse = {
  success: boolean;
  message: string;
  data: {
    payments: TEarningPayment[];
    totalEarnings: number;
    totalPayments: number;
  };
};

export type TRevenue = {
  _id: string;
  amount: number;
  currency: string;
  createdAt: string;
  session: {
    title: string;
    scheduledAt: string;
    durationMinutes: number;
  } | null;
  learner: {
    name: string;
    email: string;
    profileImage?: string;
  } | null;
  mentor: {
    name: string;
    email: string;
    profileImage?: string;
  } | null;
};

type RevenueResponse = {
  success: boolean;
  message: string;
  data: {
    payments: TRevenue[];
    totalRevenue: number;
    adminProfit: number;
    totalPayments: number;
  };
};

// ─── Service ──────────────────────────────────────────────────────────────────

const createCheckoutSession = async (sessionId: string): Promise<string> => {
  const response = await api.post<CheckoutResponse>(
    '/payment/create-checkout-session',
    { sessionId },
  );
  return response.data.url;
};

const getPaymentStatus = async (
  sessionId: string,
): Promise<TPayment | null> => {
  const response = await api.get<PaymentStatusResponse>(
    `/payment/status/${sessionId}`,
  );
  return response.data;
};

const getEarnings = async (): Promise<{
  payments: TEarningPayment[];
  totalEarnings: number;
  totalPayments: number;
}> => {
  const response = await api.get<EarningsResponse>('/payment/earnings');
  return response.data;
};

const getRevenue = async () => {
  const res = await api.get<RevenueResponse>('/payment/revenue');
  return res.data;
};

export const paymentService = {
  createCheckoutSession,
  getPaymentStatus,
  getEarnings,
  getRevenue,
};
