import Link from 'next/link';

const CTABanner = () => {
  return (
    <section
      className="px-6 py-20 text-center"
      style={{
        background:
          'linear-gradient(135deg, #3730a3 0%, #4F46E5 50%, #7C3AED 100%)',
      }}
    >
      <div className="max-w-2xl mx-auto">
        <h2
          className="text-4xl font-bold text-white mb-4 tracking-tight"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          Ready to grow faster?
        </h2>
        <p className="text-base text-white/70 font-light mb-10 leading-relaxed">
          Join 12,000+ learners already building their skills with expert
          mentors and AI-powered roadmaps.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/register"
            className="px-7 py-3.5 bg-white text-indigo-600 text-sm font-semibold rounded-xl hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            Start for free today
          </Link>
          <Link
            href="#mentors"
            className="px-7 py-3.5 bg-white/10 text-white text-sm font-medium rounded-xl border border-white/20 hover:bg-white/20 transition-all"
          >
            Browse mentors
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
