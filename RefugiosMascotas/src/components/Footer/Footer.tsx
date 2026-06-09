import { Link } from "react-router-dom";
import "./Footer.css";
import AdoptaMe_logo from "../../assets/AdoptaMe_Logo.png";

const platformLinks = [
  { label: "Adoptar",      href: "/#adoptar" },
  { label: "Refugios",     href: "/refugios"  },
  { label: "Agendar Cita", href: "/#cita"     },
];

const shelterLinks = [
  { label: "Registrar refugio", href: "/registrar-refugio" },
  { label: "Panel de gestión",  href: "/dashboard"         },
];

const legalLinks = [
  { label: "Privacidad",     href: "#" },
  { label: "Términos de uso",href: "#" },
  { label: "Cookies",        href: "#" },
  { label: "Contacto",       href: "#" },
];

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer__top">

          {/* Marca */}
          <div className="footer__brand">
            <Link to="/" className="footer__logo" aria-label="AdoptaMe — Inicio">
              <img
                src={AdoptaMe_logo}
                alt="AdoptaMe"
                className="footer__logo-img"
              />
            </Link>
            <p className="footer__desc">
              Conectamos refugios, voluntarios y familias para que ninguna
              mascota quede sin un hogar lleno de amor.
            </p>
          </div>

          {/* Plataforma */}
          <div>
            <p className="footer__col-title">Plataforma</p>
            <ul className="footer__links">
              {platformLinks.map(({ label, href }) => (
                <li key={label}>
                  <a href={href}>{label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Refugios */}
          <div>
            <p className="footer__col-title">Refugios</p>
            <ul className="footer__links">
              {shelterLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link to={href}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="footer__col-title">Legal</p>
            <ul className="footer__links">
              {legalLinks.map(({ label, href }) => (
                <li key={label}>
                  <a href={href}>{label}</a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="footer__bottom">
          <p>© 2026 AdoptaMe. Todos los derechos reservados.</p>
          <p>Hecho con amor 🐾</p>
        </div>
      </div>
    </footer>
  );
}
