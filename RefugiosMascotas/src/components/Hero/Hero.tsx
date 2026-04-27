import './Hero.css';

const stats = [
  { number: '24',    label: 'Refugios asociados'     },
  { number: '1,840', label: 'Mascotas disponibles'   },
  { number: '3,200+',label: 'Adopciones exitosas'    },
  { number: '12',    label: 'Ciudades con presencia'  },
];

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-headline">

      {/* Background atmosphere */}
      <div className="hero__atmosphere" aria-hidden="true">
        <div className="hero__blob hero__blob--1" />
        <div className="hero__blob hero__blob--2" />
        <div className="hero__blob hero__blob--3" />
        <div className="hero__dots" />
      </div>

      {/* Right decorative panel */}
      <div className="hero__panel" aria-hidden="true">
        <div className="hero__panel-inner">
          <svg width="360" height="360" viewBox="0 0 400 400" fill="none" opacity=".09">
            <circle cx="200" cy="265" r="105" fill="#FAF3E4" />
            <circle cx="128" cy="120"  r="48"  fill="#FAF3E4" />
            <circle cx="272" cy="120"  r="48"  fill="#FAF3E4" />
            <circle cx="72"  cy="200"  r="36"  fill="#D4783A" />
            <circle cx="328" cy="200"  r="36"  fill="#D4783A" />
            <ellipse cx="200" cy="278" rx="62" ry="52" fill="#D4783A" opacity=".6" />
          </svg>
        </div>
      </div>

      {/* Main content */}
      <div className="hero__body">
        <div className="container">

          <div className="hero__pill">
            <span className="hero__pill-dot" aria-hidden="true" />
            <span className="hero__pill-text">Red nacional de refugios</span>
          </div>

          <h1 className="hero__headline display-xl" id="hero-headline">
            Cada vida<br />merece ser<br /><em>amada</em>
          </h1>

          <p className="hero__sub">
            Conectamos refugios, voluntarios y familias para dar a cada mascota una segunda oportunidad de tener un hogar.
          </p>

          <div className="hero__actions">
            <a href="#adoptar" className="btn btn--amber btn--lg">
              Encontrar mi mascota
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <a href="#refugios" className="btn btn--ghost-light btn--lg">Ver refugios</a>
          </div>

        </div>
      </div>

      {/* Stats bar */}
      <div className="hero__stats">
        <div className="container hero__stats-grid">
          {stats.map((s) => (
            <div className="hero__stat" key={s.label}>
              <div className="hero__stat-number">{s.number}</div>
              <div className="hero__stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
