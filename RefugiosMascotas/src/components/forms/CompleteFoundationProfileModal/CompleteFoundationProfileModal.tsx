import { useState } from 'react';
import Modal from '../../ui/Modal/Modal';
import FormField from '../../ui/FormField/FormField';
import { foundationsApi } from '../../../api/foundations';
import { extractApiError } from '../../../api/client';
import { useAuth } from '../../../hooks/useAuth';
import { StepsBar } from '../../auth/AuthModal/FormStepHelpers';

interface Props {
  open: boolean;
  onClose: () => void;
}

type Step = 1 | 2 | 3 | 4;
const STEPS = ['Básico', 'Ubicación', 'Contacto', 'Legal'];

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

export default function CompleteFoundationProfileModal({ open, onClose }: Props) {
  const { user, refresh } = useAuth();
  const profile = user?.role === 'foundation' ? user.profile : null;

  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  /* ── Paso 1: Básico ──────────────────────────────────────────────────────── */
  const [basic, setBasic] = useState({
    nombre:      profile?.name       ?? '',
    tipo:        '',
    descripcion: profile?.description ?? '',
    anio:        '',
    capacidad:   '',
    animales:    [] as string[],
    servicios:   [] as string[],
  });
  const [basicErr, setBasicErr] = useState<Record<string, string>>({});

  /* ── Paso 2: Ubicación ───────────────────────────────────────────────────── */
  const [loc, setLoc] = useState({
    calle:   profile?.address    ?? '',
    colonia: '',
    ciudad:  profile?.city !== 'Sin ciudad' ? (profile?.city ?? '') : '',
    estado:  profile?.state      ?? '',
    cp:      profile?.postalCode  ?? '',
  });
  const [locErr, setLocErr] = useState<Record<string, string>>({});

  /* ── Paso 3: Contacto y redes ─────────────────────────────────────────────── */
  const [contact, setContact] = useState({
    telefono:  profile?.phone     ?? '',
    whatsapp:  profile?.whatsapp  ?? '',
    sitio:     profile?.website   ?? '',
    instagram: profile?.instagram ?? '',
    facebook:  profile?.facebook  ?? '',
    responsable: profile?.responsible ?? '',
  });
  const [contactErr, setContactErr] = useState<Record<string, string>>({});

  /* ── Paso 4: Legal y referencias ─────────────────────────────────────────── */
  const [legal, setLegal] = useState({
    legalId:       profile?.legalId       ?? '',
    donationClabe: profile?.donationClabe ?? '',
    schedule:      profile?.schedule      ?? '',
    vetName:       profile?.vetName       ?? '',
    vetPhone:      profile?.vetPhone      ?? '',
    ref1Name:  '',
    ref1Phone: '',
    ref2Name:  '',
    ref2Phone: '',
  });

  const toggleArr = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

  /* ── Validaciones ─────────────────────────────────────────────────────────── */
  const v1 = () => {
    const e: Record<string, string> = {};
    if (!basic.nombre.trim())      e.nombre      = 'El nombre es requerido';
    if (!basic.descripcion.trim()) e.descripcion = 'Agrega una descripción';
    setBasicErr(e);
    return !Object.keys(e).length;
  };

  const v2 = () => {
    const e: Record<string, string> = {};
    if (!loc.calle.trim())  e.calle  = 'La dirección es requerida';
    if (!loc.ciudad.trim()) e.ciudad = 'La ciudad es requerida';
    if (!loc.estado)        e.estado = 'Selecciona un estado';
    setLocErr(e);
    return !Object.keys(e).length;
  };

  const v3 = () => {
    const e: Record<string, string> = {};
    if (!contact.telefono.trim())   e.telefono   = 'El teléfono es requerido';
    if (!contact.responsable.trim()) e.responsable = 'El nombre del responsable es requerido';
    setContactErr(e);
    return !Object.keys(e).length;
  };

  const next = () => {
    if (step === 1 && !v1()) return;
    if (step === 2 && !v2()) return;
    if (step === 3 && !v3()) return;
    setStep((s) => (s + 1) as Step);
  };

  const submit = async () => {
    setApiError(null);
    setSubmitting(true);
    try {
      const tipoLabel: Record<string, string> = {
        publica: 'Pública / Municipal', privada: 'Privada',
        ong: 'ONG / Asociación Civil', informal: 'Grupo informal',
      };
      const extraLines: string[] = [];
      if (basic.tipo)           extraLines.push(`Tipo: ${tipoLabel[basic.tipo] ?? basic.tipo}`);
      if (basic.animales.length) extraLines.push(`Animales: ${basic.animales.join(', ')}`);
      if (basic.servicios.length) extraLines.push(`Servicios: ${basic.servicios.join(', ')}`);
      if (basic.capacidad)      extraLines.push(`Capacidad: ${basic.capacidad} animales`);
      const description = [basic.descripcion, ...extraLines].filter(Boolean).join('\n');

      const foundingYear = parseInt(basic.anio, 10);
      const years = basic.anio && !isNaN(foundingYear)
        ? Math.max(0, new Date().getFullYear() - foundingYear)
        : undefined;

      const fullAddress = [loc.calle, loc.colonia].filter(Boolean).join(', ');

      const refsLines: string[] = [];
      if (legal.ref1Name.trim()) refsLines.push(`${legal.ref1Name.trim()} — ${legal.ref1Phone.trim()}`);
      if (legal.ref2Name.trim()) refsLines.push(`${legal.ref2Name.trim()} — ${legal.ref2Phone.trim()}`);

      await foundationsApi.updateMe({
        name:          basic.nombre.trim(),
        city:          loc.ciudad.trim(),
        description:   description || undefined,
        phone:         contact.telefono.trim() || null,
        years: years ?? undefined,
        address:       fullAddress || null,
        state:         loc.estado || null,
        postal_code:   loc.cp || null,
        whatsapp:      contact.whatsapp.trim()   || null,
        website:       contact.sitio.trim()       || null,
        responsible:   contact.responsable.trim() || null,
        instagram:     contact.instagram.trim()   || null,
        facebook:      contact.facebook.trim()    || null,
        schedule:      legal.schedule.trim()      || null,
        references:    refsLines.join('\n')       || null,
        vet_name:      legal.vetName.trim()       || null,
        vet_phone:     legal.vetPhone.trim()      || null,
        legal_id:      legal.legalId.trim()       || null,
        donation_clabe: legal.donationClabe.trim() || null,
      });

      await refresh();
      setDone(true);
      setTimeout(onClose, 1800);
    } catch (err) {
      setApiError(extractApiError(err, 'No pudimos guardar la información. Intenta de nuevo.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!profile) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Completa el perfil de tu refugio"
      subtitle="Necesitamos estos datos para publicar tu refugio y que las familias puedan contactarte."
      width="lg"
    >
      <div className="form-multistep">
        <StepsBar current={step} labels={STEPS} onGoTo={(n) => setStep(n as Step)} />

        {apiError && <div className="form-error-banner">{apiError}</div>}
        {done && (
          <div className="form-success-banner">
            🐾 ¡Perfil del refugio completado! Quedará en revisión por un administrador.
          </div>
        )}

        {!done && (
          <>
            {/* ── Paso 1: Básico ─────────────────────────────────────────────── */}
            {step === 1 && (
              <div className="form-grid">
                <div className="profile-onboarding-banner">
                  <span>ℹ️</span>
                  <span>
                    Tu cuenta de Google ya está vinculada.
                    Completa la información de tu refugio para que el administrador pueda revisarla.
                  </span>
                </div>

                <FormField
                  label="Nombre del refugio"
                  name="nombre"
                  required
                  value={basic.nombre}
                  error={basicErr.nombre}
                  onChange={(e) => setBasic((b) => ({ ...b, nombre: e.target.value }))}
                />

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
                  required
                  rows={3}
                  hint="Misión, historia, cómo ayudan…"
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
                    placeholder="50 animales"
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

            {/* ── Paso 2: Ubicación ──────────────────────────────────────────── */}
            {step === 2 && (
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

            {/* ── Paso 3: Contacto y redes ───────────────────────────────────── */}
            {step === 3 && (
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
                  placeholder="https://mirefugio.org"
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

            {/* ── Paso 4: Legal y referencias ────────────────────────────────── */}
            {step === 4 && (
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
                  placeholder="Ej. Lunes a viernes 10:00-18:00, sábados 10:00-14:00"
                  value={legal.schedule}
                  onChange={(e) => setLegal((l) => ({ ...l, schedule: e.target.value }))}
                />

                <div className="form-row">
                  <FormField
                    label="Nombre del veterinario de cabecera"
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

                <div className="form-section-label">Referencias (personas o instituciones que nos pueden avalar)</div>

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

                <div className="form-info-box">
                  🔒 Esta información es confidencial y solo la revisa el administrador para validar tu solicitud.
                </div>
              </div>
            )}

            {/* ── Navegación ───────────────────────────────────────────────── */}
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
                onClick={step === 4 ? submit : next}
              >
                {step === 4
                  ? (submitting ? 'Guardando…' : 'Completar perfil 🐾')
                  : 'Continuar →'}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
