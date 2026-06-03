import { useEffect, useState } from 'react';
import type { AdoptionRequest, AdoptionAdopterSummary, AdoptionStatus } from '../types';
import './ApplicantDrawer.css';

const STATUS_LABEL: Record<AdoptionStatus, string> = {
  pending:  'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
};

interface Props {
  request: AdoptionRequest | null;
  busyId:  number | null;
  onClose:  () => void;
  onApprove: (req: AdoptionRequest) => void;
  onReject:  (req: AdoptionRequest) => void;
}

export default function ApplicantDrawer({
  request,
  busyId,
  onClose,
  onApprove,
  onReject,
}: Props) {

  useEffect(() => {
    if (!request) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [request, onClose]);

  if (!request) return null;

  const { adopter, pet } = request;
  const isPending = request.status === 'pending';
  const isBusy    = busyId === request.id;

  const initial = adopter.fullName.charAt(0).toUpperCase();
  const sentDate = new Date(request.createdAt).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <>
      {/* Backdrop */}
      <div
        className="drawer-backdrop"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className="applicant-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={`Perfil de ${adopter.fullName}`}
      >
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="drawer-header">
          <div className="drawer-header__meta">
            <span className="drawer-eyebrow">Solicitud de adopción</span>
            <span className={`drawer-status drawer-status--${request.status}`}>
              {STATUS_LABEL[request.status]}
            </span>
          </div>
          <button
            className="drawer-close"
            onClick={onClose}
            aria-label="Cerrar panel"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Scrollable body ─────────────────────────────────────────────────── */}
        <div className="drawer-body">

          {/* Avatar + nombre */}
          <div className="drawer-hero">
            {adopter.avatarUrl
              ? <img src={adopter.avatarUrl} alt={adopter.fullName}
                  className="drawer-avatar drawer-avatar--photo" />
              : <div className="drawer-avatar drawer-avatar--initial">{initial}</div>
            }
            <div className="drawer-hero__info">
              <h2 className="drawer-name">{adopter.fullName}</h2>
              {adopter.city && (
                <span className="drawer-location">📍 {adopter.city}</span>
              )}
            </div>
          </div>

          {/* ── Contacto ────────────────────────────────────────────────────── */}
          <section className="drawer-section">
            <h3 className="drawer-section__title">Contacto</h3>
            <ul className="drawer-data-list">
              <li>
                <span className="drawer-data-icon">✉️</span>
                <a href={`mailto:${adopter.email}`} className="drawer-link">
                  {adopter.email}
                </a>
              </li>
              {adopter.phone && (
                <li>
                  <span className="drawer-data-icon">📞</span>
                  <a href={`tel:${adopter.phone}`} className="drawer-link">
                    {adopter.phone}
                  </a>
                </li>
              )}
              {adopter.city && (
                <li>
                  <span className="drawer-data-icon">🏙️</span>
                  <span>{adopter.city}</span>
                </li>
              )}
            </ul>
          </section>

          {/* ── Mascota solicitada ───────────────────────────────────────────── */}
          <section className="drawer-section">
            <h3 className="drawer-section__title">Mascota solicitada</h3>
            <div className="drawer-pet">
              {pet.imageUrl
                ? <img src={pet.imageUrl} alt={pet.name}
                    className="drawer-pet__img" />
                : <div className="drawer-pet__placeholder">
                    {pet.type === 'Perro' ? '🐶' : '🐱'}
                  </div>
              }
              <div className="drawer-pet__info">
                <strong className="drawer-pet__name">{pet.name}</strong>
                <span className="drawer-pet__meta">{pet.breed} · {pet.type}</span>
                <span className="drawer-pet__date">Enviada el {sentDate}</span>
              </div>
            </div>
          </section>

          {/* ── Mensaje ─────────────────────────────────────────────────────── */}
          {request.message && (
            <section className="drawer-section">
              <h3 className="drawer-section__title">Mensaje del solicitante</h3>
              <blockquote className="drawer-message">
                "{request.message}"
              </blockquote>
            </section>
          )}

          {/* ── Perfil del hogar ────────────────────────────────────────────── */}
          <HousingProfile adopter={adopter} />

          {/* ── Documentos ──────────────────────────────────────────────────── */}
          <DocumentsSection adopter={adopter} />

        </div>{/* /drawer-body */}

        {/* ── Footer con acciones ──────────────────────────────────────────── */}
        {isPending && (
          <div className="drawer-footer">
            <button
              className="btn-ghost-danger drawer-footer__btn"
              disabled={isBusy}
              onClick={() => onReject(request)}
            >
              Rechazar solicitud
            </button>
            <button
              className="btn-solid-success drawer-footer__btn"
              disabled={isBusy}
              onClick={() => onApprove(request)}
            >
              {isBusy ? 'Procesando…' : 'Aprobar adopción ✓'}
            </button>
          </div>
        )}

        {!isPending && (
          <div className="drawer-footer drawer-footer--resolved">
            <span className={`drawer-status drawer-status--${request.status} drawer-status--lg`}>
              {STATUS_LABEL[request.status]}
            </span>
          </div>
        )}
      </aside>
    </>
  );
}

