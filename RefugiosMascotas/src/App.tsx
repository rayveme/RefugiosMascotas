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
  const [citaOpen, setCitaOpen] = useState(false);

  // ── Auto-apertura del perfil tras login con Google ──────────────────────────
  // Detectamos cuando el usuario pasa de "sin sesión" → "adoptante con perfil
  // incompleto" y abrimos el modal una sola vez por sesión.
  const prevUserIdRef = useRef<number | null>(null);
  useEffect(() => {
    const currentId = user?.role === 'adopter' ? user.profile.id : null;
    const wasLoggedOut = prevUserIdRef.current === null;
    prevUserIdRef.current = currentId;

    if (
      wasLoggedOut &&
      currentId !== null &&
      user?.role === 'adopter' &&
      !user.profile.profileComplete
    ) {
      // Solo si aún no lo completó en esta sesión del navegador
      const key = `profile_prompted_${currentId}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        setProfileOpen(true);
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

    setProfileOpen(true);
  }, [user, openLogin]);

  const openCompleteProfile = useCallback(() => {
    if (!user) { openLogin(); return; }
    setProfileOpen(true);
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
            'Necesitamos ciudad y teléfono antes de agendar una visita.',
          );
          setProfileOpen(true);
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
        isOnboarding={
          user?.role === 'adopter' && !user.profile.profileComplete
        }
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}