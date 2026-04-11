const testimonials = [
  {
    initials: 'JD',
    name: 'James Doe',
    title: 'Junior Developer at Shopify',
    avatarBg: 'bg-indigo-50',
    avatarText: 'text-indigo-700',
    quote:
      "Mentra's AI roadmap was a game-changer. I went from zero to landing my first dev job in 6 months.",
  },
  {
    initials: 'SL',
    name: 'Sophia Lee',
    title: 'Software Engineer at Meta',
    avatarBg: 'bg-purple-50',
    avatarText: 'text-purple-700',
    quote:
      'My mentor helped me crack interviews at top companies. The personalized feedback was invaluable.',
  },
  {
    initials: 'RB',
    name: 'Ravi Bhat',
    title: 'Data Scientist at Netflix',
    avatarBg: 'bg-green-50',
    avatarText: 'text-green-700',
    quote:
      "I've tried many platforms but Mentra is different. Real mentors, real progress, real results.",
  },
  {
    initials: 'AM',
    name: 'Amina Malik',
    title: 'Product Manager at Notion',
    avatarBg: 'bg-amber-50',
    avatarText: 'text-amber-700',
    quote:
      'The AI roadmap saved me months of confusion. I knew exactly what to learn and in what order.',
  },
  {
    initials: 'CW',
    name: 'Chris Wang',
    title: 'Frontend Engineer at Figma',
    avatarBg: 'bg-rose-50',
    avatarText: 'text-rose-700',
    quote:
      'My mentor reviewed my code every week and pushed me to think like a senior engineer. Worth every penny.',
  },
  {
    initials: 'FO',
    name: 'Fatima Omar',
    title: 'ML Engineer at Hugging Face',
    avatarBg: 'bg-teal-50',
    avatarText: 'text-teal-700',
    quote:
      'From complete beginner to ML engineer in under a year. Mentra made it possible with the right guidance.',
  },
];

const Stars = () => (
  <div className="flex items-center gap-0.5 mb-4">
    {[...Array(5)].map((_, i) => (
      <span key={i} className="text-amber-400 text-sm">
        ★
      </span>
    ))}
  </div>
);

const Testimonials = () => {
  return (
    <section id="testimonials" className="px-6 py-20 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-medium uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
            Testimonials
          </span>
          <h2
            className="text-4xl font-bold text-gray-900 tracking-tight mb-3"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            What learners say
          </h2>
          <p className="text-base text-gray-500 font-light max-w-lg mx-auto">
            Real stories from real learners who transformed their careers with
            Mentra.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-[#f8f7ff] border border-gray-200 rounded-2xl p-6 hover:border-indigo-200 transition-all duration-200"
            >
              <Stars />
              <p className="text-sm text-gray-600 leading-relaxed italic mb-6">
                {testimonial.quote}
              </p>
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full ${testimonial.avatarBg} ${testimonial.avatarText} flex items-center justify-center text-xs font-bold shrink-0`}
                  style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  {testimonial.initials}
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-gray-900">
                    {testimonial.name}
                  </h5>
                  <p className="text-xs text-gray-400">{testimonial.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
