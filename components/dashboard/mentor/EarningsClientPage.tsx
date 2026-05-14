'use client';

import { CreditCard, DollarSign } from 'lucide-react';
import Image from 'next/image';
import { TEarningPayment } from '../../../lib/services/payment';

type Props = {
  payments: TEarningPayment[];
  totalEarnings: number;
  totalPayments: number;
};

const EarningsClientPage = ({
  payments,
  totalEarnings,
  totalPayments,
}: Props) => {
  return (
    <div className="max-w-4xl mx-auto space-y-4 p-2">
      {/* Header */}
      <div>
        <h1
          className="text-xl sm:text-2xl font-bold text-gray-900"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          Earnings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Track your payment history and total earnings.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-2 mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
              <DollarSign size={18} className="text-green-600" />
            </div>
          </div>
          <div className="flex flex-col items-center">
            <p
              className="text-lg md:text-2xl font-bold text-gray-900"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              ${totalEarnings.toFixed(2)}
            </p>
            <p className="text-xs text-gray-400 mt-1"> Total Earnings</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
              <CreditCard size={18} className="text-indigo-600" />
            </div>
          </div>
          <div className="flex flex-col items-center">
            <p
              className="text-lg md:text-2xl font-bold text-gray-900"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              {totalPayments}
            </p>
            <p className="text-xs text-gray-400 mt-1">Paid Sessions</p>
          </div>
        </div>
      </div>

      {/* Payment history */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6">
        <h2
          className="text-base font-semibold text-gray-900 mb-4 sm:mb-5"
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
                className="flex items-start gap-3 p-3 sm:p-4 rounded-xl bg-gray-50 border border-gray-100"
              >
                {/* Learner avatar */}
                {payment.learner?.profileImage ? (
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden shrink-0">
                    <Image
                      src={payment.learner.profileImage}
                      alt={payment.learner.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                    {payment.learner?.name[0]?.toUpperCase() ?? 'L'}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {payment.session?.title ?? 'Session'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {payment.learner?.name ?? 'Learner'}
                  </p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {payment.learner?.email ?? 'No email'}
                  </p>

                  {/* Date + Duration */}
                  <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-gray-400 mt-0.5">
                    {payment.session?.scheduledAt && (
                      <span>
                        {new Date(
                          payment.session.scheduledAt,
                        ).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                        {' · '}
                        {new Date(
                          payment.session.scheduledAt,
                        ).toLocaleTimeString(undefined, {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </span>
                    )}
                    {payment.session?.durationMinutes && (
                      <span>· {payment.session.durationMinutes} min</span>
                    )}
                  </div>

                  {/* Amount shown below info on mobile only */}
                  <div className="md:hidden mt-2">
                    <p className="text-sm font-bold text-green-600">
                      +${payment.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(payment.createdAt).toLocaleDateString(
                        undefined,
                        {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        },
                      )}
                    </p>
                  </div>
                </div>

                {/* Amount + date — right side on md+ */}
                <div className="hidden md:block text-right shrink-0">
                  <p className="text-base font-bold text-green-600">
                    +${payment.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(payment.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
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

export default EarningsClientPage;
