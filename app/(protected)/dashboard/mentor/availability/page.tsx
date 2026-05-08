'use client';

import axios from 'axios';
import { Clock, DollarSign, Loader2, Plus, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { mentorService } from '../../../../../services/mentor';
import { TAvailability } from '../../../../../store/useUserStore';

const DAYS: TAvailability['day'][] = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
];

const DAY_LABELS: Record<string, string> = {
  Sun: 'Sunday',
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
};

const AvailabilityPage = () => {
  const [slots, setSlots] = useState<TAvailability[]>([]);
  const [hourlyRate, setHourlyRate] = useState<string>('');
  const [initialSlots, setInitialSlots] = useState<TAvailability[]>([]);
  const [initialRate, setInitialRate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await mentorService.getAvailability();
        const availability = data.availability ?? [];
        const rate = data.hourlyRate?.toString() ?? '';

        setSlots(availability);
        setHourlyRate(rate);

        setInitialSlots(availability);
        setInitialRate(rate);
      } catch {
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const addSlot = () => {
    setSlots((prev) => [
      ...prev,
      { day: 'Mon', startTime: '09:00', endTime: '17:00' },
    ]);
  };

  const removeSlot = (index: number) => {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSlot = (
    index: number,
    field: keyof TAvailability,
    value: string,
  ) => {
    setSlots((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSave = async () => {
    const isSame =
      JSON.stringify(slots) === JSON.stringify(initialSlots) &&
      hourlyRate === initialRate;

    if (isSame) {
      toast.info('No changes detected.');
      return;
    }

    // Validate all slots
    for (const slot of slots) {
      if (slot.startTime >= slot.endTime) {
        toast.error(
          `End time must be after start time for ${DAY_LABELS[slot.day]}.`,
        );
        return;
      }
    }

    setSaving(true);
    try {
      const rate = hourlyRate ? parseFloat(hourlyRate) : undefined;
      await mentorService.updateAvailability(slots, rate);

      setInitialSlots(slots);
      setInitialRate(hourlyRate);

      toast.success('Availability updated successfully!');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(
          err.response?.data?.message || 'Failed to update availability.',
        );
      } else {
        toast.error('Failed to update availability.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold text-gray-900"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          Availability
        </h1>
        <p className="text-sm text-justify text-gray-500 mt-1">
          Set your available days and times so learners can book sessions with
          you.
        </p>
      </div>

      {/* Hourly rate */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign size={16} className="text-indigo-500" />
          <h2
            className="text-sm font-semibold text-gray-900"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            Hourly rate
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              $
            </span>
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="e.g. 50"
              min={0}
              className="w-full h-10 border border-gray-200 rounded-xl pl-7 pr-3 text-sm outline-none focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.08)] transition-all"
            />
          </div>
          <span className="text-sm text-gray-400">per hour</span>
        </div>
        <p className="text-xs text-justify text-gray-400 mt-2">
          Session price is calculated as: hourly rate ÷ 60 × duration minutes.
        </p>
      </div>

      {/* Availability slots */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-indigo-500" />
            <h2
              className="text-sm font-semibold text-gray-900"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Available time slots
            </h2>
          </div>
          <button
            onClick={addSlot}
            className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium hover:underline cursor-pointer"
          >
            <Plus size={13} /> Add slot
          </button>
        </div>

        {slots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
              <Clock size={22} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">
              No availability set
            </p>
            <p className="text-xs text-gray-400 mb-4">
              Add time slots to let learners know when you&apos;re available.
            </p>
            <button
              onClick={addSlot}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white rounded-xl transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              }}
            >
              <Plus size={13} /> Add first slot
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {slots.map((slot, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"
              >
                {/* Day selector */}
                <select
                  value={slot.day}
                  onChange={(e) =>
                    updateSlot(
                      index,
                      'day',
                      e.target.value as TAvailability['day'],
                    )
                  }
                  className="h-9 border border-gray-200 rounded-lg px-2 text-sm text-gray-700 outline-none focus:border-indigo-500 transition-all bg-white cursor-pointer"
                >
                  {DAYS.map((day) => (
                    <option key={day} value={day}>
                      {DAY_LABELS[day]}
                    </option>
                  ))}
                </select>
                {/* Start time */}
                <input
                  type="time"
                  value={slot.startTime}
                  onChange={(e) =>
                    updateSlot(index, 'startTime', e.target.value)
                  }
                  className="h-9 border border-gray-200 rounded-lg px-2 text-sm text-gray-700 outline-none focus:border-indigo-500 transition-all bg-white"
                />
                <span className="text-xs text-center text-gray-400">to</span>
                <input
                  type="time"
                  value={slot.endTime}
                  onChange={(e) => updateSlot(index, 'endTime', e.target.value)}
                  className="h-9 border border-gray-200 rounded-lg px-2 text-sm text-gray-700 outline-none focus:border-indigo-500 transition-all bg-white"
                />
                {/* Remove */}
                <button
                  onClick={() => removeSlot(index)}
                  className="ml-auto text-gray-300 hover:text-red-400 cursor-pointer transition-colors shrink-0"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={
          saving ||
          (JSON.stringify(slots) === JSON.stringify(initialSlots) &&
            hourlyRate === initialRate)
        }
        className="w-full h-11 flex items-center justify-center gap-2 text-sm font-medium text-white rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
      >
        {saving ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Saving...
          </>
        ) : (
          <>
            <Save size={16} /> Save availability
          </>
        )}
      </button>
    </div>
  );
};

export default AvailabilityPage;
