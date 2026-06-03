import { useState, type FormEvent } from 'react';
import Modal from '../ui/Modal/Modal';
import FormField from '../ui/FormField/FormField';
import { refugios } from '../../data/refugios';
import './CitaFormModal.css';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

const initialState = {
  nombre: '',
  email: '',
  telefono: '',
  refugioId: '',
  fecha: '',
  horaInicio: '',
  horaFin: '',
  motivo: '',
};

type Errors = Partial<Record<keyof typeof initialState, string>>;

function validate(form: typeof initialState): Errors {
  const e: Errors = {};
  if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio.';
  if (!form.email.trim()) e.email = 'El correo es obligatorio.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Ingresa un correo válido.';
  if (!form.refugioId) e.refugioId = 'Selecciona un refugio.';
  if (!form.fecha) e.fecha = 'Elige una fecha.';
  else {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (new Date(form.fecha + 'T00:00:00') < hoy) e.fecha = 'La fecha no puede ser en el pasado.';
  }
  if (!form.horaInicio) e.horaInicio = 'Indica la hora de llegada.';
  if (!form.horaFin) e.horaFin = 'Indica la hora de salida.';
  else if (form.horaInicio && form.horaFin <= form.horaInicio)
    e.horaFin = 'La hora de salida debe ser posterior a la de llegada.';
  return e;
}

export default function CitaFormModal({ open, onClose, onSubmitted }: Props) {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const set = (field: keyof typeof initialState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const reset = () => {
    setForm(initialState);
    setErrors({});
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 200);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    handleClose();
    onSubmitted();
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Agendar visita al refugio"
      subtitle="Completa el formulario y el refugio se pondrá en contacto contigo para confirmar tu cita."
      width="md"
    >
      <form onSubmit={onSubmit} className="cita-form" noValidate>
        <div className="form-grid">

          <FormField
            label="Nombre completo"
            name="nombre"
            required
            placeholder="Ej. María López"
            value={form.nombre}
            onChange={set('nombre')}
            error={errors.nombre}
          />

          <div className="form-row">
            <FormField
              label="Correo electrónico"
              name="email"
              type="email"
              required
              placeholder="tu@correo.com"
              value={form.email}
              onChange={set('email')}
              error={errors.email}
            />
            <FormField
              label="Teléfono (opcional)"
              name="telefono"
              type="tel"
              placeholder="+52 951 000 0000"
              value={form.telefono}
              onChange={set('telefono')}
            />
          </div>

          <FormField
            variant="select"
            label="Refugio de interés"
            name="refugioId"
            required
            value={form.refugioId}
            onChange={set('refugioId')}
            error={errors.refugioId}
          >
            <option value="" disabled>Selecciona un refugio…</option>
            {refugios.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} — {r.city}
              </option>
            ))}
          </FormField>

          <FormField
            label="Fecha de visita"
            name="fecha"
            type="date"
            required
            min={minDate}
            value={form.fecha}
            onChange={set('fecha')}
            error={errors.fecha}
          />

          <div className="form-row">
            <FormField
              label="Hora de llegada"
              name="horaInicio"
              type="time"
              required
              value={form.horaInicio}
              onChange={set('horaInicio')}
              error={errors.horaInicio}
              hint="Desde qué hora estarás ahí"
            />
            <FormField
              label="Hora de salida"
              name="horaFin"
              type="time"
              required
              value={form.horaFin}
              onChange={set('horaFin')}
              error={errors.horaFin}
              hint="Hasta qué hora planeas quedarte"
            />
          </div>

          <FormField
            variant="textarea"
            label="Motivo de la visita (opcional)"
            name="motivo"
            placeholder="Ej. Estoy interesado/a en adoptar un perro mediano, quiero conocer las instalaciones…"
            value={form.motivo}
            onChange={set('motivo')}
          />
        </div>

        <div className="cita-form__notice">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          El refugio confirmará tu visita por correo en las próximas 24 h.
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn--ghost-dark btn--lg" onClick={handleClose} disabled={submitting}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--amber btn--lg" disabled={submitting}>
            {submitting ? 'Enviando…' : 'Confirmar cita'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
