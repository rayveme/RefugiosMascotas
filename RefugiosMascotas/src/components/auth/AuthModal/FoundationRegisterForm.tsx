import { useState, type FormEvent } from 'react';
import FormField from '../../ui/FormField/FormField';
import { extractApiError } from '../../../api/client';
import { useAuth } from '../../../hooks/useAuth';

interface Props {
  onSuccess: () => void;
}

export default function FoundationRegisterForm({ onSuccess }: Props) {
  const { registerFoundation } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    city: '',
    phone: '',
    description: '',
    years: '0',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await registerFoundation({
        email: form.email.trim(),
        password: form.password,
        name: form.name.trim(),
        city: form.city.trim(),
        description: form.description.trim() || undefined,
        phone: form.phone.trim() || undefined,
        years: Number.parseInt(form.years, 10) || 0,
      });
      onSuccess();
    } catch (err) {
      setError(extractApiError(err, 'No pudimos registrar tu refugio'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="form-grid" noValidate>
      {error && <div className="form-error-banner">{error}</div>}

      <FormField
        label="Nombre del refugio"
        name="name"
        autoComplete="organization"
        required
        minLength={2}
        value={form.name}
        onChange={update('name')}
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
          required
          value={form.city}
          onChange={update('city')}
        />
        <FormField
          label="Años activos"
          name="years"
          type="number"
          min={0}
          max={200}
          value={form.years}
          onChange={update('years')}
        />
      </div>

      <FormField
        label="Teléfono"
        name="phone"
        type="tel"
        autoComplete="tel"
        hint="Lo necesitamos para coordinar adopciones"
        value={form.phone}
        onChange={update('phone')}
      />

      <FormField
        variant="textarea"
        label="Descripción"
        name="description"
        rows={3}
        hint="Cuenta brevemente la misión del refugio"
        value={form.description}
        onChange={update('description')}
      />

      <div className="form-actions">
        <button type="submit" className="btn btn--amber btn--lg btn--full" disabled={submitting}>
          {submitting ? 'Registrando…' : 'Registrar refugio'}
        </button>
      </div>
    </form>
  );
}
