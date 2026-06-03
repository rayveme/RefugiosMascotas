import { useEffect, useState } from 'react';
import Modal from '../ui/Modal/Modal';
import FormField from '../ui/FormField/FormField';
import { adminApi } from '../../api/admin';
import { extractApiError } from '../../api/client';
import type { AuthAdopter } from '../../types';

interface Props {
  adopter: AuthAdopter | null;
  onClose: () => void;
  onSaved: (updated: AuthAdopter) => void;
}

export default function EditAdopterModal({ adopter, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    full_name: '',
    email:     '',
    city:      '',
    phone:     '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!adopter) return;
    setForm({
      full_name: adopter.fullName,
      email:     adopter.email,
      city:      adopter.city ?? '',
      phone:     adopter.phone ?? '',
    });
    setErrors({});
    setApiError(null);
  }, [adopter]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.full_name.trim().length < 2) e.full_name = 'Mínimo 2 caracteres';
    if (!form.email.includes('@'))        e.email     = 'Email inválido';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!adopter || !validate()) return;
    setSaving(true);
    setApiError(null);
    try {
      const updated = await adminApi.updateAdopter(adopter.id, {
        full_name: form.full_name.trim(),
        email:     form.email.trim(),
        city:      form.city.trim() || null,
        phone:     form.phone.trim() || null,
      });
      onSaved(updated);
      onClose();
    } catch (err) {
      setApiError(extractApiError(err, 'No se pudo guardar'));
    } finally {
      setSaving(false);
    }
  };

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <Modal
      open={!!adopter}
      onClose={onClose}
      title="Editar adoptante"
      subtitle={adopter?.fullName}
      width="sm"
    >
      {apiError && <div className="form-error-banner">{apiError}</div>}

      <div className="form-grid">
        <FormField
          label="Nombre completo"
          name="full_name"
          required
          value={form.full_name}
          error={errors.full_name}
          onChange={set('full_name')}
        />
        <FormField
          label="Correo electrónico"
          name="email"
          type="email"
          required
          value={form.email}
          error={errors.email}
          onChange={set('email')}
        />
        <div className="form-row">
          <FormField
            label="Ciudad"
            name="city"
            value={form.city}
            onChange={set('city')}
          />
          <FormField
            label="Teléfono"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={set('phone')}
          />
        </div>
      </div>

      <div className="admin-modal-footer">
        <button
          type="button"
          className="btn-nav-back"
          onClick={onClose}
          disabled={saving}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="btn btn--amber"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </Modal>
  );
}
