import { useOutletContext } from 'react-router-dom';
import Hero from '../components/Hero/Hero';
import PetCarousel from '../components/PetCarousel/PetCarousel';
import Refugios from '../components/Refugios/Refugios';
import Donation from '../components/Donation/Donation';
import CitaCTA from '../components/CitaCTA/CitaCTA';
import type { ShellContext } from '../types/shell';

export default function HomePage() {
  const ctx = useOutletContext<ShellContext>();

  return (
    <>
      <Hero />
      <PetCarousel
        refreshKey={ctx.petsRefreshKey}
        onRequireAuth={ctx.openLogin}
        onRequireProfile={ctx.showToast}
      />
      <Refugios refreshKey={ctx.foundationsRefreshKey} />
      <Donation />
      <CitaCTA />
    </>
  );
}
