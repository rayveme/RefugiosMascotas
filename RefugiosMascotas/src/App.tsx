import { useCallback, useEffect, useRef, useState } from "react";
import {
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import { Toaster } from "sonner";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import AuthModal from "./components/auth/AuthModal/AuthModal";
import PetForm from "./components/forms/PetForm/PetForm";
import ProfileEditModal from "./components/forms/ProfileEditModal/ProfileEditModal";
import CompleteAdopterProfileModal from "./components/forms/CompleteAdopterProfileModal/CompleteAdopterProfileModal";
import CompleteFoundationProfileModal from "./components/forms/CompleteFoundationProfileModal/CompleteFoundationProfileModal";
import RegistroRefugio from "./components/Registrorefugio/Registrorefugio";
import DashboardRefugio from "./components/DashboardRefugio/Dashboardrefugio";
import CitaFormModal from "./components/CitaCTA/CitaFormModal";

import { useConfirm } from "./components/ui/ConfirmDialog/ConfirmDialog";

import HomePage from "./pages/HomePage";
import FoundationsPage from "./pages/FoundationsPage";
import FoundationDetailPage from "./pages/FoundationDetailPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import RequestsPage from "./pages/RequestsPage";
import AdminPage from "./pages/AdminPage";
import PrivacidadPage from "./pages/PrivacidadPage";
import TerminosPage from "./pages/TerminosPage";
import CookiesPage from "./pages/CookiesPage";
import ContactoPage from "./pages/ContactoPage";

import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import { notify } from "./services/notify.service";

import type { ShellContext } from "./types/shell";
function AppShell() {
  const { user, oauthError, clearOAuthError } = useAuth();
  const { confirm, dialog: confirmDialog } = useConfirm();

  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);
  const [petFormOpen, setPetFormOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [completeProfileOpen, setCompleteProfileOpen] = useState(false);
  const [completeFoundationOpen, setCompleteFoundationOpen] = useState(false);
  const [citaOpen, setCitaOpen] = useState(false);

  // ── Auto-apertura post-login cuando el perfil está incompleto ─────────────
  const prevUserIdRef = useRef<number | null>(null);
  useEffect(() => {
    const currentRole = user?.role ?? null;
    const currentId   = user ? (user.profile as { id: number }).id : null;
    const wasLoggedOut = prevUserIdRef.current === null;
    prevUserIdRef.current = currentId;

    if (!wasLoggedOut || currentId === null) return;

    if (currentRole === 'adopter' && user?.role === 'adopter' && !user.profile.profileComplete) {
      const key = `profile_prompted_${currentId}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        setCompleteProfileOpen(true);
      }
    } else if (currentRole === 'foundation' && user?.role === 'foundation' && !user.profile.profileComplete) {
      const key = `foundation_prompted_${currentId}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        setCompleteFoundationOpen(true);
      }
    }
  }, [user]);
  const [petsRefreshKey, setPetsRefreshKey] = useState(0);
  const [foundationsRefreshKey, setFoundationsRefreshKey] = useState(0);

  const showToast = useCallback<ShellContext["showToast"]>(
    (msg, type = "info") => {
      if (type === "success") notify.success(msg);
      else if (type === "error") notify.error(msg);
      else if (type === "warning") notify.warning(msg);
      else notify.info(msg);
    },
    [],
  );

  useEffect(() => {
    if (oauthError) {
      notify.error("No pudimos completar el login con Google", oauthError);
      clearOAuthError();
    }
  }, [oauthError, clearOAuthError]);

  const openLogin = useCallback(() => setAuthMode("login"), []);
  const openRegister = useCallback(() => setAuthMode("register"), []);

  const openPetForm = useCallback(() => {
    if (!user) {
      openLogin();
      return;
    }

    if (user.role !== "foundation") {
      notify.warning("Solo los refugios pueden publicar mascotas.");
      return;
    }

    setPetFormOpen(true);
  }, [user, openLogin]);

  const openProfileEdit = useCallback(() => {
    if (!user) {
      openLogin();
      return;
    }

    // Si el perfil está incompleto → flujo de completar
    if (user.role === 'foundation' && !user.profile.profileComplete) {
      setCompleteFoundationOpen(true);
      return;
    }
    if (user.role === 'adopter' && !user.profile.profileComplete) {
      setCompleteProfileOpen(true);
      return;
    }

    setProfileOpen(true);
  }, [user, openLogin]);

  const openCompleteProfile = useCallback(() => {
    if (!user) { openLogin(); return; }
    if (user.role === 'foundation') {
      setCompleteFoundationOpen(true);
    } else {
      setCompleteProfileOpen(true);
    }
  }, [user, openLogin]);

  const bumpPets = useCallback(() => setPetsRefreshKey((k) => k + 1), []);
  const bumpFoundations = useCallback(
    () => setFoundationsRefreshKey((k) => k + 1),
    [],
  );

  const ctx: ShellContext = {
    petsRefreshKey,
    foundationsRefreshKey,
    bumpPets,
    bumpFoundations,
    openLogin,
    openRegister,
    openPetForm,
    openProfileEdit,
    openCompleteProfile,
    showToast,
    confirm,
  };

  return (
    <>
      <Navbar
        onLoginClick={openLogin}
        onRegisterClick={openRegister}
        onPublishPetClick={openPetForm}
        onEditProfileClick={openProfileEdit}
        onAgendarCitaClick={() => {
        // Si es adoptante con perfil incompleto, primero completar datos
        if (user?.role === 'adopter' && !user.profile.profileComplete) {
          notify.warning(
            'Completa tu perfil primero',
            'Necesitamos tus datos antes de agendar una visita.',
          );
          setCompleteProfileOpen(true);
          return;
        }
        setCitaOpen(true);
      }}
      />

      <main>
        <Outlet context={ctx} />
      </main>

      <Footer />

      <AuthModal
        open={authMode !== null}
        initialMode={authMode ?? "login"}
        onClose={() => setAuthMode(null)}
      />

      <PetForm
        open={petFormOpen}
        onClose={() => setPetFormOpen(false)}
        onCreated={() => {
          bumpPets();
          bumpFoundations();
          notify.success(
            "¡Mascota publicada!",
            "Ya está visible en el listado.",
          );
        }}
      />

      <ProfileEditModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />

      <CompleteAdopterProfileModal
        open={completeProfileOpen}
        onClose={() => setCompleteProfileOpen(false)}
      />

      <CompleteFoundationProfileModal
        open={completeFoundationOpen}
        onClose={() => setCompleteFoundationOpen(false)}
      />

      <CitaFormModal
        open={citaOpen}
        onClose={() => setCitaOpen(false)}
        onSubmitted={() =>
          notify.success("¡Cita enviada!", "El refugio te confirmará por correo en las próximas 24 h.")
        }
      />

      {confirmDialog}

      <Toaster
        position="top-right"
        richColors
        closeButton
        expand
        duration={4500}
        toastOptions={{
          style: {
            fontFamily: "'DM Sans', sans-serif",
            borderRadius: "14px",
          },
        }}
      />
    </>
  );
}

export default function App() {
  // El <BrowserRouter> está en main.tsx envolviendo a <App />.
  return (
    <AuthProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/refugios" element={<FoundationsPage />} />
          <Route path="/refugios/:id" element={<FoundationDetailPage />} />
          <Route path="/solicitudes" element={<RequestsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/registrar-refugio" element={<RegistroRefugio />} />
          <Route path="/dashboard" element={<DashboardRefugio />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/privacidad" element={<PrivacidadPage />} />
          <Route path="/terminos" element={<TerminosPage />} />
          <Route path="/cookies" element={<CookiesPage />} />
          <Route path="/contacto" element={<ContactoPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}