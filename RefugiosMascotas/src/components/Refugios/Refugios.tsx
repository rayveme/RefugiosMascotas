import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useReveal } from '../../hooks/useReveal';
import { foundationsApi } from '../../api/foundations';
import { refugios as fallbackRefugios } from '../../data/refugios';
import type { Refugio } from '../../types';
import './Refugios.css';

const LocationIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

function RefugioCard({ refugio, delay = 0 }: { refugio: Refugio; delay?: number }) {
  const ref = useReveal<HTMLAnchorElement>();

  return (
    <Link
      to={`/refugios/${refugio.id}`}
      className="refugio-card reveal"
      ref={ref}
      style={{ transitionDelay: `${delay}s` }}
    >
      <div
        className="refugio-card__avatar"
        style={{ background: `linear-gradient(135deg, ${refugio.gradientFrom}, ${refugio.gradientTo})` }}
        aria-hidden="true"
      >
        {refugio.initial}
      </div>
      <h3 className="refugio-card__name">{refugio.name}</h3>
      <div className="refugio-card__location">
        <LocationIcon />
        {refugio.city}, Colombia
      </div>
      <div className="refugio-card__divider" aria-hidden="true" />
      <div className="refugio-card__stats">
        <div className="refugio-stat">
          <span className="refugio-stat__number">{refugio.animals}</span>
          <span className="refugio-stat__label">Mascotas</span>
        </div>
        <div className="refugio-stat">
          <span className="refugio-stat__number">{refugio.adoptions}</span>
          <span className="refugio-stat__label">Adopciones</span>
        </div>
        <div className="refugio-stat">
          <span className="refugio-stat__number">{refugio.years}</span>
          <span className="refugio-stat__label">Años activos</span>
        </div>
      </div>
    </Link>
  );
}

interface Props {
  refreshKey?: number;
}

export default function Refugios({ refreshKey }: Props) {
  const headerRef = useReveal<HTMLDivElement>();
  const [refugios, setRefugios] = useState<Refugio[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    foundationsApi
      .list()
      .then((data) => {
        if (!alive) return;
        if (data.length === 0) {
          setRefugios(fallbackRefugios);
          setUsingFallback(true);
        } else {
          setRefugios(data);
          setUsingFallback(false);
        }
      })
      .catch(() => {
        if (!alive) return;
        setRefugios(fallbackRefugios);
        setUsingFallback(true);
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [refreshKey]);

  return (
    <section className="section-refugios" id="refugios" aria-labelledby="refugios-title">
      <div className="r-blob r-blob--1" aria-hidden="true" />
      <div className="r-blob r-blob--2" aria-hidden="true" />

      <div className="container">
        {/* ─ única diferencia: flex row con el botón a la derecha ─ */}
        <div className="section-header refugios-header reveal" ref={headerRef} style={{ marginBottom: '60px' }}>
          <div>
            <div className="eyebrow">
              <span className="eyebrow__line" aria-hidden="true" />
              <span className="eyebrow__text" style={{ color: 'var(--amber-light)' }}>Nuestra red</span>
            </div>
            <h2 className="display-md" id="refugios-title" style={{ color: 'var(--cream)' }}>
              Refugios que<br />confían en nosotros
            </h2>
            <p className="refugios-desc">
              Organizaciones dedicadas al bienestar animal que trabajan cada día para ofrecer una vida mejor a quienes más lo necesitan.
            </p>
          </div>

          {/* ── botón nuevo ── */}
          <Link to="/registrar-refugio" className="btn-register-refugio">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Registra tu refugio
          </Link>
        </div>

        {usingFallback && !loading && (
          <p className="refugios-fallback-note">
            Mostrando red de ejemplo — todavía no hay refugios registrados o el back no está disponible.
          </p>
        )}

        <div className="refugios-grid">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="refugio-card refugio-card--skeleton" aria-hidden="true">
                  <div className="refugio-card__avatar refugio-card__avatar--skeleton" />
                  <div className="skeleton-line skeleton-line--lg" />
                  <div className="skeleton-line skeleton-line--sm" />
                </div>
              ))
            : refugios.map((r, i) => (
                <RefugioCard key={r.id} refugio={r} delay={(i % 3) * 0.1} />
              ))}
        </div>

        <div className="refugios-cta">
          <Link to="/refugios" className="btn-outline-cream">
            Ver todos los refugios
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}