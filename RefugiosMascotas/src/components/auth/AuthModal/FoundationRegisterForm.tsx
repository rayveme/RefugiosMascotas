import { useState } from 'react';
import FormField from '../../ui/FormField/FormField';
import { extractApiError } from '../../../api/client';
import { useAuth } from '../../../hooks/useAuth';
import { foundationsApi } from '../../../api/foundations';
import { FileZone, StepsBar } from './FormStepHelpers';

interface Props { onSuccess: () => void; }

type Step = 1 | 2 | 3 | 4 | 5;
const STEPS = ['Cuenta', 'Básico', 'Ubicación', 'Contacto', 'Legal'];

const ANIMALES  = ['Perros', 'Gatos'];
const SERVICIOS = [
  'Esterilización', 'Vacunación', 'Microchip',
  'Adopción', 'Foster', 'Rescate', 'Adiestramiento',
];
const ESTADOS = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
  'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima',
  'Durango', 'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo',
  'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca',
  'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa',
  'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas',
];

const toggleArr = (arr: string[], val: string) =>
  arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

export default function FoundationRegisterForm({ onSuccess }: Props) {
  const { registerFoundation } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  /* ── Paso 1: Credenciales ────────────────────────────────────────────────── */
  const [creds, setCreds] = useState({ name: '', email: '', password: '' });
  const [credsErr, setCredsErr] = useState<Partial<Record<keyof typeof creds, string>>>({});

  /* ── Paso 2: Básico ──────────────────────────────────────────────────────── */
  const [basic, setBasic] = useState({
    tipo:        '',
    descripcion: '',
    anio:        '',
    capacidad:   '',
    animales:    [] as string[],
    servicios:   [] as string[],
  });
  const [basicErr, setBasicErr] = useState<Record<string, string>>({});

  /* ── Paso 3: Ubicación ───────────────────────────────────────────────────── */
  const [loc, setLoc] = useState({
    calle:   '',
    colonia: '',
    ciudad:  '',
    estado:  '',
    cp:      '',
  });
  const [locErr, setLocErr] = useState<Record<string, string>>({});

  /* ── Paso 4: Contacto ────────────────────────────────────────────────────── */
  const [contact, setContact] = useState({
    telefono:    '',
    whatsapp:    '',
    sitio:       '',
    instagram:   '',
    facebook:    '',
    responsable: '',
  });
  const [contactErr, setContactErr] = useState<Record<string, string>>({});

  /* ── Paso 5: Legal + Documentos ──────────────────────────────────────────── */
  const [legal, setLegal] = useState({
    legalId:       '',
    donationClabe: '',
    schedule:      '',
    vetName:       '',
    vetPhone:      '',
    ref1Name:      '',
    ref1Phone:     '',
    ref2Name:      '',
    ref2Phone:     '',
  });
  const [docs, setDocs] = useState({
    facility_photos: [] as File[],
    legal_doc:       [] as File[],
  });
  const [docsErr, setDocsErr] = useState<Record<string, string>>({});

  /* ── Validaciones ─────────────────────────────────────────────────────────── */
  const v1 = () => {
    const e: typeof credsErr = {};
    if (creds.name.trim().length < 2) e.name     = 'Mínimo 2 caracteres';
    if (!creds.email.includes('@'))   e.email    = 'Email inválido';
    if (creds.password.length < 8)   e.password = 'Mínimo 8 caracteres';
    setCredsErr(e);
    return !Object.keys(e).length;
  };

  const v2 = () => {
    const e: Record<string, string> = {};
    if (!basic.descripcion.trim()) e.descripcion = 'Agrega una descripción';
    setBasicErr(e);
    return !Object.keys(e).length;
  };

  const v3 = () => {
    const e: Record<string, string> = {};
    if (!loc.calle.trim())  e.calle  = 'La dirección es requerida';
    if (!loc.ciudad.trim()) e.ciudad = 'La ciudad es requerida';
    if (!loc.estado)        e.estado = 'Selecciona un estado';
    setLocErr(e);
    return !Object.keys(e).length;
  };

  const v4 = () => {
    const e: Record<string, string> = {};
    if (!contact.telefono.trim())    e.telefono    = 'El teléfono es requerido';
    if (!contact.responsable.trim()) e.responsable = 'El nombre del responsable es requerido';
    setContactErr(e);
    return !Object.keys(e).length;
  };

  const v5 = () => {
    const e: Record<string, string> = {};
    if (!docs.facility_photos.length) e.facility_photos = 'Sube al menos una foto de tus instalaciones';
    setDocsErr(e);
    return !Object.keys(e).length;
  };

  const next = () => {
    if (step === 1 && !v1()) return;
    if (step === 2 && !v2()) return;
    if (step === 3 && !v3()) return;
    if (step === 4 && !v4()) return;
    setStep((s) => (s + 1) as Step);
  };

  const submit = async () => {
    if (!v5()) return;
    setApiError(null);
    setSubmitting(true);
    try {
      const tipoLabel: Record<string, string> = {
        publica: 'Pública / Municipal', privada: 'Privada',
        ong: 'ONG / Asociación Civil', informal: 'Grupo informal',
      };
      const extraLines: string[] = [];
      if (basic.tipo)            extraLines.push(`Tipo: ${tipoLabel[basic.tipo] ?? basic.tipo}`);
      if (basic.animales.length) extraLines.push(`Animales: ${basic.animales.join(', ')}`);
      if (basic.servicios.length) extraLines.push(`Servicios: ${basic.servicios.join(', ')}`);
      if (basic.capacidad)       extraLines.push(`Capacidad: ${basic.capacidad} animales`);
      const description = [basic.descripcion, ...extraLines].filter(Boolean).join('\n');

      const foundingYear = parseInt(basic.anio, 10);
      const years = basic.anio && !isNaN(foundingYear)
        ? Math.max(0, new Date().getFullYear() - foundingYear)
        : 0;

      const fullAddress = [loc.calle, loc.colonia].filter(Boolean).join(', ');

      const refsLines: string[] = [];
      if (legal.ref1Name.trim()) refsLines.push(`${legal.ref1Name.trim()} — ${legal.ref1Phone.trim()}`);
      if (legal.ref2Name.trim()) refsLines.push(`${legal.ref2Name.trim()} — ${legal.ref2Phone.trim()}`);

      // 1 — Crear la cuenta con todos los datos
      await registerFoundation({
        email:          creds.email.trim(),
        password:       creds.password,
        name:           creds.name.trim(),
        city:           loc.ciudad.trim(),
        description:    description || undefined,
        phone:          contact.telefono.trim() || undefined,
        years,
        address:        fullAddress || undefined,
        state:          loc.estado || undefined,
        postal_code:    loc.cp || undefined,
        whatsapp:       contact.whatsapp.trim()    || undefined,
        website:        contact.sitio.trim()       || undefined,
        responsible:    contact.responsable.trim() || undefined,
        instagram:      contact.instagram.trim()   || undefined,
        facebook:       contact.facebook.trim()    || undefined,
        schedule:       legal.schedule.trim()      || undefined,
        references:     refsLines.join('\n')       || undefined,
        vet_name:       legal.vetName.trim()       || undefined,
        vet_phone:      legal.vetPhone.trim()      || undefined,
        legal_id:       legal.legalId.trim()       || undefined,
        donation_clabe: legal.donationClabe.trim() || undefined,
      });

      // 2 — Subir documentos (no bloquea el registro si falla)
      try {
        await foundationsApi.uploadDocuments({
          refugePhotos: docs.facility_photos.length > 0 ? docs.facility_photos : undefined,
          acta:         docs.legal_doc[0] ?? null,
        });
      } catch {
        // La cuenta fue creada; los documentos se pueden subir más adelante.
      }

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

      {/* ── Paso 1: Credenciales ───────────────────────────────────────────── */}
      {step === 1 && (
        <div className="form-grid">
          <FormField
            label="Nombre del refugio"
            name="name"
            autoComplete="organization"
            required
            value={creds.name}
            error={credsErr.name}
            onChange={(e) => setCreds((c) => ({ ...c, name: e.target.value }))}
          />
          <div className="form-row">
            <FormField
              label="Correo electrónico"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={creds.email}
              error={credsErr.email}
              onChange={(e) => setCreds((c) => ({ ...c, email: e.target.value }))}
            />
            <FormField
              label="Contraseña"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              hint="Mínimo 8 caracteres"
              value={creds.password}
              error={credsErr.password}
              onChange={(e) => setCreds((c) => ({ ...c, password: e.target.value }))}
            />
          </div>
          <div className="form-info-box">
            ⏳ Tu cuenta entrará en revisión. Un administrador la aprobará antes de que puedas publicar mascotas.
          </div>
        </div>
      )}

      {/* ── Paso 2: Básico ─────────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="form-grid">
          <FormField
            variant="select"
            label="Tipo de organización"
            name="tipo"
            value={basic.tipo}
            onChange={(e) => setBasic((b) => ({ ...b, tipo: e.target.value }))}
          >
            <option value="">Seleccionar…</option>
            <option value="publica">Pública / Municipal</option>
            <option value="privada">Privada</option>
            <option value="ong">ONG / Asociación Civil</option>
            <option value="informal">Grupo informal</option>
          </FormField>

          <FormField
            variant="textarea"
            label="Descripción del refugio"
            name="descripcion"
            rows={3}
            required
            hint="Misión, historia y cómo ayudan a los animales"
            value={basic.descripcion}
            error={basicErr.descripcion}
            onChange={(e) => setBasic((b) => ({ ...b, descripcion: e.target.value }))}
          />

          <div className="form-row">
            <FormField
              label="Año de fundación"
              name="anio"
              type="number"
              placeholder="2018"
              value={basic.anio}
              onChange={(e) => setBasic((b) => ({ ...b, anio: e.target.value }))}
            />
            <FormField
              label="Capacidad aproximada"
              name="capacidad"
              type="number"
              hint="Número de animales"
              value={basic.capacidad}
              onChange={(e) => setBasic((b) => ({ ...b, capacidad: e.target.value }))}
            />
          </div>

          <div className="form-field-block">
            <span className="field__label">Animales que atienden</span>
            <div className="form-pills">
              {ANIMALES.map((a) => (
                <button
                  key={a} type="button"
                  className={`form-pill${basic.animales.includes(a) ? ' form-pill--on' : ''}`}
                  onClick={() => setBasic((b) => ({ ...b, animales: toggleArr(b.animales, a) }))}
                >{a}</button>
              ))}
            </div>
          </div>

          <div className="form-field-block">
            <span className="field__label">Servicios que ofrecen</span>
            <div className="form-pills">
              {SERVICIOS.map((s) => (
                <button
                  key={s} type="button"
                  className={`form-pill${basic.servicios.includes(s) ? ' form-pill--on' : ''}`}
                  onClick={() => setBasic((b) => ({ ...b, servicios: toggleArr(b.servicios, s) }))}
                >{s}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Paso 3: Ubicación ──────────────────────────────────────────────── */}
      {step === 3 && (
        <div className="form-grid">
          <FormField
            label="Calle y número"
            name="calle"
            required
            value={loc.calle}
            error={locErr.calle}
            onChange={(e) => setLoc((l) => ({ ...l, calle: e.target.value }))}
          />
          <FormField
            label="Colonia / Barrio"
            name="colonia"
            value={loc.colonia}
            onChange={(e) => setLoc((l) => ({ ...l, colonia: e.target.value }))}
          />
          <div className="form-row">
            <FormField
              label="Ciudad"
              name="ciudad"
              required
              value={loc.ciudad}
              error={locErr.ciudad}
              onChange={(e) => setLoc((l) => ({ ...l, ciudad: e.target.value }))}
            />
            <FormField
              label="C.P."
              name="cp"
              value={loc.cp}
              onChange={(e) => setLoc((l) => ({ ...l, cp: e.target.value }))}
            />
          </div>
          <FormField
            variant="select"
            label="Estado"
            name="estado"
            required
            value={loc.estado}
            error={locErr.estado}
            onChange={(e) => setLoc((l) => ({ ...l, estado: e.target.value }))}
          >
            <option value="">Seleccionar estado…</option>
            {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
          </FormField>
        </div>
      )}

      {/* ── Paso 4: Contacto ───────────────────────────────────────────────── */}
      {step === 4 && (
        <div className="form-grid">
          <FormField
            label="Nombre del responsable principal"
            name="responsable"
            required
            value={contact.responsable}
            error={contactErr.responsable}
            onChange={(e) => setContact((c) => ({ ...c, responsable: e.target.value }))}
          />
          <div className="form-row">
            <FormField
              label="Teléfono"
              name="telefono"
              type="tel"
              required
              value={contact.telefono}
              error={contactErr.telefono}
              onChange={(e) => setContact((c) => ({ ...c, telefono: e.target.value }))}
            />
            <FormField
              label="WhatsApp"
              name="whatsapp"
              type="tel"
              value={contact.whatsapp}
              onChange={(e) => setContact((c) => ({ ...c, whatsapp: e.target.value }))}
            />
          </div>
          <FormField
            label="Sitio web"
            name="sitio"
            type="url"
            hint="Opcional — https://..."
            value={contact.sitio}
            onChange={(e) => setContact((c) => ({ ...c, sitio: e.target.value }))}
          />
          <div className="form-row">
            <FormField
              label="Instagram"
              name="instagram"
              placeholder="@mirefugio o URL completa"
              value={contact.instagram}
              onChange={(e) => setContact((c) => ({ ...c, instagram: e.target.value }))}
            />
            <FormField
              label="Facebook"
              name="facebook"
              placeholder="facebook.com/mirefugio"
              value={contact.facebook}
              onChange={(e) => setContact((c) => ({ ...c, facebook: e.target.value }))}
            />
          </div>
        </div>
      )}

      {/* ── Paso 5: Legal + Documentos ─────────────────────────────────────── */}
      {step === 5 && (
        <div className="form-grid">
          <div className="form-row">
            <FormField
              label="RFC o Número de registro legal"
              name="legalId"
              placeholder="XAXX010101000 / Registro AC"
              value={legal.legalId}
              onChange={(e) => setLegal((l) => ({ ...l, legalId: e.target.value }))}
            />
            <FormField
              label="CLABE para donaciones"
              name="donationClabe"
              placeholder="18 dígitos"
              value={legal.donationClabe}
              onChange={(e) => setLegal((l) => ({ ...l, donationClabe: e.target.value }))}
            />
          </div>

          <FormField
            label="Horario de atención / visitas"
            name="schedule"
            placeholder="Ej. Lunes a viernes 10:00-18:00"
            value={legal.schedule}
            onChange={(e) => setLegal((l) => ({ ...l, schedule: e.target.value }))}
          />

          <div className="form-row">
            <FormField
              label="Nombre del veterinario"
              name="vetName"
              placeholder="Dr. Juan Pérez"
              value={legal.vetName}
              onChange={(e) => setLegal((l) => ({ ...l, vetName: e.target.value }))}
            />
            <FormField
              label="Teléfono del veterinario"
              name="vetPhone"
              type="tel"
              value={legal.vetPhone}
              onChange={(e) => setLegal((l) => ({ ...l, vetPhone: e.target.value }))}
            />
          </div>

          <div className="form-section-label">Referencias</div>
          <div className="form-row">
            <FormField
              label="Referencia 1 — Nombre"
              name="ref1Name"
              value={legal.ref1Name}
              onChange={(e) => setLegal((l) => ({ ...l, ref1Name: e.target.value }))}
            />
            <FormField
              label="Referencia 1 — Teléfono"
              name="ref1Phone"
              type="tel"
              value={legal.ref1Phone}
              onChange={(e) => setLegal((l) => ({ ...l, ref1Phone: e.target.value }))}
            />
          </div>
          <div className="form-row">
            <FormField
              label="Referencia 2 — Nombre"
              name="ref2Name"
              value={legal.ref2Name}
              onChange={(e) => setLegal((l) => ({ ...l, ref2Name: e.target.value }))}
            />
            <FormField
              label="Referencia 2 — Teléfono"
              name="ref2Phone"
              type="tel"
              value={legal.ref2Phone}
              onChange={(e) => setLegal((l) => ({ ...l, ref2Phone: e.target.value }))}
            />
          </div>

          <div className="form-section-label">Documentos</div>
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
            🔒 Esta información es confidencial y solo la revisa el administrador para validar tu solicitud.
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
          onClick={step === 5 ? submit : next}
        >
          {step === 5
            ? (submitting ? 'Registrando…' : 'Registrar refugio 🐾')
            : 'Continuar →'}
        </button>
      </div>
    </div>
  );
}
