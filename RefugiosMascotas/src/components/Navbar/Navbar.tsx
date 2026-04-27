import { useState, useEffect } from "react";
import "./Navbar.css";
// Al inicio del archivo, agrega este import:
import AdoptaMe_logo from "../../assets/AdoptaMe_Logo.png";

const PawIcon = () => (
  <svg
    width="34"
    height="34"
    viewBox="0 0 40 40"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="20" cy="25" r="10" fill="#2D5A3D" />
    <circle cx="13" cy="13" r="4.5" fill="#2D5A3D" />
    <circle cx="27" cy="13" r="4.5" fill="#2D5A3D" />
    <circle cx="8" cy="21" r="3.5" fill="#D4783A" />
    <circle cx="32" cy="21" r="3.5" fill="#D4783A" />
    <ellipse cx="20" cy="27" rx="6" ry="5" fill="#D4783A" opacity=".75" />
  </svg>
);

const navItems = [
  { href: "#refugios", label: "Refugios" },
  { href: "#adoptar", label: "Adopta" },
  { href: "#donar", label: "Dona" },
  { href: "#cita", label: "Agendar Cita" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav
      className={`navbar${scrolled ? " scrolled" : ""}`}
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className="navbar__inner">
        <a href="#" className="navbar__logo" aria-label="Huella — Inicio">
          <img
            src={AdoptaMe_logo}
            alt="AdoptaMe"
            className="navbar__logo-img"
          />
        </a>

        <ul className={`navbar__links${menuOpen ? " open" : ""}`} id="navLinks">
          {navItems.map((item) => (
            <li key={item.href}>
              <a href={item.href} onClick={closeMenu}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#donar"
          className="btn btn--amber navbar__cta"
          aria-label="Donar ahora"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          Donar
        </a>

        <button
          className="navbar__toggle"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          aria-controls="navLinks"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
}
