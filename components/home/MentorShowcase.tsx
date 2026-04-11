import Link from 'next/link';

const mentors = [
  {
    initials: 'SR',
    name: 'Sarah Rahman',
    title: 'Senior Engineer at Google',
    avatarBg: 'bg-indigo-50',
    avatarText: 'text-indigo-700',
    tags: ['React', 'Node.js', 'System Design'],
    rating: '5.0',
    reviews: 128,
    rate: '$80/hr',
  },
  {
    initials: 'AK',
    name: 'Alex Kim',
    title: 'ML Engineer at OpenAI',
    avatarBg: 'bg-purple-50',
    avatarText: 'text-purple-700',
    tags: ['Python', 'ML', 'Deep Learning'],
    rating: '4.9',
    reviews: 94,
    rate: '$120/hr',
  },
  {
    initials: 'MP',
    name: 'Maria Perez',
    title: 'Product Lead at Stripe',
    avatarBg: 'bg-green-50',
    avatarText: 'text-green-700',
    tags: ['Product', 'UX', 'Strategy'],
    rating: '4.8',
    reviews: 76,
    rate: '$95/hr',
  },
  {
    initials: 'JT',
    name: 'James Thompson',
    title: 'Staff Engineer at Airbnb',
    avatarBg: 'bg-amber-50',
    avatarText: 'text-amber-700',
    tags: ['TypeScript', 'AWS', 'Architecture'],
    rating: '4.9',
    reviews: 112,
    rate: '$110/hr',
  },
  {
    initials: 'LN',
    name: 'Lena Nguyen',
    title: 'Data Scientist at Netflix',
    avatarBg: 'bg-rose-50',
    avatarText: 'text-rose-700',
    tags: ['Data Science', 'SQL', 'Visualization'],
    rating: '4.7',
    reviews: 58,
    rate: '$85/hr',
  },
  {
    initials: 'DM',
    name: 'David Mensah',
    title: 'DevOps Lead at Microsoft',
    avatarBg: 'bg-teal-50',
    avatarText: 'text-teal-700',
    tags: ['Docker', 'Kubernetes', 'CI/CD'],
    rating: '4.8',
    reviews: 83,
    rate: '$100/hr',
  },
];

const MentorShowcase = () => {
  return (
    <section id="mentors" className="px-6 py-20 bg-[#f8f7ff]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-medium uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
              Mentors
            </span>
            <h2
              className="text-4xl font-bold text-gray-900 tracking-tight mb-3"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Learn from the best
            </h2>
            <p className="text-base text-gray-500 font-light max-w-lg">
              Hand-picked experts with real-world experience, ready to guide
              your growth.
            </p>
          </div>
          <Link
            href="/mentors"
            className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-indigo-600 border border-indigo-200 px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition-all shrink-0"
          >
            Browse all mentors →
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {mentors.map((mentor) => (
            <div
              key={mentor.name}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-indigo-200 hover:-translate-y-1 transition-all duration-200"
            >
              {/* Top */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-12 h-12 rounded-full ${mentor.avatarBg} ${mentor.avatarText} flex items-center justify-center font-bold text-base shrink-0`}
                  style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  {mentor.initials}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">
                    {mentor.name}
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">{mentor.title}</p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {mentor.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <span className="text-amber-400 text-sm">★</span>
                  <span className="text-sm font-medium text-gray-800">
                    {mentor.rating}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({mentor.reviews} reviews)
                  </span>
                </div>
                <span className="text-sm font-semibold text-indigo-600">
                  {mentor.rate}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile browse all */}
        <div className="mt-8 text-center md:hidden">
          <Link
            href="/mentors"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 border border-indigo-200 px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition-all"
          >
            Browse all mentors →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MentorShowcase;
