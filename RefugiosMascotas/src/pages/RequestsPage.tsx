import { useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { adoptionsApi } from '../api/adoptions';
import { extractApiError } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import type { AdoptionRequest, AdoptionStatus } from '../types';
import type { ShellContext } from '../types/shell';
import './RequestsPage.css';

const STATUS_LABEL: Record<AdoptionStatus, string> = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
};

export default function RequestsPage() {
  const { user, loading: authLoading } = useAuth();
  const ctx = useOutletContext<ShellContext>();
  const [requests, setRequests] = useState<AdoptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<AdoptionStatus | 'all'>('all');
  const [busyId, setBusyId] = useState<number | null>(null);

  const role = user?.role;

  const load = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    setRequests([]);  // limpia stale data al cambiar de rol/usuario
    try {
      const data = role === 'foundation'
        ? await adoptionsApi.listReceived()
        : await adoptionsApi.listMine();
      setRequests(data);
    } catch (err) {
      setError(extractApiError(err, 'No pudimos cargar las solicitudes.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFilter('all');  // resetea filtro al cambiar de usuario
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.profile.id, role]);

  const filtered = useMemo(
    () => (filter === 'all' ? requests : requests.filter((r) => r.status === filter)),
    [requests, filter],
  );

  const counts = useMemo(() => {
    const c: Record<AdoptionStatus, number> = { pending: 0, approved: 0, rejected: 0 };
    for (const r of requests) c[r.status] += 1;
    return c;
  }, [requests]);

  const onApprove = async (req: AdoptionRequest) => {
    const ok = await ctx.confirm({
      title: 'Aprobar solicitud',
      message: (
        <>
          ¿Aprobar la solicitud de <strong>{req.adopter.fullName}</strong> para{' '}
          <strong>{req.pet.name}</strong>? Las demás solicitudes pendientes para esa mascota se rechazarán automáticamente.
        </>
      ),
      confirmText: 'Aprobar',
      tone: 'primary',
    });
    if (!ok) return;
    setBusyId(req.id);
    try {
      await adoptionsApi.approve(req.id);
      ctx.showToast(`${req.pet.name} fue asignada a ${req.adopter.fullName}`, 'success');
      ctx.bumpPets();
      ctx.bumpFoundations();
      await load();
    } catch (err) {
      ctx.showToast(extractApiError(err, 'No pudimos aprobar la solicitud.'), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const onReject = async (req: AdoptionRequest) => {
    const ok = await ctx.confirm({
      title: 'Rechazar solicitud',
      message: (
        <>
          ¿Rechazar la solicitud de <strong>{req.adopter.fullName}</strong> para{' '}
          <strong>{req.pet.name}</strong>? Esta acción no se puede deshacer.
        </>
      ),
      confirmText: 'Rechazar',
      tone: 'danger',
    });
    if (!ok) return;
    setBusyId(req.id);
    try {
      await adoptionsApi.reject(req.id);
      ctx.showToast(`Solicitud de ${req.adopter.fullName} rechazada`, 'info');
      await load();
    } catch (err) {
      ctx.showToast(extractApiError(err, 'No pudimos rechazar la solicitud.'), 'error');
    } finally {
      setBusyId(null);
    }
  };

  if (authLoading) {
    return <section className="requests-page"><div className="container"><p>Cargando…</p></div></section>;
  }

  if (!user) {
    return (
      <section className="requests-page">
        <div className="container">
          <div className="requests-empty">
            <h2 className="display-md">Inicia sesión</h2>
            <p>Necesitas una cuenta para ver solicitudes de adopción.</p>
            <button className="btn btn--amber btn--lg" onClick={ctx.openLogin}>
              Iniciar sesión
            </button>
          </div>
        </div>
      </section>
    );
  }

  const isFoundation = role === 'foundation';

  return (
    <section className="requests-page">
      <div className="container">
        <header className="requests-header">
          <div className="eyebrow">
            <span className="eyebrow__line" aria-hidden="true" />
            <span className="eyebrow__text">
              {isFoundation ? 'Bandeja de entrada' : 'Mis solicitudes'}
            </span>
          </div>
          <h1 className="display-md">
            {isFoundation ? 'Solicitudes de adopción' : 'Mis solicitudes de adopción'}
          </h1>
          <p className="requests-subtitle">
            {isFoundation
              ? 'Revisa las solicitudes que recibiste y decide a qué familia se irá cada mascota.'
              : 'El estado se actualiza cuando la fundación responde. Si aprueban una, las otras pendientes se cancelan automáticamente.'}
          </p>
        </header>

        <div className="requests-filters" role="tablist">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              role="tab"
              className={`requests-filter${filter === f ? ' requests-filter--active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'Todas' : STATUS_LABEL[f]}
              {f !== 'all' && (
                <span className={`requests-filter__count requests-filter__count--${f}`}>
                  {counts[f]}
                </span>
              )}
            </button>
          ))}
        </div>

        {error && <div className="form-error-banner">{error}</div>}

        {loading ? (
          <div className="requests-list">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="request-card request-card--skeleton" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="requests-empty">
            <p>
              {filter === 'all'
                ? (isFoundation
                    ? 'Aún no recibes solicitudes. Cuando alguien quiera adoptar una de tus mascotas aparecerá aquí.'
                    : 'Aún no has enviado solicitudes. Explora las mascotas disponibles y envía la primera.')
                : `No hay solicitudes en estado "${STATUS_LABEL[filter]}".`}
            </p>
          </div>
        ) : (
          <ul className="requests-list">
            {filtered.map((req) => (
              <li key={req.id} className={`request-card request-card--${req.status}`}>
                <div className="request-card__pet">
                  {req.pet.imageUrl ? (
                    <img src={req.pet.imageUrl} alt={req.pet.name} className="request-card__pet-img" />
                  ) : (
                    <div className="request-card__pet-placeholder">
                      {req.pet.type === 'Perro' ? '🐶' : '🐱'}
                    </div>
                  )}
                  <div className="request-card__pet-info">
                    <Link to={`/refugios/${req.foundationId}`} className="request-card__pet-name">
                      {req.pet.name}
                    </Link>
                    <span className="request-card__pet-meta">{req.pet.breed} · {req.pet.type}</span>
                  </div>
                </div>

                <div className="request-card__divider" aria-hidden="true" />

                <div className="request-card__person">
                  <span className="request-card__person-label">
                    {isFoundation ? 'Adoptante' : 'Tu solicitud'}
                  </span>
                  {isFoundation ? (
                    <>
                      <strong>{req.adopter.fullName}</strong>
                      <span className="request-card__person-detail">{req.adopter.email}</span>
                      {req.adopter.phone && (
                        <span className="request-card__person-detail">📞 {req.adopter.phone}</span>
                      )}
                      {req.adopter.city && (
                        <span className="request-card__person-detail">📍 {req.adopter.city}</span>
                      )}
                    </>
                  ) : (
                    <span className="request-card__person-detail">
                      Enviada el {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  )}
                  {req.message && (
                    <p className="request-card__message">"{req.message}"</p>
                  )}
                </div>

                <div className="request-card__actions">
                  <span className={`request-status request-status--${req.status}`}>
                    {STATUS_LABEL[req.status]}
                  </span>

                  {isFoundation && req.status === 'pending' && (
                    <div className="request-card__buttons">
                      <button
                        className="btn-ghost-danger"
                        disabled={busyId === req.id}
                        onClick={() => onReject(req)}
                      >
                        Rechazar
                      </button>
                      <button
                        className="btn-solid-success"
                        disabled={busyId === req.id}
                        onClick={() => onApprove(req)}
                      >
                        {busyId === req.id ? 'Procesando…' : 'Aprobar'}
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
