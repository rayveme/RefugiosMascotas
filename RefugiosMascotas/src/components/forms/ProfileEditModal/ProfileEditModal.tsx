import { useEffect, useState, type FormEvent } from 'react';
import Modal from '../../ui/Modal/Modal';
import FormField from '../../ui/FormField/FormField';
import { adoptersApi } from '../../../api/adopters';
import { foundationsApi } from '../../../api/foundations';
import { extractApiError } from '../../../api/client';
import { useAuth } from '../../../hooks/useAuth';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ProfileEditModal({ open, onClose }: Props) {
  const { user, refresh } = useAuth();

  if (!user) return null;

  return user.role === 'adopter' ? (
    <AdopterEditForm open={open} onClose={onClose} refresh={refresh} />
  ) : (
    <FoundationEditForm open={open} onClose={onClose} refresh={refresh} />
  );
}

interface FormProps {
  open: boolean;
  onClose: () => void;
  refresh: () => Promise<void>;
}

function AdopterEditForm({ open, onClose, refresh }: FormProps) {
  const { user } = useAuth();
  const profile = user?.role === 'adopter' ? user.profile : null;

  const [form, setForm] = useState({
    full_name: profile?.fullName ?? '',
    city: profile?.city ?? '',
    phone: profile?.phone ?? '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (open && profile) {
      setForm({
        full_name: profile.fullName,
        city: profile.city ?? '',
        phone: profile.phone ?? '',
      });
      setError(null);
      setOk(false);
    }
  }, [open, profile]);

  if (!profile) return null;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await adoptersApi.updateMe({
        full_name: form.full_name.trim(),
        city: form.city.trim() || undefined,
        phone: form.phone.trim() || undefined,
      });
      await refresh();
      setOk(true);
      window.setTimeout(onClose, 900);
    } catch (err) {
      setError(extractApiError(err, 'No pudimos guardar los cambios.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Mi perfil"
      subtitle={profile.profileComplete
        ? 'Actualiza tus datos cuando lo necesites.'
        : 'Completa ciudad y teléfono — los necesitamos cuando vayas a adoptar.'}
      width="md"
    >
      <form onSubmit={onSubmit} className="form-grid" noValidate>
        {error && <div className="form-error-banner">{error}</div>}
        {ok && <div className="form-success-banner">¡Perfil actualizado!</div>}

        <FormField
          label="Nombre completo"
          name="full_name"
          required
          minLength={2}
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        />

        <div className="form-row">
          <FormField
            label="Ciudad"
            name="city"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
          <FormField
            label="Teléfono"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn--ghost-dark btn--lg" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--amber btn--lg" disabled={submitting}>
            {submitting ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function FoundationEditForm({ open, onClose, refresh }: FormProps) {
  const { user } = useAuth();
  const profile = user?.role === 'foundation' ? user.profile : null;

  const [form, setForm] = useState({
    name: profile?.name ?? '',
    city: profile?.city ?? '',
    description: profile?.description ?? '',
    phone: profile?.phone ?? '',
    years: String(profile?.years ?? 0),
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (open && profile) {
      setForm({
        name: profile.name,
        city: profile.city,
        description: profile.description ?? '',
        phone: profile.phone ?? '',
        years: String(profile.years ?? 0),
      });
      setError(null);
      setOk(false);
    }
  }, [open, profile]);

  if (!profile) return null;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await foundationsApi.updateMe({
        name: form.name.trim(),
        city: form.city.trim(),
        description: form.description.trim() || undefined,
        phone: form.phone.trim() || undefined,
        years: Number.parseInt(form.years, 10) || 0,
      });
      await refresh();
      setOk(true);
      window.setTimeout(onClose, 900);
    } catch (err) {
      setError(extractApiError(err, 'No pudimos guardar los cambios.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Datos del refugio"
      subtitle={profile.profileComplete
        ? 'Mantén tus datos al día para que las personas puedan contactarte.'
        : 'Completa teléfono y descripción para empezar a recibir adopciones.'}
      width="md"
    >
      <form onSubmit={onSubmit} className="form-grid" noValidate>
        {error && <div className="form-error-banner">{error}</div>}
        {ok && <div className="form-success-banner">¡Refugio actualizado!</div>}

        <FormField
          label="Nombre del refugio"
          name="name"
          required
          minLength={2}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <div className="form-row">
          <FormField
            label="Ciudad"
            name="city"
            required
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
          <FormField
            label="Años activos"
            name="years"
            type="number"
            min={0}
            max={200}
            value={form.years}
            onChange={(e) => setForm({ ...form, years: e.target.value })}
          />
        </div>

        <FormField
          label="Teléfono"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <FormField
          variant="textarea"
          label="Descripción"
          name="description"
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <div className="form-actions">
          <button type="button" className="btn btn--ghost-dark btn--lg" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--amber btn--lg" disabled={submitting}>
            {submitting ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
