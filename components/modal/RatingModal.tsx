'use client';

import axios from 'axios';
import { Loader2, Star, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { sessionService } from '../../services/session';

type Props = {
  sessionId: string;
  sessionTitle: string;
  role: 'learner' | 'mentor';
  otherUserName: string;
  onClose: () => void;
  onSuccess: (sessionId: string, rating: number, feedback: string) => void;
};

const RatingModal = ({
  sessionId,
  sessionTitle,
  role,
  otherUserName,
  onClose,
  onSuccess,
}: Props) => {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a star rating.');
      return;
    }

    setSubmitting(true);
    try {
      await sessionService.rateSession(
        sessionId,
        rating,
        feedback || undefined,
      );
      toast.success('Review submitted!');
      onSuccess(sessionId, rating, feedback);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Failed to submit review.');
      } else {
        toast.error('Failed to submit review.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];
  const activeRating = hovered || rating;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2
              className="text-lg font-bold text-gray-900"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Leave a review
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-65">
              {sessionTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          {/* Who you're rating */}
          <p className="text-sm text-gray-500 text-center">
            How was your session with{' '}
            <span className="font-semibold text-gray-800">{otherUserName}</span>
            ?
          </p>

          {/* Star rating */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="cursor-pointer transition-transform hover:scale-110"
                >
                  <Star
                    size={36}
                    className={
                      star <= activeRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-200 fill-gray-200'
                    }
                  />
                </button>
              ))}
            </div>
            {/* Label */}
            <p
              className={`text-sm font-medium transition-all ${
                activeRating > 0 ? 'text-yellow-500' : 'text-transparent'
              }`}
            >
              {ratingLabels[activeRating]}
            </p>
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Feedback <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={
                role === 'learner'
                  ? 'Share your experience with this mentor...'
                  : 'Share your thoughts about this learner...'
              }
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.08)] transition-all resize-none"
            />
          </div>
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
            disabled={submitting || rating === 0}
            className="flex-1 h-10 flex items-center justify-center gap-2 text-sm font-medium text-white rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
          >
            {submitting ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Submitting...
              </>
            ) : (
              'Submit review'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
