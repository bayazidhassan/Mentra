import Features from '../components/home/Features';
import Hero from '../components/home/Hero';
import Navbar from '../components/shared/Navbar';

const HomePage = () => {
  return (
    <main>
      <Navbar></Navbar>
      <Hero></Hero>
      <Features></Features>
    </main>
  );
};

export default HomePage;
