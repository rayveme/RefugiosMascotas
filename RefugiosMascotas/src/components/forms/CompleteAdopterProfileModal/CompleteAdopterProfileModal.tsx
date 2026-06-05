import { useState } from 'react';
import Modal from '../../ui/Modal/Modal';
import FormField from '../../ui/FormField/FormField';
import { adoptersApi, dataUrlToBlob } from '../../../api/adopters';
import { extractApiError } from '../../../api/client';
import { useAuth } from '../../../hooks/useAuth';
import { FileZone, SigPad, StepsBar, YNToggle } from '../../auth/AuthModal/FormStepHelpers';

interface Props {
  open: boolean;
  onClose: () => void;
}

type Step = 1 | 2 | 3;
const STEPS = ['Perfil', 'Documentos', 'Acta'];

export default function CompleteAdopterProfileModal({ open, onClose }: Props) {
  const { user, refresh } = useAuth();
  const profile = user?.role === 'adopter' ? user.profile : null;

  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  /* ── Paso 1: perfil personal ─────────────────────────────────────────────── */
  const [prof, setProf] = useState({
    city:            profile?.city            ?? '',
    phone:           profile?.phone           ?? '',
    housing_type:    '',
    has_garden:      null as boolean | null,
    has_children:    null as boolean | null,
    has_other_pets:  null as boolean | null,
    other_pets_desc: '',
    adoption_reason: '',
  });
  const [profErr, setProfErr] = useState<Record<string, string>>({});

  /* ── Paso 2: documentos ──────────────────────────────────────────────────── */
  const [docs, setDocs] = useState({
    id_front:      [] as File[],
    id_back:       [] as File[],
    proof_address: [] as File[],
    home_photos:   [] as File[],
  });
  const [docsErr, setDocsErr] = useState<Record<string, string>>({});

  /* ── Paso 3: acta + firma ────────────────────────────────────────────────── */
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [actaErr, setActaErr] = useState<Record<string, string>>({});

  /* ── Validaciones ────────────────────────────────────────────────────────── */
  const v1 = () => {
    const e: Record<string, string> = {};
    if (!prof.city.trim())     e.city         = 'La ciudad es requerida';
    if (!prof.phone.trim())    e.phone        = 'El teléfono es requerido';
    if (!prof.housing_type)    e.housing_type = 'Selecciona el tipo de vivienda';
    setProfErr(e);
    return !Object.keys(e).length;
  };

  const v2 = () => {
    const e: Record<string, string> = {};
    if (!docs.id_front.length)      e.id_front      = 'Sube el frente de tu identificación';
    if (!docs.id_back.length)       e.id_back       = 'Sube el reverso de tu identificación';
    if (!docs.proof_address.length) e.proof_address = 'Sube un comprobante de domicilio';
    if (!docs.home_photos.length)   e.home_photos   = 'Sube al menos una foto de tu hogar';
    setDocsErr(e);
    return !Object.keys(e).length;
  };

  const v3 = () => {
    const e: Record<string, string> = {};
    if (!agreed)    e.agreed    = 'Debes aceptar el acta responsiva';
    if (!signature) e.signature = 'Tu firma es requerida';
    setActaErr(e);
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
      await adoptersApi.updateMe({
        city:  prof.city.trim(),
        phone: prof.phone.trim(),
      });
      await adoptersApi.uploadDocuments({
        id_front:        docs.id_front[0],
        id_back:         docs.id_back[0],
        proof_address:   docs.proof_address[0],
        home_photos:     docs.home_photos,
        signature:       signature ? dataUrlToBlob(signature) : undefined,
        housing_type:    prof.housing_type || undefined,
        has_garden:      prof.has_garden,
        has_children:    prof.has_children,
        has_other_pets:  prof.has_other_pets,
        other_pets_desc: prof.other_pets_desc || undefined,
        adoption_reason: prof.adoption_reason || undefined,
      });
      await refresh();
      setDone(true);
      setTimeout(onClose, 1800);
    } catch (err) {
      setApiError(extractApiError(err, 'No pudimos guardar tu perfil. Intenta de nuevo.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!profile) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Completa tu perfil"
      subtitle="Necesitamos estos datos para poder procesar tu solicitud de adopción."
      width="lg"
    >
      <div className="form-multistep">
        <StepsBar current={step} labels={STEPS} onGoTo={(n) => setStep(n as Step)} />

        {apiError && <div className="form-error-banner">{apiError}</div>}
        {done && (
          <div className="form-success-banner">
            🐾 ¡Perfil completado! Ya puedes solicitar adopciones y agendar visitas.
          </div>
        )}

        {!done && (
          <>
            {/* ── Paso 1: Perfil personal ─────────────────────────────────── */}
            {step === 1 && (
              <div className="form-grid">
                <div className="profile-onboarding-banner">
                  <span>ℹ️</span>
                  <span>
                    Tu nombre y correo ya los tenemos de Google.
                    Solo necesitamos estos datos adicionales para tu expediente de adopción.
                  </span>
                </div>

                <div className="form-row">
                  <FormField
                    label="Ciudad"
                    name="city"
                    required
                    value={prof.city}
                    error={profErr.city}
                    onChange={(e) => setProf((p) => ({ ...p, city: e.target.value }))}
                  />
                  <FormField
                    label="Teléfono"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={prof.phone}
                    error={profErr.phone}
                    onChange={(e) => setProf((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>

                <FormField
                  variant="select"
                  label="Tipo de vivienda"
                  name="housing_type"
                  required
                  value={prof.housing_type}
                  error={profErr.housing_type}
                  onChange={(e) => setProf((p) => ({ ...p, housing_type: e.target.value }))}
                >
                  <option value="">Seleccionar…</option>
                  <option value="casa_propia">Casa propia</option>
                  <option value="casa_renta">Casa en renta</option>
                  <option value="depa_propio">Departamento propio</option>
                  <option value="depa_renta">Departamento en renta</option>
                  <option value="otro">Otro</option>
                </FormField>

                <div className="form-yn-grid">
                  <div className="form-yn-item">
                    <span className="field__label">¿Tiene jardín o patio?</span>
                    <YNToggle
                      value={prof.has_garden}
                      onChange={(v) => setProf((p) => ({ ...p, has_garden: v }))}
                    />
                  </div>
                  <div className="form-yn-item">
                    <span className="field__label">¿Hay niños en casa?</span>
                    <YNToggle
                      value={prof.has_children}
                      onChange={(v) => setProf((p) => ({ ...p, has_children: v }))}
                    />
                  </div>
                  <div className="form-yn-item">
                    <span className="field__label">¿Tienes otras mascotas?</span>
                    <YNToggle
                      value={prof.has_other_pets}
                      onChange={(v) => setProf((p) => ({ ...p, has_other_pets: v }))}
                    />
                  </div>
                </div>

                {prof.has_other_pets === true && (
                  <FormField
                    variant="textarea"
                    label="¿Qué mascotas tienes actualmente?"
                    name="other_pets_desc"
                    rows={2}
                    hint="Especie, raza, edad y temperamento"
                    value={prof.other_pets_desc}
                    onChange={(e) => setProf((p) => ({ ...p, other_pets_desc: e.target.value }))}
                  />
                )}

                <FormField
                  variant="textarea"
                  label="¿Por qué quieres adoptar?"
                  name="adoption_reason"
                  rows={3}
                  hint="Tu estilo de vida, experiencia con animales, qué esperas de la convivencia…"
                  value={prof.adoption_reason}
                  onChange={(e) => setProf((p) => ({ ...p, adoption_reason: e.target.value }))}
                />
              </div>
            )}

            {/* ── Paso 2: Documentos ──────────────────────────────────────── */}
            {step === 2 && (
              <div className="form-grid">
                <div className="form-section-label">Identificación oficial (INE · Pasaporte · Cédula)</div>

                <div className="form-row">
                  <FileZone
                    label="Frente de la identificación"
                    hint="Foto clara y legible"
                    accept="image/*,.pdf"
                    required
                    files={docs.id_front}
                    onChange={(f) => setDocs((d) => ({ ...d, id_front: f }))}
                    error={docsErr.id_front}
                  />
                  <FileZone
                    label="Reverso de la identificación"
                    hint="Foto clara y legible"
                    accept="image/*,.pdf"
                    required
                    files={docs.id_back}
                    onChange={(f) => setDocs((d) => ({ ...d, id_back: f }))}
                    error={docsErr.id_back}
                  />
                </div>

                <FileZone
                  label="Comprobante de domicilio"
                  hint="Recibo de luz, agua o estado de cuenta — máx. 3 meses de antigüedad"
                  accept="image/*,.pdf"
                  required
                  files={docs.proof_address}
                  onChange={(f) => setDocs((d) => ({ ...d, proof_address: f }))}
                  error={docsErr.proof_address}
                />

                <FileZone
                  label="Fotos de tu hogar"
                  hint="Interior, patio o jardín donde vivirá el animal — hasta 4 fotos"
                  accept="image/*"
                  multiple
                  maxFiles={4}
                  required
                  files={docs.home_photos}
                  onChange={(f) => setDocs((d) => ({ ...d, home_photos: f }))}
                  error={docsErr.home_photos}
                />

                <div className="form-info-box">
                  🔒 Tus documentos son confidenciales y solo los revisa el equipo del refugio para validar tu solicitud.
                </div>
              </div>
            )}

            {/* ── Paso 3: Acta responsiva + firma ─────────────────────────── */}
            {step === 3 && (
              <div className="form-grid">
                <div className="acta-box">
                  <h3>Acta Responsiva de Adopción</h3>
                  <p className="acta-intro">
                    Yo, <strong>{profile.fullName}</strong>, me comprometo voluntariamente a:
                  </p>
                  <ol>
                    <li>Brindar al animal adoptado alimentación adecuada, atención veterinaria regular y cariño permanente.</li>
                    <li>No abandonar, maltratar ni transferir al animal sin informar y obtener aprobación previa del refugio.</li>
                    <li>Mantener al animal en condiciones óptimas de higiene, salud y bienestar.</li>
                    <li>No usar al animal para peleas, reproducción sin control ni actividad que atente contra su bienestar.</li>
                    <li>Permitir visitas de seguimiento del refugio durante los primeros 3 meses tras la adopción.</li>
                    <li>Si no puedo continuar con la tenencia, comunicarlo al refugio con al menos 15 días de anticipación.</li>
                    <li>Llevar al animal al veterinario al menos una vez al año y mantener su plan de vacunación vigente.</li>
                  </ol>
                  <p className="acta-note">
                    Esta acta tiene carácter de compromiso moral y ético con el bienestar animal.
                    El refugio se reserva el derecho de recuperar al animal ante incumplimiento comprobado.
                  </p>
                </div>

                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  <span>He leído y acepto el Acta Responsiva de Adopción</span>
                </label>
                {actaErr.agreed && (
                  <span className="field__msg field__msg--error" role="alert">{actaErr.agreed}</span>
                )}

                <div className="form-field-block">
                  <span className="field__label">
                    Firma digital <span className="field__required" aria-hidden="true">*</span>
                  </span>
                  <span className="field__msg" style={{ display: 'block', marginBottom: 6 }}>
                    Dibuja tu firma con el mouse o con el dedo en pantalla táctil
                  </span>
                  <SigPad
                    isSigned={!!signature}
                    onSign={setSignature}
                    onClear={() => setSignature(null)}
                    error={actaErr.signature}
                  />
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
                onClick={step === 3 ? submit : next}
              >
                {step === 3
                  ? (submitting ? 'Guardando…' : 'Completar perfil y firmar 🐾')
                  : 'Continuar →'}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
