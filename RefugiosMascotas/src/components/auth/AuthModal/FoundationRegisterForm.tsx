import { useState } from 'react';
import FormField from '../../ui/FormField/FormField';
import { extractApiError } from '../../../api/client';
import { useAuth } from '../../../hooks/useAuth';
import { FileZone, StepsBar } from './FormStepHelpers';

interface Props { onSuccess: () => void; }

type Step = 1 | 2 | 3;
const STEPS = ['Datos', 'Detalles', 'Documentos'];

const SERVICES = [
  'Esterilización', 'Vacunación', 'Microchip',
  'Adopción', 'Foster', 'Rescate', 'Adiestramiento',
];

export default function FoundationRegisterForm({ onSuccess }: Props) {
  const { registerFoundation } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  /* ── Paso 1: datos básicos ────────────────────────────────────────────────── */
  const [basics, setBasics] = useState({ name: '', email: '', password: '' });
  const [basErr, setBasErr] = useState<Partial<Record<keyof typeof basics, string>>>({});

  /* ── Paso 2: detalles del refugio ─────────────────────────────────────────── */
  const [details, setDetails] = useState({
    city:        '',
    phone:       '',
    years:       '0',
    org_type:    '',
    capacity:    '',
    website:     '',
    description: '',
    services:    [] as string[],
  });
  const [detErr, setDetErr] = useState<Record<string, string>>({});

  /* ── Paso 3: documentos ───────────────────────────────────────────────────── */
  const [docs, setDocs] = useState({
    facility_photos: [] as File[],
    legal_doc:       [] as File[],
  });
  const [docsErr, setDocsErr] = useState<Record<string, string>>({});

  const toggleService = (s: string) =>
    setDetails((d) => ({
      ...d,
      services: d.services.includes(s)
        ? d.services.filter((x) => x !== s)
        : [...d.services, s],
    }));

  /* ── Validaciones ─────────────────────────────────────────────────────────── */
  const v1 = () => {
    const e: typeof basErr = {};
    if (basics.name.trim().length < 2) e.name     = 'Mínimo 2 caracteres';
    if (!basics.email.includes('@'))   e.email    = 'Email inválido';
    if (basics.password.length < 8)    e.password = 'Mínimo 8 caracteres';
    setBasErr(e);
    return !Object.keys(e).length;
  };

  const v2 = () => {
    const e: Record<string, string> = {};
    if (!details.city.trim())        e.city        = 'La ciudad es requerida';
    if (!details.phone.trim())       e.phone       = 'El teléfono es requerido';
    if (!details.org_type)           e.org_type    = 'Selecciona el tipo de organización';
    if (!details.description.trim()) e.description = 'Agrega una descripción';
    setDetErr(e);
    return !Object.keys(e).length;
  };

  const v3 = () => {
    const e: Record<string, string> = {};
    if (!docs.facility_photos.length)
      e.facility_photos = 'Sube al menos una foto de tus instalaciones';
    setDocsErr(e);
    return !Object.keys(e).length;
  };

  const next = () => {
    if (step === 1 && !v1()) return;
    if (step === 2 && !v2()) return;
    setStep((s) => (s + 1) as Step);
  };

  const submit = async () => {
    if (!v3()) return;
    setApiError(null);
    setSubmitting(true);
    try {
      await registerFoundation({
        email:       basics.email.trim(),
        password:    basics.password,
        name:        basics.name.trim(),
        city:        details.city.trim(),
        phone:       details.phone.trim() || undefined,
        description: details.description.trim() || undefined,
        years:       Number.parseInt(details.years, 10) || 0,
      });
      onSuccess();
    } catch (err) {
      setApiError(extractApiError(err, 'No pudimos registrar tu refugio'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-multistep">
      <StepsBar current={step} labels={STEPS} onGoTo={(n) => setStep(n as Step)} />
      {apiError && <div className="form-error-banner">{apiError}</div>}

      {/* ── Paso 1: Datos del refugio ──────────────────────────────────────── */}
      {step === 1 && (
        <div className="form-grid">
          <FormField
            label="Nombre del refugio"
            name="name"
            autoComplete="organization"
            required
            value={basics.name}
            error={basErr.name}
            onChange={(e) => setBasics((b) => ({ ...b, name: e.target.value }))}
          />
          <div className="form-row">
            <FormField
              label="Correo electrónico"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={basics.email}
              error={basErr.email}
              onChange={(e) => setBasics((b) => ({ ...b, email: e.target.value }))}
            />
            <FormField
              label="Contraseña"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              hint="Mínimo 8 caracteres"
              value={basics.password}
              error={basErr.password}
              onChange={(e) => setBasics((b) => ({ ...b, password: e.target.value }))}
            />
          </div>

          <div className="form-info-box">
            ⏳ Tu cuenta entrará en revisión. Un administrador la aprobará antes de que puedas publicar mascotas.
          </div>
        </div>
      )}

      {/* ── Paso 2: Detalles ───────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="form-grid">
          <div className="form-row">
            <FormField
              label="Ciudad"
              name="city"
              required
              value={details.city}
              error={detErr.city}
              onChange={(e) => setDetails((d) => ({ ...d, city: e.target.value }))}
            />
            <FormField
              label="Teléfono de contacto"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              value={details.phone}
              error={detErr.phone}
              onChange={(e) => setDetails((d) => ({ ...d, phone: e.target.value }))}
            />
          </div>

          <FormField
            variant="select"
            label="Tipo de organización"
            name="org_type"
            required
            value={details.org_type}
            error={detErr.org_type}
            onChange={(e) => setDetails((d) => ({ ...d, org_type: e.target.value }))}
          >
            <option value="">Seleccionar…</option>
            <option value="publica">Pública / Municipal</option>
            <option value="privada">Privada</option>
            <option value="ong">ONG / Asociación Civil</option>
            <option value="informal">Grupo informal</option>
          </FormField>

          <div className="form-row">
            <FormField
              label="Años activos"
              name="years"
              type="number"
              min={0}
              max={200}
              value={details.years}
              onChange={(e) => setDetails((d) => ({ ...d, years: e.target.value }))}
            />
            <FormField
              label="Capacidad aprox."
              name="capacity"
              type="number"
              min={0}
              hint="Número de animales"
              value={details.capacity}
              onChange={(e) => setDetails((d) => ({ ...d, capacity: e.target.value }))}
            />
          </div>

          <FormField
            label="Sitio web"
            name="website"
            type="url"
            hint="Opcional — https://..."
            value={details.website}
            onChange={(e) => setDetails((d) => ({ ...d, website: e.target.value }))}
          />

          <FormField
            variant="textarea"
            label="Descripción del refugio"
            name="description"
            rows={3}
            required
            hint="Misión, historia y cómo ayudan a los animales"
            value={details.description}
            error={detErr.description}
            onChange={(e) => setDetails((d) => ({ ...d, description: e.target.value }))}
          />

          <div className="form-field-block">
            <span className="field__label">Servicios que ofrecen</span>
            <div className="service-pills">
              {SERVICES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`service-pill${details.services.includes(s) ? ' service-pill--on' : ''}`}
                  onClick={() => toggleService(s)}
                  aria-pressed={details.services.includes(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Paso 3: Documentos ─────────────────────────────────────────────── */}
      {step === 3 && (
        <div className="form-grid">
          <FileZone
            label="Fotos de las instalaciones"
            hint="Muestra el espacio donde viven los animales — hasta 6 fotos"
            accept="image/*"
            multiple
            maxFiles={6}
            required
            files={docs.facility_photos}
            onChange={(f) => setDocs((d) => ({ ...d, facility_photos: f }))}
            error={docsErr.facility_photos}
          />

          <FileZone
            label="Documentos legales"
            hint="Acta constitutiva, RFC o registro oficial — opcional pero recomendado"
            accept="image/*,.pdf"
            files={docs.legal_doc}
            onChange={(f) => setDocs((d) => ({ ...d, legal_doc: f }))}
          />

          <div className="form-info-box">
            📋 Los documentos ayudan al administrador a validar tu refugio más rápido y aumentan la confianza de los adoptantes.
          </div>
        </div>
      )}

      {/* ── Navegación ───────────────────────────────────────────────────────── */}
      <div className="form-nav">
        {step > 1 && (
          <button
            type="button"
            className="btn-nav-back"
            onClick={() => setStep((s) => (s - 1) as Step)}
          >
            ← Atrás
          </button>
        )}
        <button
          type="button"
          className="btn btn--amber btn--lg"
          style={{ marginLeft: step === 1 ? 'auto' : undefined }}
          disabled={submitting}
          onClick={step === 3 ? submit : next}
        >
          {step === 3
            ? (submitting ? 'Registrando…' : 'Registrar refugio 🐾')
            : 'Continuar →'}
        </button>
      </div>
    </div>
  );
}
