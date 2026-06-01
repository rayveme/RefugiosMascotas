import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Registrorefugio.css';

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4;

interface FormState {
  // Paso 1
  nombre: string;
  tipo: string;
  descripcion: string;
  anio: string;
  capacidad: string;
  animales: string[];
  servicios: string[];
  // Paso 2
  calle: string;
  colonia: string;
  ciudad: string;
  estado: string;
  cp: string;
  // Paso 3
  email: string;
  telefono: string;
  whatsapp: string;
  sitio: string;
  // Paso 4
  responsable: string;
  emailCuenta: string;
  password: string;
  confirmar: string;
}

const INITIAL_FORM: FormState = {
  nombre: '', tipo: '', descripcion: '', anio: '', capacidad: '',
  animales: [], servicios: [],
  calle: '', colonia: '', ciudad: '', estado: '', cp: '',
  email: '', telefono: '', whatsapp: '', sitio: '',
  responsable: '', emailCuenta: '', password: '', confirmar: '',
};

const ANIMALES  = ['Perros', 'Gatos', 'Conejos', 'Aves', 'Reptiles', 'Otros'];
const SERVICIOS = ['Esterilización', 'Vacunación', 'Microchip', 'Adopción', 'Foster', 'Rescate'];
const ESTADOS   = ['CDMX', 'Jalisco', 'Estado de México', 'Nuevo León', 'Puebla',
                   'Veracruz', 'Yucatán', 'Querétaro', 'Guanajuato', 'Chihuahua'];

const STEPS = [
  { id: 1, label: 'Básico'    },
  { id: 2, label: 'Ubicación' },
  { id: 3, label: 'Contacto'  },
  { id: 4, label: 'Cuenta'    },
] as const;

