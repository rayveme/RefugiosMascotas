import { useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { foundationsApi } from '../api/foundations';
import { petsApi } from '../api/pets';
import { adoptionsApi } from '../api/adoptions';
import { extractApiError } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import type { Pet, Refugio } from '../types';
import type { ShellContext } from '../types/shell';
import './FoundationDetailPage.css';

const DogIllo = () => (
  <svg width="92" height="92" viewBox="0 0 120 120" fill="none" aria-hidden="true">
    <circle cx="60" cy="75" r="34" fill="rgba(255,255,255,.14)" />
    <circle cx="42" cy="40" r="16" fill="rgba(255,255,255,.14)" />
    <circle cx="78" cy="40" r="16" fill="rgba(255,255,255,.14)" />
    <ellipse cx="60" cy="78" rx="22" ry="18" fill="rgba(255,255,255,.2)" />
    <circle cx="52" cy="70" r="5" fill="rgba(255,255,255,.55)" />
    <circle cx="68" cy="70" r="5" fill="rgba(255,255,255,.55)" />
  </svg>
);

const CatIllo = () => (
  <svg width="92" height="92" viewBox="0 0 120 120" fill="none" aria-hidden="true">
    <ellipse cx="60" cy="80" rx="28" ry="24" fill="rgba(255,255,255,.14)" />
    <circle cx="60" cy="52" r="22" fill="rgba(255,255,255,.14)" />
    <polygon points="40,36 33,20 50,32" fill="rgba(255,255,255,.2)" />
    <polygon points="80,36 87,20 70,32" fill="rgba(255,255,255,.2)" />
    <ellipse cx="52" cy="52" rx="5" ry="6" fill="rgba(255,255,255,.55)" />
    <ellipse cx="68" cy="52" rx="5" ry="6" fill="rgba(255,255,255,.55)" />
  </svg>
);

export default function FoundationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const ctx = useOutletContext<ShellContext>();
  const { user } = useAuth();

  const foundationId = useMemo(() => {
    const n = Number(id);
    return Number.isFinite(n) ? n : null;
  }, [id]);

  const [refugio, setRefugio] = useState<Refugio | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adoptingId, setAdoptingId] = useState<number | null>(null);
  const [showAdopted, setShowAdopted] = useState(false);
  const [pendingPetIds, setPendingPetIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (user?.role !== 'adopter') {
      setPendingPetIds(new Set());
      return;
    }
    let alive = true;
    adoptionsApi.listMine('pending')
      .then((reqs) => {
        if (!alive) return;
        setPendingPetIds(new Set(reqs.map((r) => r.petId)));
      })
      .catch(() => { /* silencioso */ });
    return () => { alive = false; };
  }, [user?.role, user?.profile.id]);

  const isOwner = user?.role === 'foundation' && user.profile.id === foundationId;

  const { petsRefreshKey } = ctx;

  useEffect(() => {
    if (foundationId === null) {
      setError('ID inválido');
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    Promise.all([
      foundationsApi.get(foundationId),
      petsApi.list({ foundation_id: foundationId, include_adopted: showAdopted }),
    ])
      .then(([r, p]) => {
        if (!alive) return;
        setRefugio(r);
        setPets(p);
        setError(null);
      })
      .catch((err) => alive && setError(extractApiError(err, 'No pudimos cargar el refugio.')))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [foundationId, petsRefreshKey, showAdopted]);

  const onAdopt = async (pet: Pet) => {
    if (!user) { ctx.openLogin(); return; }
    if (user.role !== 'adopter') {
      ctx.showToast('Esta acción es solo para usuarios adoptantes.', 'warning');
      return;
    }
    if (!user.profile.profileComplete) {
      ctx.showToast('Completa ciudad y teléfono en tu perfil para poder adoptar.', 'warning');
      return;
    }
    setAdoptingId(pet.id);
    try {
      await adoptionsApi.request(pet.id);
      setPendingPetIds((cur) => new Set(cur).add(pet.id));
      ctx.showToast(
        `Solicitud enviada para ${pet.name}. La fundación la revisará pronto.`,
        'success',
      );
    } catch (err) {
      ctx.showToast(extractApiError(err, 'No pudimos enviar la solicitud.'), 'error');
    } finally {
      setAdoptingId(null);
    }
  };

  const onDelete = async (pet: Pet) => {
    const ok = await ctx.confirm({
      title: 'Eliminar publicación',
      message: <>¿Eliminar la publicación de <strong>{pet.name}</strong>? Esta acción no se puede deshacer.</>,
      confirmText: 'Eliminar',
      tone: 'danger',
    });
    if (!ok) return;
    try {
      await petsApi.remove(pet.id);
      setPets((cur) => cur.filter((p) => p.id !== pet.id));
      ctx.bumpPets();
      ctx.showToast(`Publicación de ${pet.name} eliminada`, 'info');
    } catch (err) {
      ctx.showToast(extractApiError(err, 'No pudimos eliminar.'), 'error');
    }
  };

  if (loading) {
    return (
      <section className="foundation-detail">
        <div className="container">
          <div className="foundation-detail__hero foundation-detail__hero--skeleton" />
        </div>
      </section>
    );
  }

  if (error || !refugio) {
    return (
      <section className="foundation-detail">
        <div className="container">
          <div className="foundation-detail__error">
            <p>{error ?? 'Refugio no encontrado'}</p>
            <Link to="/refugios" className="btn btn--ghost-dark">Volver a refugios</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="foundation-detail">
      <div className="container">
        <Link to="/refugios" className="foundation-detail__back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Refugios
        </Link>

        <header
          className="foundation-detail__hero"
          style={{ background: `linear-gradient(135deg, ${refugio.gradientFrom}, ${refugio.gradientTo})` }}
        >
          <div className="foundation-detail__avatar" aria-hidden="true">{refugio.initial}</div>
          <div className="foundation-detail__hero-text">
            <h1 className="foundation-detail__name">{refugio.name}</h1>
            <p className="foundation-detail__city">{refugio.city}, Colombia</p>
            <ul className="foundation-detail__stats">
              <li><strong>{refugio.animals}</strong><span>Mascotas</span></li>
              <li><strong>{refugio.adoptions}</strong><span>Adopciones</span></li>
              <li><strong>{refugio.years}</strong><span>Años activos</span></li>
            </ul>
          </div>
          {isOwner && (
            <div className="foundation-detail__owner-actions">
              {user?.role === 'foundation' && user.profile.status === 'approved' && (
                <button className="btn btn--amber" onClick={ctx.openPetForm}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Publicar mascota
                </button>
              )}
              <button className="btn btn--ghost-light" onClick={ctx.openProfileEdit}>
                Editar refugio
              </button>
            </div>
          )}
        </header>

        {isOwner && user?.role === 'foundation' && user.profile.status === 'pending' && (
          <div className="foundation-detail__status-banner foundation-detail__status-banner--pending">
            ⏳ Tu refugio está pendiente de aprobación. No podrás publicar mascotas hasta que un administrador apruebe tu solicitud.
          </div>
        )}

        {isOwner && user?.role === 'foundation' && user.profile.status === 'rejected' && (
          <div className="foundation-detail__status-banner foundation-detail__status-banner--rejected">
            ✕ Tu solicitud de refugio fue rechazada. Contacta al administrador si crees que es un error.
          </div>
        )}

        <div className="foundation-detail__pets-header">
          <h2 className="display-md">
            {isOwner ? 'Tus publicaciones' : 'Mascotas en adopción'}
          </h2>
          {isOwner && (
            <label className="foundation-detail__filter">
              <input
                type="checkbox"
                checked={showAdopted}
                onChange={(e) => setShowAdopted(e.target.checked)}
              />
              Mostrar adoptadas
            </label>
          )}
        </div>

        {pets.length === 0 ? (
          <div className="foundations-empty">
            {isOwner
              ? 'Aún no has publicado ninguna mascota. Usa el botón "Publicar mascota" arriba.'
              : 'Este refugio aún no tiene mascotas publicadas.'}
          </div>
        ) : (
          <div className="foundation-detail__pets-grid">
            {pets.map((pet) => (
              <article key={pet.id} className={`pet-card${pet.isAdopted ? ' pet-card--adopted' : ''}`}>
                <div className="pet-card__img">
                  {pet.imageUrl ? (
                    <img
                      src={pet.imageUrl}
                      alt={`Foto de ${pet.name}`}
                      className="pet-card__photo"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="pet-card__img-bg"
                      style={{ background: `linear-gradient(140deg, ${pet.gradientFrom}, ${pet.gradientTo})` }}
                    >
                      {pet.type === 'Perro' ? <DogIllo /> : <CatIllo />}
                    </div>
                  )}
                  <span className={`pet-card__badge pet-card__badge--${pet.type === 'Perro' ? 'dog' : 'cat'}`}>
                    {pet.type}
                  </span>
                  {pet.urgent && !pet.isAdopted && <span className="pet-card__urgent">Urgente</span>}
                  {pet.isAdopted && <span className="pet-card__adopted-tag">Adoptada</span>}
                </div>

                <div className="pet-card__body">
                  <h3 className="pet-card__name">{pet.name}</h3>
                  <p className="pet-card__breed">{pet.breed}</p>
                  <div className="pet-card__meta">
                    <span className="pet-card__meta-item">⏱ {pet.age}</span>
                    <span className="pet-card__meta-item">
                      {pet.sterilized ? 'Esterilizado/a' : pet.vaccinated ? 'Vacunado/a' : '—'}
                    </span>
                  </div>

                  {isOwner ? (
                    <div className="pet-card__owner-actions">
                      <button
                        className="btn-card-secondary"
                        onClick={() => onDelete(pet)}
                        disabled={pet.isAdopted}
                      >
                        Eliminar
                      </button>
                    </div>
                  ) : (
                    <button
                      className={`btn-adopt${pendingPetIds.has(pet.id) ? ' btn-adopt--requested' : ''}`}
                      onClick={() => onAdopt(pet)}
                      disabled={adoptingId === pet.id || pet.isAdopted || pendingPetIds.has(pet.id)}
                    >
                      {pet.isAdopted
                        ? 'Adoptada'
                        : adoptingId === pet.id
                          ? 'Enviando…'
                          : pendingPetIds.has(pet.id)
                            ? '✓ Solicitud enviada'
                            : 'Quiero adoptar'}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
