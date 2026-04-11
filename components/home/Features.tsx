const features = [
  {
    icon: '🗺️',
    iconBg: 'bg-indigo-50',
    title: 'AI learning roadmaps',
    description:
      'Get a personalized step-by-step learning plan built around your goals, experience level, and available time.',
  },
  {
    icon: '💬',
    iconBg: 'bg-green-50',
    title: 'Real-time chat',
    description:
      'Message your mentor anytime. Get instant answers, feedback, and guidance without waiting for a scheduled session.',
  },
  {
    icon: '📅',
    iconBg: 'bg-purple-50',
    title: 'Session booking',
    description:
      'Schedule 1-on-1 video sessions with mentors at times that work for you. No back-and-forth emails needed.',
  },
  {
    icon: '🎯',
    iconBg: 'bg-amber-50',
    title: 'Goal tracking',
    description:
      'Track your progress against your learning roadmap. Celebrate milestones and stay motivated every step of the way.',
  },
  {
    icon: '🔍',
    iconBg: 'bg-rose-50',
    title: 'Mentor matching',
    description:
      'Our AI finds the perfect mentor for your goals, learning style, and budget from our curated expert network.',
  },
  {
    icon: '⚡',
    iconBg: 'bg-teal-50',
    title: 'Instant feedback',
    description:
      'Submit projects and get detailed, actionable feedback from your mentor — typically within 24 hours.',
  },
];

const Features = () => {
  return (
    <section id="features" className="px-6 py-20 bg-[#f8f7ff]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-medium uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
            Features
          </span>
          <h2
            className="text-4xl font-bold text-gray-900 tracking-tight mb-3"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            Everything you need to grow
          </h2>
          <p className="text-base text-gray-500 font-light max-w-lg">
            From AI-generated roadmaps to real-time mentorship sessions — Mentra
            has it all.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white border border-gray-200 rounded-2xl p-7 hover:border-indigo-200 hover:-translate-y-1 transition-all duration-200"
            >
              <div
                className={`w-11 h-11 ${feature.iconBg} rounded-xl flex items-center justify-center text-xl mb-4`}
              >
                {feature.icon}
              </div>
              <h3
                className="text-base font-semibold text-gray-900 mb-2"
                style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
