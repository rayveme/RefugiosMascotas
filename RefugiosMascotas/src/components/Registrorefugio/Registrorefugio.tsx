import { useRef, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { notify } from '../../services/notify.service';
import { useAuth } from '../../hooks/useAuth';
import { extractApiError } from '../../api/client';
import { foundationsApi } from '../../api/foundations';
import type { ShellContext } from '../../types/shell';
import './Registrorefugio.css';

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface FormState {
  // Paso 1 — Básico
  nombre: string;
  tipo: string;
  descripcion: string;
  anio: string;
  capacidad: string;
  animales: string[];
  servicios: string[];
  // Paso 2 — Ubicación
  calle: string;
  colonia: string;
  ciudad: string;
  estado: string;
  cp: string;
  // Paso 3 — Contacto y redes
  responsable: string;
  telefono: string;
  whatsapp: string;
  sitio: string;
  instagram: string;
  facebook: string;
  // Paso 4 — Legal y referencias
  legalId: string;
  schedule: string;
  vetName: string;
  vetPhone: string;
  ref1Name: string;
  ref1Phone: string;
  ref2Name: string;
  ref2Phone: string;
  donationClabe: string;
  // Paso 6 — Cuenta
  emailCuenta: string;
  password: string;
  confirmar: string;
}

interface DocsState {
  idFront:      File | null;
  acta:         File | null;
  proofAddress: File | null;
  refugePhoto1: File | null;
  refugePhoto2: File | null;
  refugePhoto3: File | null;
}

const INITIAL_FORM: FormState = {
  nombre: '', tipo: '', descripcion: '', anio: '', capacidad: '',
  animales: [], servicios: [],
  calle: '', colonia: '', ciudad: '', estado: '', cp: '',
  responsable: '', telefono: '', whatsapp: '', sitio: '', instagram: '', facebook: '',
  legalId: '', schedule: '', vetName: '', vetPhone: '',
  ref1Name: '', ref1Phone: '', ref2Name: '', ref2Phone: '', donationClabe: '',
  emailCuenta: '', password: '', confirmar: '',
};

const INITIAL_DOCS: DocsState = {
  idFront: null, acta: null, proofAddress: null,
  refugePhoto1: null, refugePhoto2: null, refugePhoto3: null,
};

const ANIMALES  = ['Perros', 'Gatos'];
const SERVICIOS = ['Esterilización', 'Vacunación', 'Microchip', 'Adopción', 'Foster', 'Rescate'];
const ESTADOS   = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
  'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima',
  'Durango', 'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo',
  'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca',
  'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa',
  'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas',
];

const STEPS = [
  { id: 1, label: 'Básico'    },
  { id: 2, label: 'Ubicación' },
  { id: 3, label: 'Contacto'  },
  { id: 4, label: 'Legal'     },
  { id: 5, label: 'Docs'      },
  { id: 6, label: 'Cuenta'    },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pwStrength(pw: string): 0 | 1 | 2 | 3 | 4 {
  if (!pw)            return 0;
  if (pw.length < 4)  return 1;
  if (pw.length < 7)  return 2;
  if (pw.length < 10) return 3;
  return 4;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Field({
  label, error, required, children,
}: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="rr-field">
      <label className="rr-field__label">
        {label}{required && <span className="rr-field__required"> *</span>}
      </label>
      {children}
      {error && <span className="rr-field__error">{error}</span>}
    </div>
  );
}

function CheckPill({
  label, checked, onToggle,
}: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className={`rr-pill ${checked ? 'rr-pill--on' : ''}`}
      onClick={onToggle}
    >
      {label}
    </button>
  );
}

