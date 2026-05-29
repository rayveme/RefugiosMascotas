import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { foundationsApi } from '../api/foundations';
import type { Refugio } from '../types';
import './FoundationsPage.css';

const LocationIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
);

export default function FoundationsPage() {
  const [query, setQuery] = useState('');
  const [refugios, setRefugios] = useState<Refugio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce simple para no pegarle al backend en cada tecla.
  useEffect(() => {
    let alive = true;
    const handle = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      foundationsApi
        .list({ search: query.trim() || undefined })
        .then((data) => alive && setRefugios(data))
        .catch(() => alive && setError('No pudimos cargar los refugios.'))
        .finally(() => alive && setLoading(false));
    }, 250);
    return () => {
      alive = false;
      window.clearTimeout(handle);
    };
  }, [query]);

  return (
    <section className="foundations-page">
      <div className="container">
        <header className="foundations-page__header">
          <div className="eyebrow">
            <span className="eyebrow__line" aria-hidden="true" />
            <span className="eyebrow__text">Red de refugios</span>
          </div>
          <h1 className="display-md">Encuentra un refugio</h1>
          <p className="foundations-page__subtitle">
            Busca por nombre o ciudad y entra a ver todas las mascotas que tienen disponibles.
          </p>

          <label className="foundations-search">
            <SearchIcon />
            <input
              type="search"
              placeholder="Buscar por nombre o ciudad…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </label>
        </header>

        {error && <div className="form-error-banner">{error}</div>}

        {loading ? (
          <div className="foundations-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="foundation-tile foundation-tile--skeleton" />
            ))}
          </div>
        ) : refugios.length === 0 ? (
          <div className="foundations-empty">
            {query
              ? <>No encontramos refugios con <strong>«{query}»</strong>.</>
              : <>Aún no hay refugios registrados.</>}
          </div>
        ) : (
          <div className="foundations-grid">
            {refugios.map((r) => (
              <Link key={r.id} to={`/refugios/${r.id}`} className="foundation-tile">
                <div
                  className="foundation-tile__avatar"
                  style={{ background: `linear-gradient(135deg, ${r.gradientFrom}, ${r.gradientTo})` }}
                  aria-hidden="true"
                >
                  {r.initial}
                </div>
                <h3 className="foundation-tile__name">{r.name}</h3>
                <div className="foundation-tile__location">
                  <LocationIcon />
                  {r.city}, Colombia
                </div>
                <div className="foundation-tile__stats">
                  <span><strong>{r.animals}</strong> mascotas</span>
                  <span><strong>{r.adoptions}</strong> adopciones</span>
                </div>
                <span className="foundation-tile__cta">
                  Ver mascotas
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
