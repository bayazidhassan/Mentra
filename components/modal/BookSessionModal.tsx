'use client';

import axios from 'axios';
import { Calendar, Clock, DollarSign, Loader2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { sessionService } from '../../services/session';
import { TAvailability } from '../../store/useUserStore';

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

const formatTime = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
};

const timeToMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const minutesToTime = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

// Build a local Date for a given date + "HH:MM" time string (local time)
const buildLocalDate = (date: Date, time: string): Date => {
  const [h, m] = time.split(':').map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
};

const getAvailableDates = (
  availability: TAvailability[],
  count = 30,
): { date: Date; slot: TAvailability }[] => {
  const availableDayNumbers = new Set(availability.map((a) => DAY_MAP[a.day]));
  const results: { date: Date; slot: TAvailability }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cursor = new Date(today);
  cursor.setDate(cursor.getDate() + 1);

  while (results.length < count) {
    const dayNum = cursor.getDay(); // ✅ local day
    if (availableDayNumbers.has(dayNum)) {
      const slot = availability.find((a) => DAY_MAP[a.day] === dayNum)!;
      results.push({ date: new Date(cursor), slot });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return results;
};

/**
 * Given a date + slot + booked sessions, compute the effective available window.
 * Returns null if the slot is fully booked.
 */
const getEffectiveWindow = (
  date: Date,
  slot: TAvailability,
  bookedSlots: { start: string; end: string }[],
): {
  effectiveStart: string;
  effectiveEnd: string;
  maxMinutes: number;
} | null => {
  const slotStartMin = timeToMinutes(slot.startTime);
  const slotEndMin = timeToMinutes(slot.endTime);

  // Find all bookings that overlap this date's slot
  const slotStartDate = buildLocalDate(date, slot.startTime);
  const slotEndDate = buildLocalDate(date, slot.endTime);

  // Collect booked intervals (in minutes from midnight) that fall within this slot
  const bookedIntervals: { start: number; end: number }[] = [];

  for (const booked of bookedSlots) {
    const bookedStart = new Date(booked.start);
    const bookedEnd = new Date(booked.end);

    // Check if this booking overlaps with our slot on this date
    if (bookedStart < slotEndDate && bookedEnd > slotStartDate) {
      const overlapStart = Math.max(
        bookedStart.getHours() * 60 + bookedStart.getMinutes(),
        slotStartMin,
      );
      const overlapEnd = Math.min(
        bookedEnd.getHours() * 60 + bookedEnd.getMinutes(),
        slotEndMin,
      );
      if (overlapEnd > overlapStart) {
        bookedIntervals.push({ start: overlapStart, end: overlapEnd });
      }
    }
  }

  if (bookedIntervals.length === 0) {
    // Nothing booked — full slot available
    return {
      effectiveStart: slot.startTime,
      effectiveEnd: slot.endTime,
      maxMinutes: slotEndMin - slotStartMin,
    };
  }

  // Sort by start time
  bookedIntervals.sort((a, b) => a.start - b.start);

  // Find the first free gap starting from slotStart
  let freeFrom = slotStartMin;
  for (const interval of bookedIntervals) {
    if (interval.start <= freeFrom) {
      freeFrom = Math.max(freeFrom, interval.end);
    } else {
      break;
    }
  }

  const remaining = slotEndMin - freeFrom;
  if (remaining <= 0) return null; // fully booked

  return {
    effectiveStart: minutesToTime(freeFrom),
    effectiveEnd: slot.endTime,
    maxMinutes: remaining,
  };
};

const BookSessionModal = ({
  mentorProfileId,
  mentorName,
  onClose,
  onSuccess,
}: Props) => {
  const [availability, setAvailability] = useState<TAvailability[]>([]);
  const [hourlyRate, setHourlyRate] = useState<number | undefined>();
  const [bookedSlots, setBookedSlots] = useState<
    { start: string; end: string }[]
  >([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDateIndex, setSelectedDateIndex] = useState<number | null>(
    null,
  );
  const [durationMinutes, setDurationMinutes] = useState('');

  // Fetch mentor availability + booked slots
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const data = await sessionService.getAvailableSlots(mentorProfileId);
        setAvailability(data.availability);
        setHourlyRate(data.hourlyRate);
        setBookedSlots(data.bookedSlots ?? []);
      } catch {
        toast.error('Failed to load mentor availability.');
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [mentorProfileId]);

  // Build list of available dates
  const availableDates = useMemo(
    () => (availability.length > 0 ? getAvailableDates(availability, 30) : []),
    [availability],
  );

  // Compute effective window per date (memoized)
  const effectiveWindows = useMemo(() => {
    return availableDates
      .slice(0, 12)
      .map((entry) => getEffectiveWindow(entry.date, entry.slot, bookedSlots));
  }, [availableDates, bookedSlots]);

  // Selected entry's effective window
  const selectedWindow =
    selectedDateIndex !== null ? effectiveWindows[selectedDateIndex] : null;

  const maxDuration = selectedWindow?.maxMinutes ?? 0;

  // Estimated price
  const estimatedPrice = useMemo(() => {
    const dur = parseInt(durationMinutes);
    if (!hourlyRate || isNaN(dur) || dur <= 0) return null;
    return ((hourlyRate / 60) * dur).toFixed(2);
  }, [hourlyRate, durationMinutes]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please enter a session title.');
      return;
    }
    if (selectedDateIndex === null) {
      toast.error('Please select a date.');
      return;
    }
    if (!selectedWindow) {
      toast.error('This slot is fully booked. Please choose another date.');
      return;
    }
    const dur = parseInt(durationMinutes);
    if (!durationMinutes || isNaN(dur) || dur <= 0) {
      toast.error('Please enter a valid duration.');
      return;
    }
    if (dur > maxDuration) {
      toast.error(`Maximum allowed duration is ${maxDuration} minutes.`);
      return;
    }

    const entry = availableDates[selectedDateIndex];

    // ✅ Build scheduledAt using effective start time in LOCAL time
    const scheduledAt = buildLocalDate(
      entry.date,
      selectedWindow.effectiveStart,
    );

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
                    This mentor has not set their availability yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {availableDates.slice(0, 12).map((entry, i) => {
                      const isSelected = selectedDateIndex === i;
                      const window = effectiveWindows[i];
                      const fullyBooked = window === null;

                      return (
                        <button
                          key={i}
                          onClick={() => {
                            if (fullyBooked) return;
                            setSelectedDateIndex(i);
                            // Reset duration when date changes
                            setDurationMinutes('');
                          }}
                          disabled={fullyBooked}
                          className={`flex flex-col items-center py-2.5 px-2 rounded-xl border text-xs font-medium transition-all ${
                            fullyBooked
                              ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                              : isSelected
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-600 cursor-pointer'
                                : 'border-gray-200 text-gray-600 hover:border-indigo-300 cursor-pointer'
                          }`}
                        >
                          <span className="font-normal opacity-60">
                            {entry.slot.day}
                          </span>
                          <span className="text-base font-bold mt-0.5">
                            {entry.date.getDate()}
                          </span>
                          <span className="font-normal opacity-60">
                            {entry.date.toLocaleString('default', {
                              month: 'short',
                            })}
                          </span>
                          {fullyBooked && (
                            <span className="text-[9px] text-red-400 font-medium mt-0.5">
                              Booked
                            </span>
                          )}
                          {!fullyBooked &&
                            window &&
                            window.effectiveStart !== entry.slot.startTime && (
                              <span className="text-[9px] text-amber-500 font-medium mt-0.5">
                                Partial
                              </span>
                            )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Show effective available window */}
                {selectedDateIndex !== null && selectedWindow && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg">
                    <Clock size={12} />
                    Available: {formatTime(
                      selectedWindow.effectiveStart,
                    )} – {formatTime(selectedWindow.effectiveEnd)}
                    <span className="ml-auto text-indigo-400">
                      {selectedWindow.maxMinutes} min remaining
                    </span>
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
                  onChange={(e) => {
                    const value = e.target.value;
                    const num = parseInt(value);
                    if (!isNaN(num) && num > maxDuration) {
                      toast.error(`Max duration is ${maxDuration} min`);
                      return;
                    }
                    setDurationMinutes(value);
                  }}
                  placeholder={
                    maxDuration > 0
                      ? `Max ${maxDuration} min (e.g. 30, 60, 90)`
                      : 'Select a date first'
                  }
                  min={15}
                  max={maxDuration || undefined}
                  disabled={selectedDateIndex === null}
                  className="w-full h-10 border border-gray-200 rounded-xl px-3 text-sm outline-none focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.08)] transition-all disabled:bg-gray-50 disabled:text-gray-400"
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
