import { Routes, Route } from 'react-router-dom';

import Navbar          from './components/Navbar/Navbar';
import Hero            from './components/Hero/Hero';
import PetCarousel     from './components/PetCarousel/PetCarousel';
import Refugios        from './components/Refugios/Refugios';
import Donation        from './components/Donation/Donation';
import CitaCTA         from './components/CitaCTA/CitaCTA';
import Footer          from './components/Footer/Footer';
import RegistroRefugio from './components/RegistroRefugio/RegistroRefugio';
import DashboardRefugio from './components/DashboardRefugio/Dashboardrefugio';

export default function App() {
  return (
    <Routes>

      {/* ── Página principal ── */}
      <Route
        path="/"
        element={
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
        }
      />

      {/* ── Formulario de registro ── */}
      <Route path="/registrar-refugio" element={<RegistroRefugio />} />
      <Route path="/dashboard" element={<DashboardRefugio />} />

    </Routes>
  );
}