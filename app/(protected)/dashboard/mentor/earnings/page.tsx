'use client';

import { CreditCard, DollarSign } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  paymentService,
  TEarningPayment,
} from '../../../../../services/payment';

const EarningsPage = () => {
  const [payments, setPayments] = useState<TEarningPayment[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalPayments, setTotalPayments] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await paymentService.getEarnings();
        setPayments(data.payments);
        setTotalEarnings(data.totalEarnings);
        setTotalPayments(data.totalPayments);
      } catch {
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold text-gray-900"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          Earnings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Track your payment history and total earnings.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <DollarSign size={20} className="text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-500">Total earnings</p>
          </div>
          <div className="flex flex-col items-center">
            <p
              className="text-3xl font-bold text-gray-900"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              ${totalEarnings.toFixed(2)}
            </p>
            <p className="text-xs text-gray-400 mt-1">From paid sessions</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <CreditCard size={20} className="text-indigo-600" />
            </div>
            <p className="text-sm font-medium text-gray-500">Paid sessions</p>
          </div>
          <div className="flex flex-col items-center">
            <p
              className="text-3xl font-bold text-gray-900"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              {totalPayments}
            </p>
            <p className="text-xs text-gray-400 mt-1">Completed payments</p>
          </div>
        </div>
      </div>

      {/* Payment history */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2
          className="text-base font-semibold text-gray-900 mb-5"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          Payment history
        </h2>

        {payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <DollarSign size={24} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">No payments yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Earnings from paid sessions will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment._id}
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100"
              >
                {/* Learner avatar */}
                {payment.learner?.profileImage ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                    <Image
                      src={payment.learner.profileImage}
                      alt={payment.learner.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                    {payment.learner?.name[0]?.toUpperCase() ?? 'L'}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  {/* Session Title */}
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {payment.session?.title ?? 'Session'}
                  </p>

                  {/* Name */}
                  <p className="text-xs text-gray-500 mt-0.5">
                    {payment.learner?.name ?? 'Learner'}
                  </p>

                  {/* Email */}
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {payment.learner?.email ?? 'No email'}
                  </p>

                  {/* Date + Time + Duration (below email) */}
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                    {payment.session?.scheduledAt && (
                      <span>
                        {new Date(payment.session.scheduledAt).toLocaleString(
                          undefined,
                          {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          },
                        )}
                      </span>
                    )}

                    {payment.session?.durationMinutes && (
                      <>
                        <span className="text-gray-300">|</span>
                        <span>{payment.session.durationMinutes} min</span>
                      </>
                    )}
                  </div>
                </div>
                {/* Amount + date */}
                <div className="text-right shrink-0">
                  <p className="text-base font-bold text-green-600">
                    +${payment.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(payment.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EarningsPage;
