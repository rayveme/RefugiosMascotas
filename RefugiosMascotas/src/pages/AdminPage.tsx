import { useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { adminApi } from '../api/admin';
import { extractApiError } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import type { AuthAdopter, AuthFoundation, FoundationStatus, Pet } from '../types';
import type { ShellContext } from '../types/shell';
import EditFoundationModal from '../components/admin/EditFoundationModal';
import EditAdopterModal from '../components/admin/EditAdopterModal';
import './AdminPage.css';

/** Fila expandible con el detalle completo de una fundación */
function FoundationDetailRow({ f }: { f: AuthFoundation }) {
  const [open, setOpen] = useState(false);

  const hasLocation = f.address || f.state || f.postalCode;
  const hasSocial   = f.instagram || f.facebook || f.website;
  const hasOps      = f.schedule || f.vetName || f.vetPhone || f.references;
  const hasLegal    = f.legalId || f.donationClabe;
  const photos      = f.refugePhotosUrls
    ? f.refugePhotosUrls.split(',').filter(Boolean)
    : [];
  const hasDocs     = f.idFrontUrl || f.actaUrl || f.proofAddressUrl || photos.length > 0;

  return (
    <>
      {open && (
        <div className="admin-detail-panel">
          <div className="admin-detail-grid">

            {/* ── Contacto ── */}
            <div className="admin-detail-section">
              <h4 className="admin-detail-section__title">📞 Contacto</h4>
              <ul className="admin-detail-list">
                <li><span>Email</span><strong>{f.email}</strong></li>
                {f.responsible && <li><span>Responsable</span><strong>{f.responsible}</strong></li>}
                {f.phone       && <li><span>Teléfono</span><strong>{f.phone}</strong></li>}
                {f.whatsapp    && <li><span>WhatsApp</span><strong>{f.whatsapp}</strong></li>}
              </ul>
            </div>

            {/* ── Ubicación ── */}
            {hasLocation && (
              <div className="admin-detail-section">
                <h4 className="admin-detail-section__title">📍 Ubicación</h4>
                <ul className="admin-detail-list">
                  {f.address    && <li><span>Dirección</span><strong>{f.address}</strong></li>}
                  {f.city       && <li><span>Ciudad</span><strong>{f.city}</strong></li>}
                  {f.state      && <li><span>Estado</span><strong>{f.state}</strong></li>}
                  {f.postalCode && <li><span>C.P.</span><strong>{f.postalCode}</strong></li>}
                </ul>
              </div>
            )}

            {/* ── Sobre el refugio ── */}
            <div className="admin-detail-section">
              <h4 className="admin-detail-section__title">🏠 Sobre el refugio</h4>
              <ul className="admin-detail-list">
                <li><span>Años de operación</span><strong>{f.years} año{f.years !== 1 ? 's' : ''}</strong></li>
                {f.description && (
                  <li className="admin-detail-list__full">
                    <span>Descripción</span>
                    <p style={{ whiteSpace: 'pre-line' }}>{f.description}</p>
                  </li>
                )}
              </ul>
            </div>

            {/* ── Redes sociales y web ── */}
            {hasSocial && (
              <div className="admin-detail-section">
                <h4 className="admin-detail-section__title">🌐 Web y redes</h4>
                <ul className="admin-detail-list">
                  {f.website   && <li><span>Sitio web</span><a href={f.website} target="_blank" rel="noopener noreferrer">{f.website}</a></li>}
                  {f.instagram && <li><span>Instagram</span><a href={f.instagram.startsWith('http') ? f.instagram : `https://instagram.com/${f.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer">{f.instagram}</a></li>}
                  {f.facebook  && <li><span>Facebook</span><a href={f.facebook.startsWith('http') ? f.facebook : `https://facebook.com/${f.facebook}`} target="_blank" rel="noopener noreferrer">{f.facebook}</a></li>}
                </ul>
              </div>
            )}

            {/* ── Operación ── */}
            {hasOps && (
              <div className="admin-detail-section">
                <h4 className="admin-detail-section__title">⚙️ Operación</h4>
                <ul className="admin-detail-list">
                  {f.schedule  && <li className="admin-detail-list__full"><span>Horario</span><p>{f.schedule}</p></li>}
                  {f.vetName   && <li><span>Veterinario</span><strong>{f.vetName}</strong></li>}
                  {f.vetPhone  && <li><span>Tel. veterinario</span><strong>{f.vetPhone}</strong></li>}
                  {f.references && (
                    <li className="admin-detail-list__full">
                      <span>Referencias</span>
                      <p style={{ whiteSpace: 'pre-line' }}>{f.references}</p>
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* ── Legal ── */}
            {hasLegal && (
              <div className="admin-detail-section">
                <h4 className="admin-detail-section__title">⚖️ Legal</h4>
                <ul className="admin-detail-list">
                  {f.legalId       && <li><span>RFC / Registro</span><strong>{f.legalId}</strong></li>}
                  {f.donationClabe && <li><span>CLABE donaciones</span><strong>{f.donationClabe}</strong></li>}
                </ul>
              </div>
            )}

            {/* ── Documentos ── */}
            {hasDocs && (
              <div className="admin-detail-section admin-detail-section--full">
                <h4 className="admin-detail-section__title">📎 Documentos adjuntos</h4>
                <div className="admin-docs-grid">
                  {f.idFrontUrl && (
                    <a className="admin-doc-card" href={f.idFrontUrl} target="_blank" rel="noopener noreferrer">
                      <span className="admin-doc-card__icon">🪪</span>
                      <span>Identificación del responsable</span>
                    </a>
                  )}
                  {f.actaUrl && (
                    <a className="admin-doc-card" href={f.actaUrl} target="_blank" rel="noopener noreferrer">
                      <span className="admin-doc-card__icon">📋</span>
                      <span>Acta constitutiva / Registro</span>
                    </a>
                  )}
                  {f.proofAddressUrl && (
                    <a className="admin-doc-card" href={f.proofAddressUrl} target="_blank" rel="noopener noreferrer">
                      <span className="admin-doc-card__icon">🏠</span>
                      <span>Comprobante de domicilio</span>
                    </a>
                  )}
                  {photos.map((url, i) => (
                    <a key={i} className="admin-doc-card admin-doc-card--photo" href={url} target="_blank" rel="noopener noreferrer">
                      <img src={url} alt={`Foto del refugio ${i + 1}`} />
                      <span>Foto {i + 1}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
      <button
        className="admin-row__toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {open ? '▲ Ocultar detalles' : '▼ Ver detalles completos'}
      </button>
    </>
  );
}

type Tab = 'pending' | 'foundations' | 'adopters' | 'pets';

const TAB_LABEL: Record<Tab, string> = {
  pending: 'Solicitudes pendientes',
  foundations: 'Fundaciones',
  adopters: 'Adoptantes',
  pets: 'Mascotas',
};

const STATUS_LABEL: Record<FoundationStatus, string> = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
};

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const ctx = useOutletContext<ShellContext>();
  const [tab, setTab] = useState<Tab>('pending');

  const [foundations, setFoundations] = useState<AuthFoundation[]>([]);
  const [pendingFoundations, setPendingFoundations] = useState<AuthFoundation[]>([]);
  const [adopters, setAdopters] = useState<AuthAdopter[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  // ── Modales de edición ──
  const [editingFoundation, setEditingFoundation] = useState<AuthFoundation | null>(null);
  const [editingAdopter, setEditingAdopter] = useState<AuthAdopter | null>(null);

  const isAdmin = user?.role === 'admin';

  const load = async (which: Tab = tab) => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      if (which === 'pending') {
        const data = await adminApi.listFoundations('pending');
        setPendingFoundations(data);
      } else if (which === 'foundations') {
        const data = await adminApi.listFoundations();
        setFoundations(data);
      } else if (which === 'adopters') {
        const data = await adminApi.listAdopters();
        setAdopters(data);
      } else if (which === 'pets') {
        const data = await adminApi.listPets();
        setPets(data);
      }
    } catch (err) {
      ctx.showToast(extractApiError(err, 'No pudimos cargar los datos.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) load(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, tab]);

  const pendingCount = pendingFoundations.length;

  const onApproveFoundation = async (f: AuthFoundation) => {
    const ok = await ctx.confirm({
      title: 'Aprobar fundación',
      message: <>¿Aprobar la solicitud de <strong>{f.name}</strong>? Podrá publicar mascotas inmediatamente.</>,
      confirmText: 'Aprobar',
      tone: 'primary',
    });
    if (!ok) return;
    setBusyId(`f-${f.id}`);
    try {
      await adminApi.approveFoundation(f.id);
      ctx.showToast(`${f.name} aprobada`, 'success');
      ctx.bumpFoundations();
      await load();
    } catch (err) {
      ctx.showToast(extractApiError(err, 'No pudimos aprobar.'), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const onRejectFoundation = async (f: AuthFoundation) => {
    const ok = await ctx.confirm({
      title: 'Rechazar fundación',
      message: <>¿Rechazar la solicitud de <strong>{f.name}</strong>?</>,
      confirmText: 'Rechazar',
      tone: 'danger',
    });
    if (!ok) return;
    setBusyId(`f-${f.id}`);
    try {
      await adminApi.rejectFoundation(f.id);
      ctx.showToast(`${f.name} rechazada`, 'info');
      await load();
    } catch (err) {
      ctx.showToast(extractApiError(err, 'No pudimos rechazar.'), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const onDeleteFoundation = async (f: AuthFoundation) => {
    const ok = await ctx.confirm({
      title: 'Eliminar fundación',
      message: <>¿Eliminar permanentemente <strong>{f.name}</strong>? Se borrarán también sus mascotas y solicitudes. Esta acción no se puede deshacer.</>,
      confirmText: 'Eliminar',
      tone: 'danger',
    });
    if (!ok) return;
    setBusyId(`f-${f.id}`);
    try {
      await adminApi.deleteFoundation(f.id);
      ctx.showToast(`${f.name} eliminada`, 'info');
      ctx.bumpFoundations();
      ctx.bumpPets();
      await load();
    } catch (err) {
      ctx.showToast(extractApiError(err, 'No pudimos eliminar.'), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const onDeleteAdopter = async (a: AuthAdopter) => {
    const ok = await ctx.confirm({
      title: 'Eliminar adoptante',
      message: <>¿Eliminar la cuenta de <strong>{a.fullName}</strong> ({a.email})?</>,
      confirmText: 'Eliminar',
      tone: 'danger',
    });
    if (!ok) return;
    setBusyId(`a-${a.id}`);
    try {
      await adminApi.deleteAdopter(a.id);
      ctx.showToast(`${a.fullName} eliminado`, 'info');
      await load();
    } catch (err) {
      ctx.showToast(extractApiError(err, 'No pudimos eliminar.'), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const onFoundationSaved = (updated: AuthFoundation) => {
    setFoundations((prev) => prev.map((f) => f.id === updated.id ? updated : f));
    setPendingFoundations((prev) => prev.map((f) => f.id === updated.id ? updated : f));
    ctx.showToast(`${updated.name} actualizada`, 'success');
    ctx.bumpFoundations();
  };

  const onAdopterSaved = (updated: AuthAdopter) => {
    setAdopters((prev) => prev.map((a) => a.id === updated.id ? updated : a));
    ctx.showToast(`${updated.fullName} actualizado`, 'success');
  };

  const onDeletePet = async (pet: Pet) => {
    const ok = await ctx.confirm({
      title: 'Eliminar mascota',
      message: <>¿Eliminar la publicación de <strong>{pet.name}</strong>?</>,
      confirmText: 'Eliminar',
      tone: 'danger',
    });
    if (!ok) return;
    setBusyId(`p-${pet.id}`);
    try {
      await adminApi.deletePet(pet.id);
      ctx.showToast(`Publicación de ${pet.name} eliminada`, 'info');
      ctx.bumpPets();
      ctx.bumpFoundations();
      await load();
    } catch (err) {
      ctx.showToast(extractApiError(err, 'No pudimos eliminar.'), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const adminProfile = useMemo(
    () => (user?.role === 'admin' ? user.profile : null),
    [user],
  );

  if (authLoading) {
    return <section className="admin-page"><div className="container"><p>Cargando…</p></div></section>;
  }

  if (!isAdmin) {
    return (
      <section className="admin-page">
        <div className="container">
          <div className="admin-empty">
            <h2 className="display-md">Acceso restringido</h2>
            <p>Esta página es solo para administradores. Si tienes una cuenta admin, inicia sesión.</p>
            <button className="btn btn--amber btn--lg" onClick={ctx.openLogin}>Iniciar sesión</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-page">
      {/* ── Modales de edición ── */}
      <EditFoundationModal
        foundation={editingFoundation}
        onClose={() => setEditingFoundation(null)}
        onSaved={onFoundationSaved}
      />
      <EditAdopterModal
        adopter={editingAdopter}
        onClose={() => setEditingAdopter(null)}
        onSaved={onAdopterSaved}
      />

      <div className="container">
        <header className="admin-header">
          <div className="eyebrow">
            <span className="eyebrow__line" aria-hidden="true" />
            <span className="eyebrow__text">Panel de administración</span>
          </div>
          <h1 className="display-md">Hola, {adminProfile?.fullName ?? 'admin'}</h1>
          <p className="admin-subtitle">
            Gestiona solicitudes de fundaciones, cuentas y publicaciones desde aquí.
          </p>
        </header>

        <nav className="admin-tabs" role="tablist">
          {(['pending', 'foundations', 'adopters', 'pets'] as Tab[]).map((t) => (
            <button
              key={t}
              role="tab"
              className={`admin-tab${tab === t ? ' admin-tab--active' : ''}`}
              onClick={() => setTab(t)}
            >
              {TAB_LABEL[t]}
              {t === 'pending' && pendingCount > 0 && (
                <span className="admin-tab__badge">{pendingCount}</span>
              )}
            </button>
          ))}
        </nav>

        {loading && <p className="admin-loading">Cargando…</p>}

        {!loading && tab === 'pending' && (
          pendingFoundations.length === 0 ? (
            <div className="admin-empty">
              <p>No hay solicitudes pendientes de revisión.</p>
            </div>
          ) : (
            <ul className="admin-list">
              {pendingFoundations.map((f) => (
                <li key={f.id} className="admin-row admin-row--expandable">
                  <div className="admin-row__top">
                    <div className="admin-row__avatar" style={{ background: `linear-gradient(135deg, ${f.gradientFrom}, ${f.gradientTo})` }}>
                      {f.initial}
                    </div>
                    <div className="admin-row__main">
                      <strong>{f.name}</strong>
                      <span className="admin-row__meta">📍 {f.city}{f.state ? `, ${f.state}` : ''} · {f.email}</span>
                      {f.phone && <span className="admin-row__meta">📞 {f.phone}{f.whatsapp ? ` · WhatsApp: ${f.whatsapp}` : ''}</span>}
                      {f.responsible && <span className="admin-row__meta">👤 Responsable: {f.responsible}</span>}
                      {f.description && <p className="admin-row__desc">"{f.description}"</p>}
                    </div>
                    <div className="admin-row__actions">
                      <button
                        className="btn-ghost-danger"
                        disabled={busyId === `f-${f.id}`}
                        onClick={() => onRejectFoundation(f)}
                      >
                        Rechazar
                      </button>
                      <button
                        className="btn-solid-success"
                        disabled={busyId === `f-${f.id}`}
                        onClick={() => onApproveFoundation(f)}
                      >
                        {busyId === `f-${f.id}` ? '…' : 'Aprobar'}
                      </button>
                    </div>
                  </div>
                  <FoundationDetailRow f={f} />
                </li>
              ))}
            </ul>
          )
        )}

        {!loading && tab === 'foundations' && (
          foundations.length === 0 ? (
            <div className="admin-empty"><p>No hay fundaciones registradas.</p></div>
          ) : (
            <ul className="admin-list">
              {foundations.map((f) => (
                <li key={f.id} className="admin-row admin-row--expandable">
                  <div className="admin-row__top">
                    <div className="admin-row__avatar" style={{ background: `linear-gradient(135deg, ${f.gradientFrom}, ${f.gradientTo})` }}>
                      {f.initial}
                    </div>
                    <div className="admin-row__main">
                      <strong>
                        <Link to={`/refugios/${f.id}`}>{f.name}</Link>
                      </strong>
                      <span className="admin-row__meta">📍 {f.city}{f.state ? `, ${f.state}` : ''} · {f.email}</span>
                      <div className="admin-row__chips">
                        <span className={`admin-status admin-status--${f.status}`}>{STATUS_LABEL[f.status]}</span>
                        <span className="admin-row__meta">{f.animals} mascotas · {f.adoptions} adopciones</span>
                      </div>
                    </div>
                    <div className="admin-row__actions">
                      <button
                        className="btn-admin-edit"
                        disabled={busyId === `f-${f.id}`}
                        onClick={() => setEditingFoundation(f)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn-ghost-danger"
                        disabled={busyId === `f-${f.id}`}
                        onClick={() => onDeleteFoundation(f)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                  <FoundationDetailRow f={f} />
                </li>
              ))}
            </ul>
          )
        )}

        {!loading && tab === 'adopters' && (
          adopters.length === 0 ? (
            <div className="admin-empty"><p>No hay adoptantes registrados.</p></div>
          ) : (
            <ul className="admin-list">
              {adopters.map((a) => (
                <li key={a.id} className="admin-row">
                  <div className="admin-row__avatar admin-row__avatar--adopter">
                    {a.avatarUrl
                      ? <img src={a.avatarUrl} alt="" />
                      : a.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="admin-row__main">
                    <strong>{a.fullName}</strong>
                    <span className="admin-row__meta">{a.email}</span>
                    {a.city && <span className="admin-row__meta">📍 {a.city}</span>}
                    {a.phone && <span className="admin-row__meta">📞 {a.phone}</span>}
                  </div>
                  <div className="admin-row__actions">
                    <button
                      className="btn-admin-edit"
                      disabled={busyId === `a-${a.id}`}
                      onClick={() => setEditingAdopter(a)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-ghost-danger"
                      disabled={busyId === `a-${a.id}`}
                      onClick={() => onDeleteAdopter(a)}
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )
        )}

        {!loading && tab === 'pets' && (
          pets.length === 0 ? (
            <div className="admin-empty"><p>No hay mascotas publicadas.</p></div>
          ) : (
            <ul className="admin-list admin-list--pets">
              {pets.map((p) => (
                <li key={p.id} className="admin-row">
                  <div className="admin-row__pet-img">
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt="" />
                      : <div style={{ background: `linear-gradient(140deg, ${p.gradientFrom}, ${p.gradientTo})` }}>
                          {p.type === 'Perro' ? '🐶' : '🐱'}
                        </div>
                    }
                  </div>
                  <div className="admin-row__main">
                    <strong>{p.name} {p.isAdopted && <span className="admin-status admin-status--approved">Adoptada</span>}</strong>
                    <span className="admin-row__meta">{p.breed} · {p.age} · {p.city}</span>
                    <span className="admin-row__meta">Refugio: {p.shelter}</span>
                  </div>
                  <div className="admin-row__actions">
                    <button
                      className="btn-ghost-danger"
                      disabled={busyId === `p-${p.id}`}
                      onClick={() => onDeletePet(p)}
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )
        )}
      </div>
    </section>
  );
}
