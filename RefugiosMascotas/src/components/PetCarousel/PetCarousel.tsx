import { useEffect, useRef, useState } from 'react';
import { useReveal } from '../../hooks/useReveal';
import { useAuth } from '../../hooks/useAuth';
import { petsApi } from '../../api/pets';
import { adoptionsApi } from '../../api/adoptions';
import { extractApiError } from '../../api/client';
import { pets as fallbackPets } from '../../data/pets';
import type { Pet } from '../../types';
import './PetCarousel.css';

const DogIllo = () => (
  <svg width="110" height="110" viewBox="0 0 120 120" fill="none" aria-hidden="true">
    <circle cx="60" cy="75" r="34" fill="rgba(255,255,255,.14)" />
    <circle cx="42" cy="40" r="16" fill="rgba(255,255,255,.14)" />
    <circle cx="78" cy="40" r="16" fill="rgba(255,255,255,.14)" />
    <ellipse cx="60" cy="78" rx="22" ry="18" fill="rgba(255,255,255,.2)" />
    <circle cx="52" cy="70" r="5"   fill="rgba(255,255,255,.55)" />
    <circle cx="68" cy="70" r="5"   fill="rgba(255,255,255,.55)" />
    <circle cx="60" cy="82" r="3.5" fill="rgba(255,255,255,.4)"  />
  </svg>
);

const CatIllo = () => (
  <svg width="110" height="110" viewBox="0 0 120 120" fill="none" aria-hidden="true">
    <ellipse cx="60" cy="80" rx="28" ry="24" fill="rgba(255,255,255,.14)" />
    <circle cx="60" cy="52"  r="22" fill="rgba(255,255,255,.14)" />
    <polygon points="40,36 33,20 50,32" fill="rgba(255,255,255,.2)"  />
    <polygon points="80,36 87,20 70,32" fill="rgba(255,255,255,.2)"  />
    <ellipse cx="52" cy="52" rx="5"  ry="6"  fill="rgba(255,255,255,.55)" />
    <ellipse cx="68" cy="52" rx="5"  ry="6"  fill="rgba(255,255,255,.55)" />
    <ellipse cx="60" cy="62" rx="3"  ry="2"  fill="rgba(255,255,255,.4)"  />
  </svg>
);

interface PetCardProps {
  pet: Pet;
  onAdopt: (pet: Pet) => void;
  adopting: boolean;
  disabled?: boolean;
  alreadyRequested?: boolean;
}

function PetCard({ pet, onAdopt, adopting, disabled, alreadyRequested }: PetCardProps) {
  return (
    <article className="pet-card" role="listitem">
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
        {pet.urgent && <span className="pet-card__urgent">Urgente</span>}
      </div>

      <div className="pet-card__body">
        <h3 className="pet-card__name">{pet.name}</h3>
        <p className="pet-card__breed">{pet.breed}</p>

        <div className="pet-card__meta">
          <span className="pet-card__meta-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {pet.age}
          </span>
          <span className="pet-card__meta-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {pet.sterilized ? 'Esterilizado/a' : 'Vacunado/a'}
          </span>
        </div>

        <div className="pet-card__shelter">
          <span className="pet-card__shelter-dot" />
          <span className="pet-card__shelter-name">{pet.shelter} · {pet.city}</span>
        </div>

        <button
          className={`btn-adopt${alreadyRequested ? ' btn-adopt--requested' : ''}`}
          onClick={() => onAdopt(pet)}
          disabled={adopting || disabled || alreadyRequested}
          aria-label={`Adoptar a ${pet.name}`}
          title={
            disabled
              ? 'Mascota de muestra — registra mascotas reales para adoptar'
              : alreadyRequested
                ? 'Ya tienes una solicitud pendiente para esta mascota'
                : undefined
          }
        >
          {adopting
            ? 'Enviando…'
            : disabled
              ? 'Demo'
              : alreadyRequested
                ? '✓ Solicitud enviada'
                : 'Quiero adoptar'}
        </button>
      </div>
    </article>
  );
}

const CARD_W = 272 + 22;

interface Props {
  onRequireAuth: () => void;
  onRequireProfile: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  refreshKey?: number;
}

