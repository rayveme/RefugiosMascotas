import { useEffect, useState } from 'react';
import Modal from '../ui/Modal/Modal';
import FormField from '../ui/FormField/FormField';
import { adminApi } from '../../api/admin';
import { extractApiError } from '../../api/client';
import type { AuthFoundation, FoundationStatus } from '../../types';

interface Props {
  foundation: AuthFoundation | null;
  onClose: () => void;
  onSaved: (updated: AuthFoundation) => void;
}

const STATUS_OPTIONS: { value: FoundationStatus; label: string }[] = [
  { value: 'pending',  label: 'Pendiente' },
  { value: 'approved', label: 'Aprobada' },
  { value: 'rejected', label: 'Rechazada' },
];

export default function EditFoundationModal({ foundation, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    name:        '',
    city:        '',
    email:       '',
    phone:       '',
    description: '',
    years:       0,
    status:      'pending' as FoundationStatus,
    // Ubicación adicional
    address:     '',
    state:       '',
    postalCode:  '',
    // Contacto adicional
    whatsapp:    '',
    website:     '',
    responsible: '',
    // Redes sociales
    instagram:   '',
    facebook:    '',
    // Operación
    schedule:    '',
    vetName:     '',
    vetPhone:    '',
    references:  '',
    // Legal
    legalId:       '',
    donationClabe: '',
  });
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [saving, setSaving]   = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!foundation) return;
    setForm({
      name:        foundation.name,
      city:        foundation.city,
      email:       foundation.email,
      phone:       foundation.phone       ?? '',
      description: foundation.description ?? '',
      years:       foundation.years,
      status:      foundation.status,
      address:     foundation.address     ?? '',
      state:       foundation.state       ?? '',
      postalCode:  foundation.postalCode  ?? '',
      whatsapp:    foundation.whatsapp    ?? '',
      website:     foundation.website     ?? '',
      responsible: foundation.responsible ?? '',
      instagram:   foundation.instagram   ?? '',
      facebook:    foundation.facebook    ?? '',
      schedule:    foundation.schedule    ?? '',
      vetName:     foundation.vetName     ?? '',
      vetPhone:    foundation.vetPhone    ?? '',
      references:  foundation.references  ?? '',
      legalId:       foundation.legalId       ?? '',
      donationClabe: foundation.donationClabe ?? '',
    });
    setErrors({});
    setApiError(null);
  }, [foundation]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2)   e.name  = 'Mínimo 2 caracteres';
    if (form.city.trim().length < 2)   e.city  = 'Mínimo 2 caracteres';
    if (!form.email.includes('@'))     e.email = 'Email inválido';
    if (form.years < 0 || form.years > 200) e.years = 'Entre 0 y 200';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!foundation || !validate()) return;
    setSaving(true);
    setApiError(null);
    try {
      const updated = await adminApi.updateFoundation(foundation.id, {
        name:        form.name.trim(),
        city:        form.city.trim(),
        email:       form.email.trim(),
        phone:       form.phone.trim()       || null,
        description: form.description.trim() || null,
        years:       form.years,
        status:      form.status,
        address:     form.address.trim()     || null,
        state:       form.state.trim()       || null,
        postal_code: form.postalCode.trim()  || null,
        whatsapp:    form.whatsapp.trim()    || null,
        website:     form.website.trim()     || null,
        responsible: form.responsible.trim() || null,
        instagram:   form.instagram.trim()   || null,
        facebook:    form.facebook.trim()    || null,
        schedule:    form.schedule.trim()    || null,
        vet_name:    form.vetName.trim()     || null,
        vet_phone:   form.vetPhone.trim()    || null,
        references:  form.references.trim()  || null,
        legal_id:       form.legalId.trim()       || null,
        donation_clabe: form.donationClabe.trim()  || null,
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
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: key === 'years' ? Number(e.target.value) : e.target.value }));

  return (
    <Modal
      open={!!foundation}
      onClose={onClose}
      title="Editar fundación"
      subtitle={foundation?.name}
      width="md"
    >
      {apiError && <div className="form-error-banner">{apiError}</div>}

      <div className="form-grid">
        {/* ── Datos básicos ── */}
        <div className="form-row">
          <FormField
            label="Nombre"
            name="name"
            required
            value={form.name}
            error={errors.name}
            onChange={set('name')}
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
        </div>

        <div className="form-row">
          <FormField
            label="Teléfono"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={set('phone')}
          />
          <FormField
            label="WhatsApp"
            name="whatsapp"
            type="tel"
            value={form.whatsapp}
            onChange={set('whatsapp')}
          />
        </div>

        <div className="form-row">
          <FormField
            label="Años de operación"
            name="years"
            type="number"
            min={0}
            max={200}
            value={form.years}
            error={errors.years}
            onChange={set('years')}
          />
          <FormField
            variant="select"
            label="Estado de la cuenta"
            name="status"
            value={form.status}
            onChange={set('status')}
          >
            {STATUS_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </FormField>
        </div>

        <FormField
          label="Responsable"
          name="responsible"
          value={form.responsible}
          onChange={set('responsible')}
        />

        <FormField
          label="Sitio web"
          name="website"
          type="url"
          placeholder="https://mirefugio.org"
          value={form.website}
          onChange={set('website')}
        />

        {/* ── Ubicación ── */}
        <div className="form-section-label">📍 Ubicación</div>

        <FormField
          label="Dirección (calle y colonia)"
          name="address"
          value={form.address}
          onChange={set('address')}
        />

        <div className="form-row">
          <FormField
            label="Ciudad"
            name="city"
            required
            value={form.city}
            error={errors.city}
            onChange={set('city')}
          />
          <FormField
            label="Estado"
            name="state"
            value={form.state}
            onChange={set('state')}
          />
          <FormField
            label="C.P."
            name="postalCode"
            value={form.postalCode}
            onChange={set('postalCode')}
          />
        </div>

        {/* ── Descripción ── */}
        <FormField
          variant="textarea"
          label="Descripción"
          name="description"
          rows={3}
          value={form.description}
          onChange={set('description')}
        />

        {/* ── Redes sociales ── */}
        <div className="form-section-label">🌐 Redes sociales</div>
        <div className="form-row">
          <FormField
            label="Instagram"
            name="instagram"
            placeholder="@mirefugio o URL"
            value={form.instagram}
            onChange={set('instagram')}
          />
          <FormField
            label="Facebook"
            name="facebook"
            placeholder="facebook.com/mirefugio"
            value={form.facebook}
            onChange={set('facebook')}
          />
        </div>

        {/* ── Operación ── */}
        <div className="form-section-label">⚙️ Operación</div>
        <FormField
          label="Horario de atención"
          name="schedule"
          placeholder="Lun–Vie 10:00-18:00"
          value={form.schedule}
          onChange={set('schedule')}
        />
        <div className="form-row">
          <FormField
            label="Nombre del veterinario"
            name="vetName"
            value={form.vetName}
            onChange={set('vetName')}
          />
          <FormField
            label="Teléfono del veterinario"
            name="vetPhone"
            type="tel"
            value={form.vetPhone}
            onChange={set('vetPhone')}
          />
        </div>
        <FormField
          variant="textarea"
          label="Referencias"
          name="references"
          rows={2}
          hint="Personas o instituciones que avalan al refugio"
          value={form.references}
          onChange={set('references')}
        />

        {/* ── Legal ── */}
        <div className="form-section-label">⚖️ Legal</div>
        <div className="form-row">
          <FormField
            label="RFC / Registro legal"
            name="legalId"
            value={form.legalId}
            onChange={set('legalId')}
          />
          <FormField
            label="CLABE para donaciones"
            name="donationClabe"
            placeholder="18 dígitos"
            value={form.donationClabe}
            onChange={set('donationClabe')}
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
