import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authStorage } from '../services/auth.service';
import { useAuth } from '../hooks/useAuth';

/**
 * Aterriza aquí cuando Google hace `redirect_uri` callback. La URL trae el JWT
 * en el hash. Lee, guarda en localStorage, refresca el perfil y manda al home.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { refresh, setOAuthError } = useAuth();
  const consumed = useRef(false);

  useEffect(() => {
    if (consumed.current) return;
    consumed.current = true;

    const result = authStorage.consumeOAuthHash();
    if (result.error) setOAuthError(result.error);

    refresh().finally(() => {
      navigate('/', { replace: true });
    });
  }, [navigate, refresh, setOAuthError]);

  return (
    <div className="auth-callback">
      <div className="auth-callback__spinner" />
      <p>Procesando inicio de sesión…</p>
    </div>
  );
}
