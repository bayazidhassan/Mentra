import { CreditCard, DollarSign, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { TRevenue } from '../../../lib/services/payment';

type Props = {
  payments: TRevenue[];
  totalRevenue: number;
  adminProfit: number;
  totalPayments: number;
};

const RevenueClientPage = ({
  payments,
  totalRevenue,
  adminProfit,
  totalPayments,
}: Props) => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1
          className="text-2xl font-bold text-gray-900"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          Revenue
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          All paid sessions and platform revenue overview.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Total Revenue',
            value: `$${totalRevenue.toFixed(2)}`,
            sub: 'All paid sessions',
            icon: <DollarSign size={18} />,
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
          },
          {
            label: 'Admin Profit (5%)',
            value: `$${adminProfit.toFixed(2)}`,
            sub: '5% of total revenue',
            icon: <TrendingUp size={18} />,
            iconBg: 'bg-indigo-50',
            iconColor: 'text-indigo-600',
          },
          {
            label: 'Paid Sessions',
            value: totalPayments,
            sub: 'Total transactions',
            icon: <CreditCard size={18} />,
            iconBg: 'bg-purple-50',
            iconColor: 'text-purple-600',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-gray-200 rounded-2xl p-5"
          >
            <div
              className={`w-9 h-9 ${stat.iconBg} ${stat.iconColor} rounded-xl flex items-center justify-center mb-3`}
            >
              {stat.icon}
            </div>
            <div className="flex flex-col items-center">
              <p
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                {stat.value}
              </p>
              <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
              <p className="text-xs text-gray-400">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Payment list */}
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
              Paid sessions will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment._id}
                className="border border-gray-100 rounded-2xl p-5 hover:border-indigo-100 transition-all"
              >
                {/* Session title + amount */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {payment.session?.title ?? 'Session'}
                    </p>
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
                  </div>
                  <div className="flex sm:flex-col sm:text-right items-center sm:items-end gap-2 sm:gap-0 shrink-0">
                    <p className="text-base font-bold text-green-600">
                      +${payment.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400 sm:mt-0.5">
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

                {/* Learner + Mentor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Learner */}
                  {payment.learner && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      {payment.learner.profileImage ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                          <Image
                            src={payment.learner.profileImage}
                            alt={payment.learner.name}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                          {payment.learner.name[0].toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate">
                          {payment.learner.name}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">
                          {payment.learner.email}
                        </p>
                        <p className="text-[11px] text-indigo-500">Learner</p>
                      </div>
                    </div>
                  )}

                  {/* Mentor */}
                  {payment.mentor && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      {payment.mentor.profileImage ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                          <Image
                            src={payment.mentor.profileImage}
                            alt={payment.mentor.name}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs shrink-0">
                          {payment.mentor.name[0].toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate">
                          {payment.mentor.name}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">
                          {payment.mentor.email}
                        </p>
                        <p className="text-[11px] text-purple-500">Mentor</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueClientPage;
