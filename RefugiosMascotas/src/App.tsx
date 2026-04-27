import Navbar    from './components/Navbar/Navbar';
import Hero      from './components/Hero/Hero';
import PetCarousel from './components/PetCarousel/PetCarousel';
import Refugios  from './components/Refugios/Refugios';
import Donation  from './components/Donation/Donation';
import CitaCTA   from './components/CitaCTA/CitaCTA';
import Footer    from './components/Footer/Footer';

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <PetCarousel />
        <Refugios />
        <Donation />
        <CitaCTA />
      </main>
      <Footer />
    </>
  );
}