export default function PetCarousel({ onRequireAuth, onRequireProfile, refreshKey }: Props) {
  const trackRef  = useRef<HTMLDivElement>(null);
  const sectionRef = useReveal<HTMLElement>();
  const headerRef  = useReveal<HTMLDivElement>();
  const controlRef = useReveal<HTMLDivElement>();

  const { user } = useAuth();

  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [adoptingId, setAdoptingId] = useState<number | null>(null);
  const [pendingPetIds, setPendingPetIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    let alive = true;
    setLoading(true);
    petsApi
      .list()
      .then((data) => {
        if (!alive) return;
        if (data.length === 0) {
          setPets(fallbackPets);
          setUsingFallback(true);
        } else {
          setPets(data);
          setUsingFallback(false);
        }
      })
      .catch(() => {
        if (!alive) return;
        setPets(fallbackPets);
        setUsingFallback(true);
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [refreshKey]);

  // Si el adopter está logueado, traemos las pendientes para marcar las cards.
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
      .catch(() => { /* silencioso — no es crítico */ });
    return () => { alive = false; };
  }, [user?.role, user?.profile.id, refreshKey]);

  const onAdopt = async (pet: Pet) => {
    if (!user) { onRequireAuth(); return; }
    if (user.role !== 'adopter') {
      onRequireProfile('Esta acción es solo para usuarios adoptantes.', 'warning');
      return;
    }
    if (!user.profile.profileComplete) {
      onRequireProfile('Completa ciudad y teléfono en tu perfil para poder adoptar.', 'warning');
      return;
    }
    setAdoptingId(pet.id);
    try {
      await adoptionsApi.request(pet.id);
      setPendingPetIds((cur) => new Set(cur).add(pet.id));
      onRequireProfile(
        `Solicitud enviada para ${pet.name}. La fundación la revisará pronto.`,
        'success',
      );
    } catch (err) {
      onRequireProfile(extractApiError(err, 'No pudimos enviar la solicitud.'), 'error');
    } finally {
      setAdoptingId(null);
    }
  };

  const isDragging = useRef(false);
  const startX     = useRef(0);
  const scrollL    = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    trackRef.current?.classList.add('grabbing');
    startX.current  = e.pageX - (trackRef.current?.offsetLeft ?? 0);
    scrollL.current = trackRef.current?.scrollLeft ?? 0;
  };

  const onMouseUp = () => {
    isDragging.current = false;
    trackRef.current?.classList.remove('grabbing');
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    trackRef.current.scrollLeft = scrollL.current - (x - startX.current) * 1.4;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current  = e.touches[0].pageX;
    scrollL.current = trackRef.current?.scrollLeft ?? 0;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!trackRef.current) return;
    trackRef.current.scrollLeft = scrollL.current + (startX.current - e.touches[0].pageX) * 1.2;
  };

  const scroll = (dir: 1 | -1) => {
    trackRef.current?.scrollBy({ left: dir * CARD_W * 2, behavior: 'smooth' });
  };

  return (
    <section className="section-adopt" id="adoptar" ref={sectionRef} aria-labelledby="adopt-title">
      <div className="container">

        <div className="section-header reveal" ref={headerRef}>
          <div>
            <div className="eyebrow">
              <span className="eyebrow__line" aria-hidden="true" />
              <span className="eyebrow__text">Adopciones disponibles</span>
            </div>
            <h2 className="display-md" id="adopt-title">
              Mascotas esperando<br />un hogar
            </h2>
          </div>
          <a href="#" className="btn btn--ghost-dark">Ver todos</a>
        </div>

        {usingFallback && !loading && (
          <p className="pet-fallback-note">
            Mostrando mascotas de ejemplo — el back no está disponible o aún no hay registros.
          </p>
        )}

        <div className="carousel-wrap">
          <div
            className="carousel-track"
            ref={trackRef}
            role="list"
            aria-label="Mascotas disponibles"
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onMouseMove={onMouseMove}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
          >
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="pet-card pet-card--skeleton" aria-hidden="true">
                    <div className="pet-card__img skeleton-bg" />
                    <div className="pet-card__body">
                      <div className="skeleton-line skeleton-line--lg" />
                      <div className="skeleton-line skeleton-line--md" />
                      <div className="skeleton-line skeleton-line--sm" />
                    </div>
                  </div>
                ))
              : pets.map((pet) => (
                  <PetCard
                    key={pet.id}
                    pet={pet}
                    onAdopt={onAdopt}
                    adopting={adoptingId === pet.id}
                    disabled={usingFallback}
                    alreadyRequested={pendingPetIds.has(pet.id)}
                  />
                ))}
          </div>
        </div>

        <div className="carousel-controls reveal" ref={controlRef}>
          <button className="carousel-btn" aria-label="Tarjetas anteriores" onClick={() => scroll(-1)}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button className="carousel-btn" aria-label="Tarjetas siguientes" onClick={() => scroll(1)}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          <span className="carousel-hint" aria-hidden="true">Arrastra para explorar más</span>
        </div>

      </div>
    </section>
  );
}