// ── Sub-componentes ────────────────────────────────────────────────────────────

const HOUSING_LABEL: Record<string, string> = {
  casa_propia:  'Casa propia',
  casa_renta:   'Casa en renta',
  depa_propio:  'Departamento propio',
  depa_renta:   'Departamento en renta',
  otro:         'Otro',
};

function yn(value: boolean | null): string {
  if (value === null) return '—';
  return value ? 'Sí' : 'No';
}

function HousingProfile({ adopter }: { adopter: AdoptionAdopterSummary }) {
  const hasData = adopter.housingType || adopter.hasGarden !== null
    || adopter.hasChildren !== null || adopter.hasOtherPets !== null
    || adopter.adoptionReason;

  const items: { icon: string; label: string; value: string }[] = [
    {
      icon: '🏠',
      label: 'Tipo de vivienda',
      value: adopter.housingType ? (HOUSING_LABEL[adopter.housingType] ?? adopter.housingType) : '—',
    },
    { icon: '🌿', label: '¿Tiene jardín o patio?', value: yn(adopter.hasGarden) },
    { icon: '👶', label: '¿Hay niños en casa?',    value: yn(adopter.hasChildren) },
    { icon: '🐾', label: '¿Tiene otras mascotas?', value: yn(adopter.hasOtherPets) },
  ];

  return (
    <section className="drawer-section">
      <h3 className="drawer-section__title">
        Perfil del hogar
        {!hasData && <span className="drawer-soon-badge">Sin completar</span>}
      </h3>

      <div className="drawer-coming-list">
        {items.map(({ icon, label, value }) => (
          <div key={label} className="drawer-coming-item">
            <span>{icon}</span>
            <span className="drawer-coming-item__label">{label}</span>
            <span className={`drawer-coming-item__value${value === '—' ? ' drawer-coming-item__pending' : ''}`}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {adopter.hasOtherPets && adopter.otherPetsDesc && (
        <p className="drawer-other-pets">{adopter.otherPetsDesc}</p>
      )}

      {adopter.adoptionReason && (
        <div className="drawer-reason">
          <span className="drawer-reason__label">💬 ¿Por qué quiere adoptar?</span>
          <p className="drawer-reason__text">{adopter.adoptionReason}</p>
        </div>
      )}

      {!hasData && (
        <p className="drawer-coming-hint" style={{ marginTop: 10 }}>
          El adoptante no completó el perfil del hogar todavía.
        </p>
      )}
    </section>
  );
}

// Decide whether a URL is a PDF (raw upload or explicit .pdf extension)
function isPdf(url: string): boolean {
  return url.includes('/raw/') || url.endsWith('.pdf') || url.includes('f_pdf');
}

function DocThumb({
  icon, label, url, onOpen,
}: {
  icon: string;
  label: string;
  url: string | null;
  onOpen: (url: string) => void;
}) {
  if (!url) {
    return (
      <div className="drawer-doc-thumb drawer-doc-thumb--empty">
        <span className="drawer-doc-thumb__placeholder">{icon}</span>
        <span className="drawer-doc-thumb__label">{label}</span>
        <span className="drawer-doc-thumb__pending">Pendiente</span>
      </div>
    );
  }

  if (isPdf(url)) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="drawer-doc-thumb drawer-doc-thumb--pdf"
        title={`Ver ${label}`}
      >
        <span className="drawer-doc-thumb__pdf-icon">📄</span>
        <span className="drawer-doc-thumb__label">{label}</span>
        <span className="drawer-doc-thumb__badge">PDF</span>
      </a>
    );
  }

  return (
    <button
      className="drawer-doc-thumb"
      onClick={() => onOpen(url)}
      aria-label={`Ver ${label}`}
      title={`Ver ${label}`}
    >
      <img src={url} alt={label} className="drawer-doc-thumb__img" />
      <div className="drawer-doc-thumb__overlay">
        <span className="drawer-doc-thumb__label">{label}</span>
        <span className="drawer-doc-thumb__zoom">🔍</span>
      </div>
    </button>
  );
}

function DocumentsSection({ adopter }: { adopter: AdoptionAdopterSummary }) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  const hasAnyDoc = adopter.idFrontUrl || adopter.idBackUrl
    || adopter.proofAddressUrl || adopter.homePhotoUrls.length > 0
    || adopter.signatureUrl;

  const idDocs = [
    { icon: '🪪', label: 'ID — Frente',  url: adopter.idFrontUrl },
    { icon: '🪪', label: 'ID — Reverso', url: adopter.idBackUrl },
  ];

  return (
    <section className="drawer-section">
      <h3 className="drawer-section__title">
        Documentos entregados
        {!hasAnyDoc && <span className="drawer-soon-badge">Sin documentos</span>}
      </h3>

      {/* Identificación (frente + reverso en fila) */}
      <div className="drawer-docs-group">
        <span className="drawer-docs-group__label">🪪 Identificación oficial</span>
        <div className="drawer-doc-thumb-row">
          {idDocs.map(({ icon, label, url }) => (
            <DocThumb key={label} icon={icon} label={label} url={url} onOpen={setLightbox} />
          ))}
        </div>
      </div>

      {/* Comprobante de domicilio */}
      <div className="drawer-docs-group">
        <span className="drawer-docs-group__label">📋 Comprobante de domicilio</span>
        <div className="drawer-doc-thumb-row drawer-doc-thumb-row--single">
          <DocThumb
            icon="📋"
            label="Comprobante"
            url={adopter.proofAddressUrl}
            onOpen={setLightbox}
          />
        </div>
      </div>

      {/* Fotos del hogar */}
      {(adopter.homePhotoUrls.length > 0 || true) && (
        <div className="drawer-docs-group">
          <span className="drawer-docs-group__label">📸 Fotos del hogar</span>
          {adopter.homePhotoUrls.length > 0 ? (
            <div className="drawer-home-photos__grid">
              {adopter.homePhotoUrls.map((url, i) => (
                <button
                  key={url}
                  className="drawer-home-photo-thumb"
                  onClick={() => setLightbox(url)}
                  aria-label={`Foto del hogar ${i + 1}`}
                >
                  <img src={url} alt={`Hogar ${i + 1}`} />
                </button>
              ))}
            </div>
          ) : (
            <div className="drawer-doc-thumb-row drawer-doc-thumb-row--single">
              <div className="drawer-doc-thumb drawer-doc-thumb--empty">
                <span className="drawer-doc-thumb__placeholder">🏠</span>
                <span className="drawer-doc-thumb__label">Fotos del hogar</span>
                <span className="drawer-doc-thumb__pending">Pendiente</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Firma digital */}
      <div className="drawer-docs-group">
        <span className="drawer-docs-group__label">✍️ Firma digital (acta responsiva)</span>
        <div className="drawer-doc-thumb-row drawer-doc-thumb-row--single">
          <DocThumb
            icon="✍️"
            label="Firma digital"
            url={adopter.signatureUrl}
            onOpen={setLightbox}
          />
        </div>
      </div>

      {!hasAnyDoc && (
        <p className="drawer-coming-hint" style={{ marginTop: 10 }}>
          El adoptante no ha subido documentos todavía.
        </p>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="drawer-lightbox"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Vista ampliada"
        >
          <button
            className="drawer-lightbox__close"
            onClick={() => setLightbox(null)}
            aria-label="Cerrar"
          >×</button>
          <img
            src={lightbox}
            alt="Documento"
            className="drawer-lightbox__img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
