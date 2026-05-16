import CTABanner from '@/components/home/CTABanner';
import FAQ from '@/components/home/FAQ';
import Features from '@/components/home/Features';
import Hero from '@/components/home/Hero';
import HowItWorks from '@/components/home/HowItWorks';
import MentorShowcase from '@/components/home/MentorShowcase';
import Testimonials from '@/components/home/Testimonials';
import TopRankings from '@/components/home/TopRankings';
import Footer from '../components/shared/Footer';
import Navbar from '../components/shared/Navbar';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const HomePage = async () => {
  const [mentorsRes, learnersRes] = await Promise.all([
    fetch(`${BASE_URL}/api/v1/mentor/top-mentors`, {
      next: { revalidate: 60 * 60 },
    })
      .then((r) => r.json())
      .catch(() => ({ data: [] })),

    fetch(`${BASE_URL}/api/v1/learner/top-learners`, {
      next: { revalidate: 60 * 60 },
    })
      .then((r) => r.json())
      .catch(() => ({ data: [] })),
  ]);

  const topMentors = mentorsRes.data ?? [];
  const topLearners = learnersRes.data ?? [];

  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <TopRankings topMentors={topMentors} topLearners={topLearners} />
      <MentorShowcase />
      <Testimonials />
      <FAQ />
      <CTABanner />
      <Footer />
    </main>
  );
};

export default HomePage;
