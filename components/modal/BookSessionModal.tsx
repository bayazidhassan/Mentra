'use client';

import axios from 'axios';
import { Calendar, Clock, DollarSign, Loader2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { sessionService, TAvailabilitySlot } from '../../services/session';

type Props = {
  mentorProfileId: string;
  mentorName: string;
  onClose: () => void;
  onSuccess: () => void;
};

const DAY_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

// Format a time string like "09:00" → "9:00 AM"
const formatTime = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
};

// Get the next N days that fall on available days
const getAvailableDates = (
  availability: TAvailabilitySlot[],
  count = 30,
): { date: Date; slot: TAvailabilitySlot }[] => {
  const availableDayNumbers = new Set(availability.map((a) => DAY_MAP[a.day]));
  const results: { date: Date; slot: TAvailabilitySlot }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cursor = new Date(today);
  cursor.setDate(cursor.getDate() + 1); // start from tomorrow

  while (results.length < count) {
    const dayNum = cursor.getUTCDay();
    if (availableDayNumbers.has(dayNum)) {
      const slot = availability.find((a) => DAY_MAP[a.day] === dayNum)!;
      results.push({ date: new Date(cursor), slot });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return results;
};

const BookSessionModal = ({
  mentorProfileId,
  mentorName,
  onClose,
  onSuccess,
}: Props) => {
  const [availability, setAvailability] = useState<TAvailabilitySlot[]>([]);
  const [hourlyRate, setHourlyRate] = useState<number | undefined>();
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDateIndex, setSelectedDateIndex] = useState<number | null>(
    null,
  );
  const [durationMinutes, setDurationMinutes] = useState('');

  // Fetch mentor availability
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const data = await sessionService.getAvailableSlots(mentorProfileId);
        setAvailability(data.availability);
        setHourlyRate(data.hourlyRate);
      } catch {
        toast.error('Failed to load mentor availability.');
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [mentorProfileId]);

  // Build list of available dates from availability
  const availableDates = useMemo(
    () => (availability.length > 0 ? getAvailableDates(availability, 30) : []),
    [availability],
  );

  // Calculate estimated price
  const estimatedPrice = useMemo(() => {
    const dur = parseInt(durationMinutes);
    if (!hourlyRate || isNaN(dur) || dur <= 0) return null;
    return ((hourlyRate / 60) * dur).toFixed(2);
  }, [hourlyRate, durationMinutes]);

  const selectedEntry =
    selectedDateIndex !== null ? availableDates[selectedDateIndex] : null;

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please enter a session title.');
      return;
    }
    if (selectedDateIndex === null) {
      toast.error('Please select a date.');
      return;
    }
    const dur = parseInt(durationMinutes);
    if (!durationMinutes || isNaN(dur) || dur <= 0) {
      toast.error('Please enter a valid duration.');
      return;
    }

    // Build scheduledAt ISO from selected date + slot startTime
    const entry = availableDates[selectedDateIndex];
    const [hours, minutes] = entry.slot.startTime.split(':').map(Number);
    const scheduledAt = new Date(entry.date);
    scheduledAt.setUTCHours(hours, minutes, 0, 0);

    setSubmitting(true);
    try {
      await sessionService.bookSession({
        mentorProfileId,
        title: title.trim(),
        description: description.trim() || undefined,
        scheduledAt: scheduledAt.toISOString(),
        durationMinutes: dur,
      });
      toast.success('Session booked! Waiting for mentor to accept.');
      onSuccess();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Failed to book session.');
      } else {
        toast.error('Failed to book session.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2
              className="text-lg font-bold text-gray-900"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Book a session
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">with {mentorName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {loadingSlots ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Session title <span className="text-red-400">*</span>
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. React fundamentals review"
                  className="w-full h-10 border border-gray-200 rounded-xl px-3 text-sm outline-none focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.08)] transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Description <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What do you want to cover in this session?"
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.08)] transition-all resize-none"
                />
              </div>

              {/* Date picker */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  <Calendar size={13} className="inline mr-1 text-indigo-500" />
                  Select date <span className="text-red-400">*</span>
                </label>

                {availability.length === 0 ? (
                  <div className="text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-3">
                    This mentor has not set their availability yet. You can
                    still book — they will confirm the time.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {availableDates.slice(0, 12).map((entry, i) => {
                      const isSelected = selectedDateIndex === i;
                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedDateIndex(i)}
                          className={`flex flex-col items-center py-2.5 px-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                              : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                          }`}
                        >
                          <span className="text-gray-400 font-normal">
                            {entry.slot.day}
                          </span>
                          <span className="text-base font-bold mt-0.5">
                            {entry.date.getDate()}
                          </span>
                          <span className="text-gray-400 font-normal">
                            {entry.date.toLocaleString('default', {
                              month: 'short',
                            })}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Show selected slot time */}
                {selectedEntry && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg">
                    <Clock size={12} />
                    Available: {formatTime(selectedEntry.slot.startTime)} –{' '}
                    {formatTime(selectedEntry.slot.endTime)}
                  </div>
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  <Clock size={13} className="inline mr-1 text-indigo-500" />
                  Duration (minutes) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  placeholder="e.g. 30, 60, 90"
                  min={15}
                  className="w-full h-10 border border-gray-200 rounded-xl px-3 text-sm outline-none focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.08)] transition-all"
                />
              </div>

              {/* Estimated price */}
              {estimatedPrice && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                  <DollarSign size={14} className="text-green-500 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-green-700">
                      Estimated price
                    </p>
                    <p className="text-sm font-bold text-green-700">
                      ${estimatedPrice}
                    </p>
                  </div>
                  <p className="text-xs text-green-500 ml-auto">
                    ${hourlyRate}/hr × {durationMinutes} min
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-10 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:border-gray-300 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || loadingSlots}
            className="flex-1 h-10 flex items-center justify-center gap-2 text-sm font-medium text-white rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
          >
            {submitting ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Booking...
              </>
            ) : (
              'Book session'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookSessionModal;
