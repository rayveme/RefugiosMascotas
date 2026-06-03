import { useEffect, useState } from 'react';
import Modal from '../../ui/Modal/Modal';
import LoginForm from './LoginForm';
import AdopterRegisterForm from './AdopterRegisterForm';
import FoundationRegisterForm from './FoundationRegisterForm';
import AdminRegisterForm from './AdminRegisterForm';
import { authApi } from '../../../api/auth';
import './AuthModal.css';

type Mode = 'login' | 'register';
type RegisterRole = 'adopter' | 'foundation' | 'admin' | null;

interface Props {
  open: boolean;
  initialMode?: Mode;
  onClose: () => void;
}

const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const enableAdminRegister =
  import.meta.env.VITE_ENABLE_ADMIN_REGISTER === 'true' || import.meta.env.DEV;

export default function AuthModal({ open, initialMode = 'login', onClose }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [registerRole, setRegisterRole] = useState<RegisterRole>(null);

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setRegisterRole(null);
    }
  }, [open, initialMode]);

  const reset = () => {
    setMode(initialMode);
    setRegisterRole(null);
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 200);
  };

  const titles: Record<Mode, { title: string; subtitle: string }> = {
    login: {
      title: 'Bienvenida/o de vuelta',
      subtitle: 'Entra para continuar adoptando o gestionando tu refugio.',
    },
    register: {
      title: registerRole ? '' : 'Crear una cuenta',
      subtitle: registerRole ? '' : '¿Quieres adoptar o eres parte de un refugio?',
    },
  };

  const titleNode = registerRole === 'adopter'
    ? { title: 'Crear cuenta de adoptante', subtitle: 'Solo necesitas estos datos. Pediremos teléfono y ciudad cuando vayas a adoptar.' }
    : registerRole === 'foundation'
      ? { title: 'Registrar tu refugio', subtitle: 'Tu solicitud entrará en revisión por un administrador. Te avisaremos cuando sea aprobada.' }
      : registerRole === 'admin'
        ? { title: 'Crear cuenta de administrador', subtitle: 'Acceso al panel de gestión de la plataforma.' }
        : titles[mode];

  // Formularios de adoptante y refugio tienen múltiples pasos y necesitan más espacio
  const modalWidth = registerRole === 'adopter' || registerRole === 'foundation' ? 'lg' : 'md';

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={titleNode.title}
      subtitle={titleNode.subtitle}
      width={modalWidth}
    >
      <div className="auth-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={mode === 'login'}
          className={`auth-tabs__btn${mode === 'login' ? ' auth-tabs__btn--active' : ''}`}
          onClick={() => { setMode('login'); setRegisterRole(null); }}
        >
          Iniciar sesión
        </button>
        <button
          role="tab"
          aria-selected={mode === 'register'}
          className={`auth-tabs__btn${mode === 'register' ? ' auth-tabs__btn--active' : ''}`}
          onClick={() => setMode('register')}
        >
          Crear cuenta
        </button>
      </div>

      {mode === 'login' && <LoginForm onSuccess={handleClose} />}

      {mode === 'register' && registerRole === null && (
        <div className="role-cards">
          <button
            type="button"
            className="role-card"
            onClick={() => setRegisterRole('adopter')}
          >
            <span className="role-card__icon" aria-hidden="true">
              <svg width="38" height="38" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="25" r="10" fill="#2D5A3D" />
                <circle cx="13" cy="13" r="4.5" fill="#2D5A3D" />
                <circle cx="27" cy="13" r="4.5" fill="#2D5A3D" />
                <circle cx="8" cy="21" r="3.5" fill="#D4783A" />
                <circle cx="32" cy="21" r="3.5" fill="#D4783A" />
              </svg>
            </span>
            <span className="role-card__title">Quiero adoptar</span>
            <span className="role-card__desc">Encuentra a tu próximo compañero entre cientos de mascotas.</span>
          </button>

          <button
            type="button"
            className="role-card"
            onClick={() => setRegisterRole('foundation')}
          >
            <span className="role-card__icon" aria-hidden="true">
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#2D5A3D" strokeWidth="1.6">
                <path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6" />
              </svg>
            </span>
            <span className="role-card__title">Soy un refugio</span>
            <span className="role-card__desc">Publica mascotas en adopción. Tu cuenta debe ser aprobada por un admin.</span>
          </button>

          {enableAdminRegister && (
            <button
              type="button"
              className="role-card role-card--admin"
              onClick={() => setRegisterRole('admin')}
            >
              <span className="role-card__icon" aria-hidden="true">
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#2D5A3D" strokeWidth="1.6">
                  <path d="M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </span>
              <span className="role-card__title">Soy admin</span>
              <span className="role-card__desc">Acceso al panel de control de la plataforma.</span>
            </button>
          )}
        </div>
      )}

      {mode === 'register' && registerRole === 'adopter' && (
        <>
          <button className="auth-back" onClick={() => setRegisterRole(null)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
            Volver
          </button>
          <AdopterRegisterForm onSuccess={handleClose} />
        </>
      )}

      {mode === 'register' && registerRole === 'foundation' && (
        <>
          <button className="auth-back" onClick={() => setRegisterRole(null)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
            Volver
          </button>
          <FoundationRegisterForm onSuccess={handleClose} />
        </>
      )}

      {mode === 'register' && registerRole === 'admin' && (
        <>
          <button className="auth-back" onClick={() => setRegisterRole(null)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
            Volver
          </button>
          <AdminRegisterForm onSuccess={handleClose} />
        </>
      )}

      <div className="auth-google">
        <div className="auth-google__divider"><span>o continúa con</span></div>
        <div className="auth-google__buttons">
          <a href={authApi.googleLoginUrl('adopter', apiBase)} className="auth-google__btn">
            <GoogleIcon /> Adoptante con Google
          </a>
          <a href={authApi.googleLoginUrl('foundation', apiBase)} className="auth-google__btn">
            <GoogleIcon /> Refugio con Google
          </a>
        </div>
      </div>
    </Modal>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M45 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.7-2 5-4.3 6.5v5.4h7c4.1-3.8 6.5-9.3 6.5-15.9z"/>
      <path fill="#34A853" d="M24 46c5.8 0 10.7-1.9 14.3-5.2l-7-5.4c-1.9 1.3-4.4 2.1-7.3 2.1-5.6 0-10.4-3.8-12.1-8.9H4.7v5.6C8.3 41.1 15.6 46 24 46z"/>
      <path fill="#FBBC05" d="M11.9 28.6c-.4-1.3-.7-2.6-.7-4s.3-2.7.7-4v-5.6H4.7C3.2 18.1 2.4 21 2.4 24s.8 5.9 2.3 9l7.2-4.4z"/>
      <path fill="#EA4335" d="M24 11.1c3.2 0 6 1.1 8.3 3.2l6.2-6.2C34.7 4.4 29.8 2.4 24 2.4 15.6 2.4 8.3 7.3 4.7 14.4l7.2 5.6c1.7-5.1 6.5-8.9 12.1-8.9z"/>
    </svg>
  );
}
