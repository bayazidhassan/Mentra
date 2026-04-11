import Link from 'next/link';

const Hero = () => {
  return (
    <section className="px-6 py-20 text-center bg-linear-to-b from-[#f5f4ff] to-white relative overflow-hidden">
      {/* Background circle */}
      <div className="absolute w-150 h-150 rounded-full bg-indigo-500/5 -top-48 left-1/2 -translate-x-1/2 pointer-events-none" />

      {/* Badge */}
      <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium px-4 py-1.5 rounded-full mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
        AI-Powered Learning & Mentorship Platform
      </div>

      {/* Headline */}
      <h1
        className="text-5xl md:text-6xl font-bold leading-tight tracking-tight text-gray-900 mb-5"
        style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
      >
        Learn smarter.
        <br />
        Grow{' '}
        <span
          className="text-transparent bg-clip-text"
          style={{
            backgroundImage: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
          }}
        >
          faster.
        </span>
        <br />
        Connect deeper.
      </h1>

      {/* Subheading */}
      <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10 font-light leading-relaxed">
        Get personalized AI learning roadmaps and connect with expert mentors
        who help you reach your goals — faster than ever.
      </p>

      {/* CTA buttons */}
      <div className="flex items-center justify-center gap-3 mb-14">
        <Link
          href="/register"
          className="px-7 py-3.5 text-sm font-medium text-white rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200"
          style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
        >
          Start learning for free
        </Link>
        <Link
          href="#mentors"
          className="px-7 py-3.5 text-sm font-medium text-gray-800 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition-all"
        >
          Browse mentors
        </Link>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap items-center justify-center gap-10 pt-8 border-t border-gray-200 max-w-2xl mx-auto">
        {[
          { num: '12k+', label: 'Active learners' },
          { num: '800+', label: 'Expert mentors' },
          { num: '95%', label: 'Satisfaction rate' },
          { num: '50+', label: 'Skill categories' },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <p
              className="text-3xl font-bold text-indigo-600"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              {stat.num}
            </p>
            <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Hero;
