import { useState, type FormEvent } from 'react';
import FormField from '../../ui/FormField/FormField';
import { extractApiError } from '../../../api/client';
import { useAuth } from '../../../hooks/useAuth';
import type { Role } from '../../../types/api';

interface Props {
  onSuccess: () => void;
}

export default function LoginForm({ onSuccess }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('adopter');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ email, password, role });
      onSuccess();
    } catch (err) {
      setError(extractApiError(err, 'No pudimos iniciar sesión'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="form-grid" noValidate>
      {error && <div className="form-error-banner">{error}</div>}

      <div className="role-toggle">
        <button
          type="button"
          className={`role-toggle__btn${role === 'adopter' ? ' role-toggle__btn--active' : ''}`}
          onClick={() => setRole('adopter')}
        >
          Adopto
        </button>
        <button
          type="button"
          className={`role-toggle__btn${role === 'foundation' ? ' role-toggle__btn--active' : ''}`}
          onClick={() => setRole('foundation')}
        >
          Soy refugio
        </button>
      </div>

      <FormField
        label="Correo electrónico"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <FormField
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="form-actions">
        <button type="submit" className="btn btn--amber btn--lg btn--full" disabled={submitting}>
          {submitting ? 'Entrando…' : 'Entrar'}
        </button>
      </div>
    </form>
  );
}
