import { CheckCircle, Map, Star } from 'lucide-react';
import Image from 'next/image';

type TTopMentor = {
  _id: string;
  name: string;
  email: string;
  profileImage: string | null;
  bio: string | null;
  skills: string[];
  experience: string | null;
  rating: number;
  totalReviews: number;
  hourlyRate: number | null;
  completedSessions: number;
};

type TTopLearner = {
  _id: string;
  name: string;
  email: string;
  profileImage: string | null;
  completedSessions: number;
  completedRoadmaps: number;
  skills: string[];
};

type Props = {
  topMentors: TTopMentor[];
  topLearners: TTopLearner[];
};

const avatarColors = [
  { bg: 'bg-indigo-50', text: 'text-indigo-700' },
  { bg: 'bg-purple-50', text: 'text-purple-700' },
  { bg: 'bg-green-50', text: 'text-green-700' },
  { bg: 'bg-amber-50', text: 'text-amber-700' },
  { bg: 'bg-rose-50', text: 'text-rose-700' },
  { bg: 'bg-teal-50', text: 'text-teal-700' },
];

const TopRankings = ({ topMentors, topLearners }: Props) => {
  if (topMentors.length === 0 && topLearners.length === 0) return null;

  return (
    <section className="px-6 py-20 bg-white">
      <div className="max-w-7xl mx-auto space-y-20">
        {/* ── Top Mentors ── */}
        {topMentors.length > 0 && (
          <div>
            <div className="mb-12">
              <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-medium uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
                Top Mentors
              </span>
              <h2
                className="text-4xl font-bold text-gray-900 tracking-tight mb-3"
                style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                Highest rated mentors
              </h2>
              <p className="text-base text-gray-500 font-light max-w-lg">
                Ranked by average rating and number of completed sessions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {topMentors.map((mentor, index) => {
                const color = avatarColors[index % avatarColors.length];
                return (
                  <div
                    key={mentor._id}
                    className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-indigo-200 hover:-translate-y-1 transition-all duration-200"
                  >
                    {/* Rank badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {mentor.profileImage ? (
                          <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                            <Image
                              src={mentor.profileImage}
                              alt={mentor.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div
                            className={`w-12 h-12 rounded-full ${color.bg} ${color.text} flex items-center justify-center font-bold text-base shrink-0`}
                            style={{
                              fontFamily: 'Bricolage Grotesque, sans-serif',
                            }}
                          >
                            {mentor.name[0].toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {mentor.name}
                          </h4>
                          {mentor.hourlyRate && (
                            <p className="text-xs text-indigo-600 font-medium mt-0.5">
                              ${mentor.hourlyRate}/hr
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className="text-xs font-bold text-gray-400"
                        style={{
                          fontFamily: 'Bricolage Grotesque, sans-serif',
                        }}
                      >
                        #{index + 1}
                      </span>
                    </div>

                    {/* Bio */}
                    {mentor.bio && (
                      <p className="text-xs text-gray-500 leading-relaxed mb-2 line-clamp-2">
                        {mentor.bio}
                      </p>
                    )}

                    {/* Experience */}
                    {mentor.experience && (
                      <p className="text-xs text-gray-400 leading-relaxed mb-3 line-clamp-1">
                        {mentor.experience}
                      </p>
                    )}

                    {/* Skills */}
                    {mentor.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {mentor.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {mentor.skills.length > 3 && (
                          <span className="text-xs font-medium bg-gray-50 text-gray-500 px-2.5 py-1 rounded-full">
                            +{mentor.skills.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <Star
                          size={13}
                          className="fill-amber-400 text-amber-400"
                        />
                        <span className="text-sm font-medium text-gray-800">
                          {mentor.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({mentor.totalReviews} reviews)
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <CheckCircle size={12} className="text-green-500" />
                        {mentor.completedSessions} sessions
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Top Learners ── */}
        {topLearners.length > 0 && (
          <div>
            <div className="mb-12">
              <span className="inline-block bg-purple-50 text-purple-700 text-xs font-medium uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
                Top Learners
              </span>
              <h2
                className="text-4xl font-bold text-gray-900 tracking-tight mb-3"
                style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                Most active learners
              </h2>
              <p className="text-base text-gray-500 font-light max-w-lg">
                Ranked by completed sessions and roadmaps finished.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {topLearners.map((learner, index) => {
                const color = avatarColors[index % avatarColors.length];
                return (
                  <div
                    key={learner._id}
                    className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-purple-200 hover:-translate-y-1 transition-all duration-200"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {learner.profileImage ? (
                          <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                            <Image
                              src={learner.profileImage}
                              alt={learner.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div
                            className={`w-12 h-12 rounded-full ${color.bg} ${color.text} flex items-center justify-center font-bold text-base shrink-0`}
                            style={{
                              fontFamily: 'Bricolage Grotesque, sans-serif',
                            }}
                          >
                            {learner.name[0].toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {learner.name}
                          </h4>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">
                            {learner.email}
                          </p>
                        </div>
                      </div>
                      <span
                        className="text-xs font-bold text-gray-400"
                        style={{
                          fontFamily: 'Bricolage Grotesque, sans-serif',
                        }}
                      >
                        #{index + 1}
                      </span>
                    </div>

                    {/* Skills */}
                    {learner.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {learner.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="text-xs font-medium bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {learner.skills.length > 3 && (
                          <span className="text-xs font-medium bg-gray-50 text-gray-500 px-2.5 py-1 rounded-full">
                            +{learner.skills.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <CheckCircle size={12} className="text-green-500" />
                        {learner.completedSessions} sessions
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Map size={12} className="text-indigo-400" />
                        {learner.completedRoadmaps} roadmaps
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TopRankings;