function DocZone({
  label, hint, accept, file, onChange,
}: {
  label: string; hint?: string; accept?: string;
  file: File | null; onChange: (f: File | null) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div
      className={`rr-doc-zone ${file ? 'rr-doc-zone--filled' : ''}`}
      onClick={() => ref.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && ref.current?.click()}
    >
      <input
        ref={ref}
        type="file"
        accept={accept ?? 'image/jpeg,image/png,image/webp,application/pdf'}
        style={{ display: 'none' }}
        onChange={e => onChange(e.target.files?.[0] ?? null)}
      />
      <span className="rr-doc-zone__icon">{file ? '✓' : '📎'}</span>
      <span className="rr-doc-zone__body">
        <span className="rr-doc-zone__label">{label}</span>
        <span className="rr-doc-zone__hint">
          {file ? file.name : (hint ?? 'Clic para adjuntar — JPG, PNG o PDF')}
        </span>
      </span>
      {file && (
        <button
          type="button"
          className="rr-doc-zone__remove"
          onClick={e => { e.stopPropagation(); onChange(null); }}
          aria-label="Quitar archivo"
        >✕</button>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function RegistroRefugio() {
  const navigate = useNavigate();
  const ctx = useOutletContext<ShellContext>();
  const { registerFoundation } = useAuth();

  const [step, setStep]             = useState<Step>(1);
  const [form, setForm]             = useState<FormState>(INITIAL_FORM);
  const [docs, setDocs]             = useState<DocsState>(INITIAL_DOCS);
  const [errors, setErrors]         = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitted, setSubmitted]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError]     = useState<string | null>(null);

  const set = (key: keyof FormState, val: string) =>
    setForm(f => ({ ...f, [key]: val }));

  const toggle = (key: 'animales' | 'servicios', val: string) =>
    setForm(f => {
      const arr = f[key] as string[];
      return { ...f, [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] };
    });

  const setDoc = (key: keyof DocsState, val: File | null) =>
    setDocs(d => ({ ...d, [key]: val }));

  // ── Validación por paso ───────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: typeof errors = {};
    const currentYear = new Date().getFullYear();

    if (step === 1) {
      if (!form.nombre.trim())      e.nombre      = 'El nombre es requerido';
      if (!form.tipo)               e.tipo        = 'Selecciona un tipo de organización';
      if (!form.descripcion.trim()) e.descripcion = 'Agrega una descripción';
      if (!form.anio.trim()) {
        e.anio = 'El año de fundación es requerido';
      } else {
        const anioNum = parseInt(form.anio, 10);
        if (isNaN(anioNum) || anioNum < 1950 || anioNum > currentYear) {
          e.anio = `Debe ser entre 1950 y ${currentYear}`;
        }
      }
      if (!form.capacidad.trim()) e.capacidad = 'La capacidad aproximada es requerida';
    }

    if (step === 2) {
      if (!form.calle.trim())  e.calle  = 'La dirección es requerida';
      if (!form.ciudad.trim()) e.ciudad = 'La ciudad es requerida';
      if (!form.estado)        e.estado = 'Selecciona un estado';
    }

    if (step === 3) {
      if (!form.responsable.trim()) e.responsable = 'El nombre del responsable es requerido';
      if (!form.telefono.trim())    e.telefono    = 'El teléfono es requerido';
    }

    if (step === 6) {
      if (!form.emailCuenta.includes('@')) e.emailCuenta = 'Email inválido';
      if (form.password.length < 8)        e.password    = 'Mínimo 8 caracteres';
      if (form.password !== form.confirmar) e.confirmar  = 'Las contraseñas no coinciden';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep(s => Math.min(s + 1, 6) as Step); };
  const prev = () => setStep(s => Math.max(s - 1, 1) as Step);

  const submit = async () => {
    if (!validate()) return;
    setApiError(null);
    setSubmitting(true);
    try {
      // Descripción enriquecida
      const tipoLabel: Record<string, string> = {
        publica: 'Pública / Municipal', privada: 'Privada',
        ong: 'ONG / Asociación Civil', informal: 'Grupo informal',
      };
      const extraLines: string[] = [];
      if (form.tipo)             extraLines.push(`Tipo: ${tipoLabel[form.tipo] ?? form.tipo}`);
      if (form.animales.length)  extraLines.push(`Animales: ${form.animales.join(', ')}`);
      if (form.servicios.length) extraLines.push(`Servicios: ${form.servicios.join(', ')}`);
      if (form.capacidad)        extraLines.push(`Capacidad: ${form.capacidad} animales`);
      const fullDescription = [form.descripcion, ...extraLines].filter(Boolean).join('\n');

      const foundingYear = parseInt(form.anio, 10);
      const yearsOp = Math.max(0, new Date().getFullYear() - foundingYear);

      const fullAddress = [form.calle, form.colonia].filter(Boolean).join(', ');

      const refsLines: string[] = [];
      if (form.ref1Name.trim()) refsLines.push(`${form.ref1Name.trim()} — ${form.ref1Phone.trim()}`);
      if (form.ref2Name.trim()) refsLines.push(`${form.ref2Name.trim()} — ${form.ref2Phone.trim()}`);
      const referencesText = refsLines.join('\n') || undefined;

      // 1. Crear la cuenta (hace auto-login y guarda el JWT)
      await registerFoundation({
        email:          form.emailCuenta.trim(),
        password:       form.password,
        name:           form.nombre.trim(),
        city:           form.ciudad.trim(),
        phone:          form.telefono.trim()     || undefined,
        description:    fullDescription          || undefined,
        years:          yearsOp,
        address:        fullAddress              || undefined,
        state:          form.estado              || undefined,
        postal_code:    form.cp                  || undefined,
        whatsapp:       form.whatsapp.trim()     || undefined,
        website:        form.sitio.trim()        || undefined,
        responsible:    form.responsable.trim()  || undefined,
        instagram:      form.instagram.trim()    || undefined,
        facebook:       form.facebook.trim()     || undefined,
        schedule:       form.schedule.trim()     || undefined,
        references:     referencesText,
        vet_name:       form.vetName.trim()      || undefined,
        vet_phone:      form.vetPhone.trim()      || undefined,
        legal_id:       form.legalId.trim()      || undefined,
        donation_clabe: form.donationClabe.trim() || undefined,
      });

      // 2. Subir documentos (ya hay JWT guardado del paso anterior)
      const refugePhotos = [docs.refugePhoto1, docs.refugePhoto2, docs.refugePhoto3]
        .filter((f): f is File => f !== null);

      const hasAnyDoc = docs.idFront || docs.acta || docs.proofAddress || refugePhotos.length > 0;
      if (hasAnyDoc) {
        try {
          await foundationsApi.uploadDocuments({
            idFront:      docs.idFront,
            acta:         docs.acta,
            proofAddress: docs.proofAddress,
            refugePhotos,
          });
        } catch {
          // Los documentos fallaron pero el registro ya fue exitoso
          notify.warning(
            'Cuenta creada',
            'No pudimos subir tus documentos. Podrás adjuntarlos más tarde desde tu perfil.',
          );
        }
      }

      setSubmitted(true);
      notify.success('¡Refugio registrado! Revisaremos tu solicitud en las próximas 24 h.');
    } catch (err) {
      setApiError(extractApiError(err, 'No pudimos registrar el refugio. Intenta de nuevo.'));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Pantalla de éxito ─────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="rr-root">
        <div className="rr-blobs" aria-hidden="true">
          <div className="rr-blob rr-blob--1" />
          <div className="rr-blob rr-blob--2" />
        </div>
        <button className="rr-back-btn" onClick={() => navigate('/')} aria-label="Volver al inicio">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Volver al inicio
        </button>
        <div className="rr-success">
          <div className="rr-success__icon" aria-hidden="true">🐾</div>
          <h2 className="rr-success__title">¡Bienvenido a la red!</h2>
          <p className="rr-success__body">
            <strong>{form.nombre}</strong> ha sido registrado exitosamente.
            Revisaremos tu solicitud en las próximas 24 horas.
          </p>
          <button className="rr-btn-primary" onClick={() => navigate('/')}>
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // ── Pantalla del formulario ───────────────────────────────────────────────
  return (
    <div className="rr-root">
      <div className="rr-blobs" aria-hidden="true">
        <div className="rr-blob rr-blob--1" />
        <div className="rr-blob rr-blob--2" />
      </div>

      <button className="rr-back-btn" onClick={() => navigate('/')} aria-label="Volver al inicio">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Volver al inicio
      </button>

      <div className="rr-inner">
        {/* Header */}
        <header className="rr-header">
          <span className="rr-eyebrow" aria-hidden="true">
            <span className="rr-eyebrow__dot" />
            Red Nacional de Refugios
          </span>
          <h1 className="rr-title">
            Registra tu<br />
            <em>refugio</em>
          </h1>
          <p className="rr-subtitle">
            Únete y conecta con miles de familias adoptantes
          </p>
        </header>

        {/* Steps */}
        <nav className="rr-steps" aria-label="Pasos del formulario">
          {STEPS.map((s, i) => (
            <div key={s.id} className="rr-step-wrap">
              <button
                className={`rr-step ${
                  s.id === step ? 'rr-step--active' :
                  s.id < step   ? 'rr-step--done'   : 'rr-step--future'
                }`}
                onClick={() => s.id < step && setStep(s.id as Step)}
                aria-current={s.id === step ? 'step' : undefined}
              >
                <span className="rr-step__circle">
                  {s.id < step ? '✓' : s.id}
                </span>
                <span className="rr-step__label">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`rr-step__connector ${s.id < step ? 'rr-step__connector--done' : ''}`} />
              )}
            </div>
          ))}
        </nav>

        {/* Card */}
        <div className="rr-card">

          {/* ── Paso 1: Básico ─────────────────────────────────────────────── */}
          {step === 1 && (
            <>
              <h2 className="rr-card__title">Información básica</h2>

              <Field label="Nombre del refugio" required error={errors.nombre}>
                <input className="rr-input" placeholder="Ej. Refugio Huellitas de Amor"
                  value={form.nombre} onChange={e => set('nombre', e.target.value)} />
              </Field>

              <Field label="Tipo de organización" required error={errors.tipo}>
                <select className="rr-input rr-select"
                  value={form.tipo} onChange={e => set('tipo', e.target.value)}>
                  <option value="">Seleccionar...</option>
                  <option value="publica">Pública / Municipal</option>
                  <option value="privada">Privada</option>
                  <option value="ong">ONG / Asociación Civil</option>
                  <option value="informal">Grupo informal / Colectivo</option>
                </select>
              </Field>

              <Field label="Descripción del refugio" required error={errors.descripcion}>
                <textarea className="rr-input rr-textarea"
                  placeholder="Cuéntanos sobre tu refugio, su misión y cómo ayudan…"
                  value={form.descripcion} onChange={e => set('descripcion', e.target.value)} />
              </Field>

              <div className="rr-row2">
                <Field label="Año de fundación" required error={errors.anio}>
                  <input className="rr-input" type="number" placeholder="2018"
                    min={1950} max={new Date().getFullYear()}
                    value={form.anio} onChange={e => set('anio', e.target.value)} />
                </Field>
                <Field label="Capacidad aprox. de animales" required error={errors.capacidad}>
                  <input className="rr-input" type="number" placeholder="50"
                    min={1}
                    value={form.capacidad} onChange={e => set('capacidad', e.target.value)} />
                </Field>
              </div>

              <Field label="Animales que atienden">
                <div className="rr-pills">
                  {ANIMALES.map(a => (
                    <CheckPill key={a} label={a}
                      checked={form.animales.includes(a)}
                      onToggle={() => toggle('animales', a)} />
                  ))}
                </div>
              </Field>

              <Field label="Servicios que ofrecen">
                <div className="rr-pills">
                  {SERVICIOS.map(s => (
                    <CheckPill key={s} label={s}
                      checked={form.servicios.includes(s)}
                      onToggle={() => toggle('servicios', s)} />
                  ))}
                </div>
              </Field>
            </>
          )}

          {/* ── Paso 2: Ubicación ──────────────────────────────────────────── */}
          {step === 2 && (
            <>
              <h2 className="rr-card__title">Ubicación</h2>

              <Field label="Calle y número" required error={errors.calle}>
                <input className="rr-input" placeholder="Av. Insurgentes Sur 1234"
                  value={form.calle} onChange={e => set('calle', e.target.value)} />
              </Field>

              <Field label="Colonia / Barrio">
                <input className="rr-input" placeholder="Col. Del Valle"
                  value={form.colonia} onChange={e => set('colonia', e.target.value)} />
              </Field>

              <div className="rr-row2">
                <Field label="Ciudad" required error={errors.ciudad}>
                  <input className="rr-input" placeholder="Ciudad de México"
                    value={form.ciudad} onChange={e => set('ciudad', e.target.value)} />
                </Field>
                <Field label="Código postal">
                  <input className="rr-input" placeholder="03100" maxLength={5}
                    value={form.cp} onChange={e => set('cp', e.target.value)} />
                </Field>
              </div>

              <Field label="Estado" required error={errors.estado}>
                <select className="rr-input rr-select"
                  value={form.estado} onChange={e => set('estado', e.target.value)}>
                  <option value="">Seleccionar estado...</option>
                  {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </>
          )}

          {/* ── Paso 3: Contacto y redes ───────────────────────────────────── */}
          {step === 3 && (
            <>
              <h2 className="rr-card__title">Contacto y redes sociales</h2>

              <Field label="Nombre del responsable principal" required error={errors.responsable}>
                <input className="rr-input" placeholder="María García López"
                  value={form.responsable} onChange={e => set('responsable', e.target.value)} />
              </Field>

              <div className="rr-row2">
                <Field label="Teléfono" required error={errors.telefono}>
                  <input className="rr-input" type="tel" placeholder="+52 55 1234 5678"
                    value={form.telefono} onChange={e => set('telefono', e.target.value)} />
                </Field>
                <Field label="WhatsApp">
                  <input className="rr-input" type="tel" placeholder="+52 55 1234 5678"
                    value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} />
                </Field>
              </div>

              <Field label="Sitio web">
                <input className="rr-input" type="url" placeholder="https://mirefugio.org"
                  value={form.sitio} onChange={e => set('sitio', e.target.value)} />
              </Field>

              <div className="rr-row2">
                <Field label="Instagram">
                  <input className="rr-input" placeholder="@mirefugio o URL completa"
                    value={form.instagram} onChange={e => set('instagram', e.target.value)} />
                </Field>
                <Field label="Facebook">
                  <input className="rr-input" placeholder="facebook.com/mirefugio"
                    value={form.facebook} onChange={e => set('facebook', e.target.value)} />
                </Field>
              </div>

              <div className="rr-info-box">
                📋 Esta información será visible para familias interesadas en adoptar.
                Podrás modificarla desde tu panel en cualquier momento.
              </div>
            </>
          )}

          {/* ── Paso 4: Legal, operación y referencias ─────────────────────── */}
          {step === 4 && (
            <>
              <h2 className="rr-card__title">Legal, operación y referencias</h2>

              <div className="rr-row2">
                <Field label="RFC o Número de registro legal">
                  <input className="rr-input" placeholder="XAXX010101000 / Registro AC"
                    value={form.legalId} onChange={e => set('legalId', e.target.value)} />
                </Field>
                <Field label="CLABE para donaciones">
                  <input className="rr-input" placeholder="18 dígitos" maxLength={18}
                    value={form.donationClabe} onChange={e => set('donationClabe', e.target.value)} />
                </Field>
              </div>

              <Field label="Horario de atención / visitas">
                <input className="rr-input"
                  placeholder="Ej. Lun–Vie 10:00-18:00, Sáb 10:00-14:00"
                  value={form.schedule} onChange={e => set('schedule', e.target.value)} />
              </Field>

              <div className="rr-row2">
                <Field label="Veterinario de cabecera">
                  <input className="rr-input" placeholder="Dr. Juan Pérez"
                    value={form.vetName} onChange={e => set('vetName', e.target.value)} />
                </Field>
                <Field label="Teléfono del veterinario">
                  <input className="rr-input" type="tel" placeholder="+52 55 9876 5432"
                    value={form.vetPhone} onChange={e => set('vetPhone', e.target.value)} />
                </Field>
              </div>

              <div className="rr-section-label">Referencias (personas o instituciones que nos avalan)</div>

              <div className="rr-row2">
                <Field label="Referencia 1 — Nombre">
                  <input className="rr-input" placeholder="Nombre completo"
                    value={form.ref1Name} onChange={e => set('ref1Name', e.target.value)} />
                </Field>
                <Field label="Referencia 1 — Teléfono">
                  <input className="rr-input" type="tel" placeholder="+52 55 0000 0000"
                    value={form.ref1Phone} onChange={e => set('ref1Phone', e.target.value)} />
                </Field>
              </div>

              <div className="rr-row2">
                <Field label="Referencia 2 — Nombre">
                  <input className="rr-input" placeholder="Nombre completo"
                    value={form.ref2Name} onChange={e => set('ref2Name', e.target.value)} />
                </Field>
                <Field label="Referencia 2 — Teléfono">
                  <input className="rr-input" type="tel" placeholder="+52 55 0000 0000"
                    value={form.ref2Phone} onChange={e => set('ref2Phone', e.target.value)} />
                </Field>
              </div>

              <div className="rr-info-box">
                🔒 Esta información es confidencial. Solo la revisa el equipo administrador para validar tu solicitud.
              </div>
            </>
          )}

          {/* ── Paso 5: Documentos ────────────────────────────────────────── */}
          {step === 5 && (
            <>
              <h2 className="rr-card__title">Documentos de verificación</h2>

              <div className="rr-info-box rr-info-box--blue">
                📋 Estos documentos nos ayudan a verificar la legitimidad de tu refugio y agilizan la revisión.
                Puedes adjuntarlos ahora o más tarde desde tu perfil.
              </div>

              <DocZone
                label="Identificación oficial del responsable"
                hint="INE, Pasaporte o Cédula Profesional — frente (JPG, PNG o PDF)"
                file={docs.idFront}
                onChange={f => setDoc('idFront', f)}
              />

              <DocZone
                label="Acta constitutiva / Comprobante de registro"
                hint="Para ONG, AC u organizaciones formales (JPG, PNG o PDF)"
                file={docs.acta}
                onChange={f => setDoc('acta', f)}
              />

              <DocZone
                label="Comprobante de domicilio del refugio"
                hint="Agua, luz o teléfono — no mayor a 3 meses (JPG, PNG o PDF)"
                file={docs.proofAddress}
                onChange={f => setDoc('proofAddress', f)}
              />

              <div className="rr-section-label">Fotos del refugio (hasta 3)</div>

              <DocZone
                label="Foto del refugio 1"
                hint="JPG, PNG o WebP"
                accept="image/jpeg,image/png,image/webp"
                file={docs.refugePhoto1}
                onChange={f => setDoc('refugePhoto1', f)}
              />
              <DocZone
                label="Foto del refugio 2"
                hint="JPG, PNG o WebP"
                accept="image/jpeg,image/png,image/webp"
                file={docs.refugePhoto2}
                onChange={f => setDoc('refugePhoto2', f)}
              />
              <DocZone
                label="Foto del refugio 3"
                hint="JPG, PNG o WebP"
                accept="image/jpeg,image/png,image/webp"
                file={docs.refugePhoto3}
                onChange={f => setDoc('refugePhoto3', f)}
              />
            </>
          )}

          {/* ── Paso 6: Cuenta ───────────────────────────────────────────── */}
          {step === 6 && (
            <>
              <h2 className="rr-card__title">Crea tu cuenta</h2>

              <Field label="Correo de acceso" required error={errors.emailCuenta}>
                <input className="rr-input" type="email" placeholder="tu@email.com"
                  value={form.emailCuenta} onChange={e => set('emailCuenta', e.target.value)} />
              </Field>

              <Field label="Contraseña" required error={errors.password}>
                <input className="rr-input" type="password" placeholder="Mínimo 8 caracteres"
                  value={form.password} onChange={e => set('password', e.target.value)} />
              </Field>

              {form.password && (
                <div className="rr-strength">
                  {([1, 2, 3, 4] as const).map(n => (
                    <div key={n}
                      className={`rr-strength__bar rr-strength__bar--${
                        n <= pwStrength(form.password) ? pwStrength(form.password) : 0
                      }`}
                    />
                  ))}
                  <span className="rr-strength__label">
                    {['', 'Muy débil', 'Débil', 'Buena', 'Excelente'][pwStrength(form.password)]}
                  </span>
                </div>
              )}

              <Field label="Confirmar contraseña" required error={errors.confirmar}>
                <input className="rr-input" type="password" placeholder="Repite la contraseña"
                  value={form.confirmar} onChange={e => set('confirmar', e.target.value)} />
              </Field>

              <label className="rr-checkbox">
                <input type="checkbox" />
                <span>
                  Acepto los{' '}
                  <button type="button" className="rr-link"
                    onClick={e => { e.preventDefault(); notify.info('Términos de Servicio disponibles próximamente.'); }}>
                    Términos de Servicio
                  </button>
                  {' '}y la{' '}
                  <button type="button" className="rr-link"
                    onClick={e => { e.preventDefault(); notify.info('Política de Privacidad disponible próximamente.'); }}>
                    Política de Privacidad
                  </button>
                  {' '}de AdoptaMe
                </span>
              </label>
            </>
          )}

        </div>

        {/* Navegación */}
        {apiError && <div className="rr-api-error" role="alert">{apiError}</div>}

        <div className="rr-nav">
          {step > 1 && (
            <button className="rr-btn-secondary" onClick={prev} disabled={submitting}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Atrás
            </button>
          )}
          <button
            className="rr-btn-primary"
            onClick={step === 6 ? submit : next}
            disabled={submitting}
          >
            {step === 6
              ? (submitting ? 'Registrando…' : 'Registrar refugio 🐾')
              : 'Continuar'}
            {step < 6 && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>

        <p className="rr-login-hint">
          ¿Ya tienes cuenta?{' '}
          <button type="button" className="rr-link"
            onClick={() => { navigate('/'); ctx.openLogin(); }}>
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  );
}