// ─── Small helpers ────────────────────────────────────────────────────────────
function pwStrength(pw: string): 0 | 1 | 2 | 3 | 4 {
  if (!pw)           return 0;
  if (pw.length < 4) return 1;
  if (pw.length < 7) return 2;
  if (pw.length < 10) return 3;
  return 4;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Field({
  label, error, children,
}: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="rr-field">
      <label className="rr-field__label">{label}</label>
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

// ─── Main component ───────────────────────────────────────────────────────────
export default function RegistroRefugio() {
  const navigate = useNavigate();
  const [step, setStep]           = useState<Step>(1);
  const [form, setForm]           = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors]       = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitted] = useState(false);

  // helpers
  const set = (key: keyof FormState, val: string) =>
    setForm(f => ({ ...f, [key]: val }));

  const toggle = (key: 'animales' | 'servicios', val: string) =>
    setForm(f => {
      const arr = f[key] as string[];
      return {
        ...f,
        [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val],
      };
    });

  // validation
  const validate = (): boolean => {
    const e: typeof errors = {};
    if (step === 1) {
      if (!form.nombre.trim())     e.nombre     = 'El nombre es requerido';
      if (!form.tipo)              e.tipo       = 'Selecciona un tipo';
      if (!form.descripcion.trim()) e.descripcion = 'Agrega una descripción';
    }
    if (step === 2) {
      if (!form.calle.trim())  e.calle  = 'La dirección es requerida';
      if (!form.ciudad.trim()) e.ciudad = 'La ciudad es requerida';
      if (!form.estado)        e.estado = 'Selecciona un estado';
    }
    if (step === 3) {
      if (!form.email.includes('@')) e.email    = 'Email inválido';
      if (!form.telefono.trim())     e.telefono = 'El teléfono es requerido';
    }
    if (step === 4) {
      if (!form.responsable.trim())       e.responsable  = 'El nombre es requerido';
      if (!form.emailCuenta.includes('@')) e.emailCuenta = 'Email inválido';
      if (form.password.length < 8)       e.password    = 'Mínimo 8 caracteres';
      if (form.password !== form.confirmar) e.confirmar  = 'Las contraseñas no coinciden';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next  = () => { if (validate()) setStep(s => Math.min(s + 1, 4) as Step); };
  const prev  = () => setStep(s => Math.max(s - 1, 1) as Step);
const submit = () => {
  if (validate()) {
    navigate('/dashboard');  // o la ruta que hayas definido
  }
};
  // ── Success screen ──────────────────────────────────────────────────────────
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

  // ── Form screen ─────────────────────────────────────────────────────────────
  return (
    <div className="rr-root">
      <div className="rr-blobs" aria-hidden="true">
        <div className="rr-blob rr-blob--1" />
        <div className="rr-blob rr-blob--2" />
      </div>

      {/* Back button */}
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
                  s.id < step  ? 'rr-step--done'   : 'rr-step--future'
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
          {step === 1 && (
            <>
              <h2 className="rr-card__title">Información básica</h2>

              <Field label="Nombre del refugio" error={errors.nombre}>
                <input className="rr-input" placeholder="Ej. Refugio Huellitas de Amor"
                  value={form.nombre} onChange={e => set('nombre', e.target.value)} />
              </Field>

              <Field label="Tipo de organización" error={errors.tipo}>
                <select className="rr-input rr-select"
                  value={form.tipo} onChange={e => set('tipo', e.target.value)}>
                  <option value="">Seleccionar...</option>
                  <option value="publica">Pública / Municipal</option>
                  <option value="privada">Privada</option>
                  <option value="ong">ONG / Asociación Civil</option>
                  <option value="informal">Grupo informal</option>
                </select>
              </Field>

              <Field label="Descripción breve" error={errors.descripcion}>
                <textarea className="rr-input rr-textarea"
                  placeholder="Cuéntanos sobre tu refugio, su misión y cómo ayudan…"
                  value={form.descripcion} onChange={e => set('descripcion', e.target.value)} />
              </Field>

              <div className="rr-row2">
                <Field label="Año de fundación">
                  <input className="rr-input" type="number" placeholder="2018"
                    value={form.anio} onChange={e => set('anio', e.target.value)} />
                </Field>
                <Field label="Capacidad aprox.">
                  <input className="rr-input" type="number" placeholder="50 animales"
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

          {step === 2 && (
            <>
              <h2 className="rr-card__title">Ubicación</h2>

              <Field label="Calle y número" error={errors.calle}>
                <input className="rr-input" placeholder="Av. Insurgentes Sur 1234"
                  value={form.calle} onChange={e => set('calle', e.target.value)} />
              </Field>

              <Field label="Colonia / Barrio">
                <input className="rr-input" placeholder="Col. Del Valle"
                  value={form.colonia} onChange={e => set('colonia', e.target.value)} />
              </Field>

              <div className="rr-row2">
                <Field label="Ciudad" error={errors.ciudad}>
                  <input className="rr-input" placeholder="Ciudad de México"
                    value={form.ciudad} onChange={e => set('ciudad', e.target.value)} />
                </Field>
                <Field label="Código postal">
                  <input className="rr-input" placeholder="03100" maxLength={5}
                    value={form.cp} onChange={e => set('cp', e.target.value)} />
                </Field>
              </div>

              <Field label="Estado" error={errors.estado}>
                <select className="rr-input rr-select"
                  value={form.estado} onChange={e => set('estado', e.target.value)}>
                  <option value="">Seleccionar estado...</option>
                  {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>

              <div className="rr-map-placeholder" aria-hidden="true">
                🗺️ Vista de mapa (integración con Google Maps)
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="rr-card__title">Información de contacto</h2>

              <Field label="Correo electrónico" error={errors.email}>
                <input className="rr-input" type="email" placeholder="contacto@mirefugio.org"
                  value={form.email} onChange={e => set('email', e.target.value)} />
              </Field>

              <div className="rr-row2">
                <Field label="Teléfono" error={errors.telefono}>
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

              <div className="rr-info-box">
                📋 Tu información será visible para familias interesadas en adoptar.
                Puedes modificarla en cualquier momento desde tu panel.
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="rr-card__title">Crea tu cuenta</h2>

              <Field label="Nombre del responsable" error={errors.responsable}>
                <input className="rr-input" placeholder="María García López"
                  value={form.responsable} onChange={e => set('responsable', e.target.value)} />
              </Field>

              <Field label="Correo de acceso" error={errors.emailCuenta}>
                <input className="rr-input" type="email" placeholder="tu@email.com"
                  value={form.emailCuenta} onChange={e => set('emailCuenta', e.target.value)} />
              </Field>

              <Field label="Contraseña" error={errors.password}>
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

              <Field label="Confirmar contraseña" error={errors.confirmar}>
                <input className="rr-input" type="password" placeholder="Repite la contraseña"
                  value={form.confirmar} onChange={e => set('confirmar', e.target.value)} />
              </Field>

              <label className="rr-checkbox">
                <input type="checkbox" />
                <span>
                  Acepto los{' '}
                  <a href="/terminos" className="rr-link">Términos de Servicio</a>
                  {' '}y la{' '}
                  <a href="/privacidad" className="rr-link">Política de Privacidad</a>
                  {' '}de AdoptaMe
                </span>
              </label>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="rr-nav">
          {step > 1 && (
            <button className="rr-btn-secondary" onClick={prev}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Atrás
            </button>
          )}
          <button
            className="rr-btn-primary"
            onClick={step === 4 ? submit : next}
          >
            {step === 4 ? 'Registrar refugio 🐾' : 'Continuar'}
            {step < 4 && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>

        <p className="rr-login-hint">
          ¿Ya tienes cuenta?{' '}
          <a href="/login" className="rr-link">Inicia sesión</a>
        </p>
      </div>
    </div>
  );
}