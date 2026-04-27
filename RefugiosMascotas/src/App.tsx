import { useCallback, useEffect, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import AuthModal from './components/auth/AuthModal/AuthModal';
import PetForm from './components/forms/PetForm/PetForm';
import ProfileEditModal from './components/forms/ProfileEditModal/ProfileEditModal';
import HomePage from './pages/HomePage';
import FoundationsPage from './pages/FoundationsPage';
import FoundationDetailPage from './pages/FoundationDetailPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import type { ShellContext } from './types/shell';

function AppShell() {
  const { user, oauthError, clearOAuthError } = useAuth();

  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);
  const [petFormOpen, setPetFormOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [petsRefreshKey, setPetsRefreshKey] = useState(0);
  const [foundationsRefreshKey, setFoundationsRefreshKey] = useState(0);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 4500);
  }, []);

  useEffect(() => {
    if (oauthError) {
      showToast(`No pudimos completar el login con Google: ${oauthError}`);
      clearOAuthError();
    }
  }, [oauthError, clearOAuthError, showToast]);

  const openLogin = useCallback(() => setAuthMode('login'), []);
  const openRegister = useCallback(() => setAuthMode('register'), []);

  const openPetForm = useCallback(() => {
    if (!user) { openLogin(); return; }
    if (user.role !== 'foundation') {
      showToast('Solo los refugios pueden publicar mascotas.');
      return;
    }
    setPetFormOpen(true);
  }, [user, openLogin, showToast]);

  const openProfileEdit = useCallback(() => {
    if (!user) { openLogin(); return; }
    setProfileOpen(true);
  }, [user, openLogin]);

  const bumpPets = useCallback(() => setPetsRefreshKey((k) => k + 1), []);
  const bumpFoundations = useCallback(() => setFoundationsRefreshKey((k) => k + 1), []);

  const ctx: ShellContext = {
    petsRefreshKey,
    foundationsRefreshKey,
    bumpPets,
    bumpFoundations,
    openLogin,
    openRegister,
    openPetForm,
    openProfileEdit,
    showToast,
  };

  return (
    <>
      <Navbar
        onLoginClick={openLogin}
        onRegisterClick={openRegister}
        onPublishPetClick={openPetForm}
        onEditProfileClick={openProfileEdit}
      />

      <main>
        <Outlet context={ctx} />
      </main>

      <Footer />

      <AuthModal
        open={authMode !== null}
        initialMode={authMode ?? 'login'}
        onClose={() => setAuthMode(null)}
      />

      <PetForm
        open={petFormOpen}
        onClose={() => setPetFormOpen(false)}
        onCreated={() => {
          bumpPets();
          bumpFoundations();
          showToast('¡Mascota publicada! Ya está visible en el listado.');
        }}
      />

      <ProfileEditModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />

      {toast && (
        <div className="app-toast" role="status" aria-live="polite">{toast}</div>
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/refugios" element={<FoundationsPage />} />
            <Route path="/refugios/:id" element={<FoundationDetailPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
