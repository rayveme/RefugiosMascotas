import { useState, type FormEvent } from 'react';
import FormField from '../../ui/FormField/FormField';
import { extractApiError } from '../../../api/client';
import { useAuth } from '../../../hooks/useAuth';

interface Props {
  onSuccess: () => void;
}

export default function AdopterRegisterForm({ onSuccess }: Props) {
  const { registerAdopter } = useAuth();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    city: '',
    phone: '',
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
      await registerAdopter({
        email: form.email.trim(),
        password: form.password,
        full_name: form.full_name.trim(),
        city: form.city.trim() || undefined,
        phone: form.phone.trim() || undefined,
      });
      onSuccess();
    } catch (err) {
      setError(extractApiError(err, 'No pudimos crear tu cuenta'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="form-grid" noValidate>
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

      <div className="form-row">
        <FormField
          label="Ciudad"
          name="city"
          hint="Opcional. La pediremos al adoptar."
          value={form.city}
          onChange={update('city')}
        />
        <FormField
          label="Teléfono"
          name="phone"
          type="tel"
          autoComplete="tel"
          hint="Opcional. La pediremos al adoptar."
          value={form.phone}
          onChange={update('phone')}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn--amber btn--lg btn--full" disabled={submitting}>
          {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </div>
    </form>
  );
}
