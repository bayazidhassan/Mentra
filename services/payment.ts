import axiosInstance from '@/lib/axios';

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

// ─── Service ──────────────────────────────────────────────────────────────────

// Creates Stripe checkout session and returns the redirect URL
const createCheckoutSession = async (sessionId: string): Promise<string> => {
  const response = await axiosInstance.post<CheckoutResponse>(
    '/payment/create-checkout-session',
    { sessionId },
  );
  return response.data.data.url;
};

const getPaymentStatus = async (
  sessionId: string,
): Promise<TPayment | null> => {
  const response = await axiosInstance.get<PaymentStatusResponse>(
    `/payment/status/${sessionId}`,
  );
  return response.data.data;
};

const getEarnings = async (): Promise<{
  payments: TEarningPayment[];
  totalEarnings: number;
  totalPayments: number;
}> => {
  const response = await axiosInstance.get('/payment/earnings');
  return response.data.data;
};

export const paymentService = {
  createCheckoutSession,
  getPaymentStatus,
  getEarnings,
};
