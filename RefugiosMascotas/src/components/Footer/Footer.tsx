import "./Footer.css";
import AdoptaMe_logo from "../../assets/AdoptaMe_Logo.png";

const platformLinks = [
  "Adoptar",
  "Refugios",
  "Agendar Cita",
  "Voluntariado",
  "Blog",
];
const shelterLinks = [
  "Unirse a la red",
  "Panel de gestión",
  "Reportes",
  "Recursos",
];
const legalLinks = ["Privacidad", "Términos de uso", "Cookies", "Contacto"];

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <a href="#" className="footer__logo" aria-label="AdoptaMe — Inicio">
              <img
                src={AdoptaMe_logo}
                alt="AdoptaMe"
                className="footer__logo-img"
              />
            </a>
            <p className="footer__desc">
              Conectamos refugios, voluntarios y familias para que ninguna
              mascota quede sin un hogar lleno de amor.
            </p>
            <div className="footer__social" aria-label="Redes sociales">
              {[
                {
                  label: "Instagram",
                  path: (
                    <>
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </>
                  ),
                },
                {
                  label: "Facebook",
                  path: (
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  ),
                },
                {
                  label: "Twitter",
                  path: (
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                  ),
                },
              ].map(({ label, path }) => (
                <a
                  key={label}
                  href="#"
                  className="social-btn"
                  aria-label={label}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    {path}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="footer__col-title">Plataforma</p>
            <ul className="footer__links">
              {platformLinks.map((l) => (
                <li key={l}>
                  <a href="#">{l}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="footer__col-title">Refugios</p>
            <ul className="footer__links">
              {shelterLinks.map((l) => (
                <li key={l}>
                  <a href="#">{l}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="footer__col-title">Legal</p>
            <ul className="footer__links">
              {legalLinks.map((l) => (
                <li key={l}>
                  <a href="#">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© 2026 Huella. Todos los derechos reservados.</p>
          <p>Hecho con amor </p>
        </div>
      </div>
    </footer>
  );
}
