import { useState, type FormEvent } from 'react';
import FormField from '../../ui/FormField/FormField';
import { extractApiError } from '../../../api/client';
import { useAuth } from '../../../hooks/useAuth';

interface Props {
  onSuccess: () => void;
}

const isDev = import.meta.env.DEV;

export default function AdminRegisterForm({ onSuccess }: Props) {
  const { registerAdmin } = useAuth();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    secret_code: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await registerAdmin({
        email: form.email.trim(),
        password: form.password,
        full_name: form.full_name.trim(),
        secret_code: form.secret_code,
      });
      onSuccess();
    } catch (err) {
      setError(extractApiError(err, 'No pudimos crear la cuenta de admin'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="form-grid" noValidate>
      {isDev && (
        <div className="form-success-banner" style={{ marginBottom: 4 }}>
          Modo desarrollo — el código secreto se ignora si <code>DEBUG=true</code> en el backend.
        </div>
      )}
      {error && <div className="form-error-banner">{error}</div>}

      <FormField
        label="Nombre completo"
        name="full_name"
        autoComplete="name"
        required
        minLength={2}
        value={form.full_name}
        onChange={update('full_name')}
      />

      <div className="form-row">
        <FormField
          label="Correo"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={update('email')}
        />
        <FormField
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          hint="Mínimo 8 caracteres"
          value={form.password}
          onChange={update('password')}
        />
      </div>

      <FormField
        label="Código de administrador"
        name="secret_code"
        type="password"
        autoComplete="off"
        required={!isDev}
        hint="Proporcionado por el administrador del sistema"
        value={form.secret_code}
        onChange={update('secret_code')}
      />

      <div className="form-actions">
        <button type="submit" className="btn btn--amber btn--lg btn--full" disabled={submitting}>
          {submitting ? 'Creando cuenta…' : 'Crear cuenta de admin'}
        </button>
      </div>
    </form>
  );
}
