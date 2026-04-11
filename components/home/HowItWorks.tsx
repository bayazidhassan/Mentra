const steps = [
  {
    num: '1',
    title: 'Create your profile',
    description:
      'Sign up and tell us your goals, current skill level, and what you want to learn.',
  },
  {
    num: '2',
    title: 'Get your roadmap',
    description:
      'Our AI generates a personalized learning roadmap tailored specifically to you.',
  },
  {
    num: '3',
    title: 'Match with a mentor',
    description:
      'Browse and connect with expert mentors who specialize in your learning goals.',
  },
  {
    num: '4',
    title: 'Start growing',
    description:
      'Book sessions, chat in real-time, and track your progress as you level up.',
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="px-6 py-20 bg-white">
      <div className="max-w-7xl mx-auto text-center">
        {/* Header */}
        <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-medium uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
          How it works
        </span>
        <h2
          className="text-4xl font-bold text-gray-900 tracking-tight mb-3"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          Up and running in minutes
        </h2>
        <p className="text-base text-gray-500 font-light max-w-lg mx-auto mb-16">
          Four simple steps to start your learning journey with a dedicated
          mentor.
        </p>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector line — desktop only */}
          <div className="hidden lg:block absolute top-7 left-[15%] right-[15%] h-px bg-gray-200 z-0" />

          {steps.map((step) => (
            <div
              key={step.num}
              className="relative flex flex-col items-center text-center z-10"
            >
              {/* Number circle */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold mb-5 shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                  fontFamily: 'Bricolage Grotesque, sans-serif',
                }}
              >
                {step.num}
              </div>
              <h3
                className="text-base font-semibold text-gray-900 mb-2"
                style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                {step.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-50">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
