import { useReveal } from '../../hooks/useReveal';
import './CitaCTA.css';

export default function CitaCTA() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section className="section-cita" id="cita" aria-labelledby="cita-title">
      <div className="container">
        <div className="cita-card reveal" ref={ref}>
          <div className="cita-card__deco" aria-hidden="true" />

          <div className="cita-card__content">
            <div className="eyebrow">
              <span className="eyebrow__line" style={{ background: 'var(--amber)' }} aria-hidden="true" />
              <span className="eyebrow__text" style={{ color: 'var(--amber-light)' }}>Visita presencial</span>
            </div>
            <h2 className="display-md cita-title" id="cita-title">
              Agenda una cita<br />en el refugio
            </h2>
            <p className="cita-desc">
              Conoce a las mascotas en persona, habla con nuestros expertos y da el primer paso hacia una amistad que durará toda la vida.
            </p>
          </div>

          <div className="cita-card__actions">
            <a href="#" className="btn btn--amber btn--lg cita-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Agendar ahora
            </a>
            <span className="cita-note">Sin costo · Sin compromiso</span>
          </div>
        </div>
      </div>
    </section>
  );
}
