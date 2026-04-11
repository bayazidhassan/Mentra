import Features from '../components/home/Features';
import Hero from '../components/home/Hero';
import HowItWorks from '../components/home/HowItWorks';
import Navbar from '../components/shared/Navbar';

const HomePage = () => {
  return (
    <main>
      <Navbar></Navbar>
      <Hero></Hero>
      <Features></Features>
      <HowItWorks></HowItWorks>
    </main>
  );
};

export default HomePage;
