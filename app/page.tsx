import CTABanner from '../components/home/CTABanner';
import FAQ from '../components/home/FAQ';
import Features from '../components/home/Features';
import Footer from '../components/home/Footer';
import Hero from '../components/home/Hero';
import HowItWorks from '../components/home/HowItWorks';
import MentorShowcase from '../components/home/MentorShowcase';
import Testimonials from '../components/home/Testimonials';
import Navbar from '../components/shared/Navbar';

const HomePage = () => {
  return (
    <main>
      <Navbar></Navbar>
      <Hero></Hero>
      <Features></Features>
      <HowItWorks></HowItWorks>
      <MentorShowcase></MentorShowcase>
      <Testimonials></Testimonials>
      <FAQ></FAQ>
      <CTABanner></CTABanner>
      <Footer></Footer>
    </main>
  );
};

export default HomePage;
