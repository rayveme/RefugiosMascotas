import { useRef } from 'react';
import { useReveal } from '../../hooks/useReveal';
import { pets } from '../../data/pets';
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

function PetCard({ pet }: { pet: Pet }) {
  return (
    <article className="pet-card" role="listitem">
      <div className="pet-card__img">
        <div
          className="pet-card__img-bg"
          style={{ background: `linear-gradient(140deg, ${pet.gradientFrom}, ${pet.gradientTo})` }}
        >
          {pet.type === 'Perro' ? <DogIllo /> : <CatIllo />}
        </div>
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

        <button className="btn-adopt" aria-label={`Adoptar a ${pet.name}`}>
          Quiero adoptar
        </button>
      </div>
    </article>
  );
}

const CARD_W = 272 + 22;

export default function PetCarousel() {
  const trackRef  = useRef<HTMLDivElement>(null);
  const sectionRef = useReveal<HTMLElement>();

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

  const headerRef  = useReveal<HTMLDivElement>();
  const controlRef = useReveal<HTMLDivElement>();

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
            {pets.map(pet => <PetCard key={pet.id} pet={pet} />)}
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
