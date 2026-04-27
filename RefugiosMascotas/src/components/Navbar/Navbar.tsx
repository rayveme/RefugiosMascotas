import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AdoptaMe_logo from '../../assets/AdoptaMe_Logo.png';
import './Navbar.css';

interface Props {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onPublishPetClick: () => void;
  onEditProfileClick: () => void;
}

export default function Navbar({
  onLoginClick,
  onRegisterClick,
  onPublishPetClick,
  onEditProfileClick,
}: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const location = useLocation();

  const onHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!userMenuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!userMenuRef.current?.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [userMenuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const userInitial = user
    ? user.role === 'adopter'
      ? (user.profile.fullName.charAt(0) || user.profile.email.charAt(0)).toUpperCase()
      : (user.profile.initial || user.profile.name.charAt(0)).toUpperCase()
    : '';

  const userLabel = user
    ? user.role === 'adopter' ? user.profile.fullName : user.profile.name
    : '';

  return (
    <nav
      className={`navbar${scrolled ? ' scrolled' : ''}`}
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo" aria-label="AdoptaMe — Inicio">
          <img src={AdoptaMe_logo} alt="AdoptaMe" className="navbar__logo-img" />
        </Link>

        <ul className={`navbar__links${menuOpen ? ' open' : ''}`} id="navLinks">
          <li>
            <NavLink to="/refugios" onClick={closeMenu}>Refugios</NavLink>
          </li>
          <li>
            <a href={onHome ? '#adoptar' : '/#adoptar'} onClick={closeMenu}>Adopta</a>
          </li>
          <li>
            <a href={onHome ? '#donar' : '/#donar'} onClick={closeMenu}>Dona</a>
          </li>
          <li>
            <a href={onHome ? '#cita' : '/#cita'} onClick={closeMenu}>Agendar Cita</a>
          </li>
        </ul>

        <div className="navbar__actions">
          {user?.role === 'foundation' && (
            <button className="btn btn--amber navbar__cta" onClick={onPublishPetClick}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Publicar mascota
            </button>
          )}

          {!user ? (
            <>
              <button className="navbar__login" onClick={onLoginClick}>Iniciar sesión</button>
              <button className="btn btn--amber navbar__cta" onClick={onRegisterClick}>
                Crear cuenta
              </button>
            </>
          ) : (
            <div className="user-menu" ref={userMenuRef}>
              <button
                className="user-menu__trigger"
                onClick={() => setUserMenuOpen((o) => !o)}
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
              >
                <span className="user-menu__avatar">{userInitial}</span>
                <span className="user-menu__name">{userLabel}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {userMenuOpen && (
                <div className="user-menu__dropdown" role="menu">
                  <div className="user-menu__header">
                    <strong>{userLabel}</strong>
                    <span>{user.role === 'adopter' ? 'Adoptante' : 'Refugio'}</span>
                  </div>

                  {!user.profile.profileComplete && (
                    <button
                      className="user-menu__warning"
                      onClick={() => { setUserMenuOpen(false); onEditProfileClick(); }}
                    >
                      Completa tu perfil
                    </button>
                  )}

                  <button
                    className="user-menu__item"
                    onClick={() => { setUserMenuOpen(false); onEditProfileClick(); }}
                  >
                    Mi perfil
                  </button>

                  {user.role === 'foundation' && (
                    <>
                      <Link
                        to={`/refugios/${user.profile.id}`}
                        className="user-menu__item user-menu__item--link"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Mis publicaciones
                      </Link>
                      <button
                        className="user-menu__item"
                        onClick={() => { setUserMenuOpen(false); onPublishPetClick(); }}
                      >
                        Publicar mascota
                      </button>
                    </>
                  )}

                  <button
                    className="user-menu__item user-menu__item--danger"
                    onClick={() => { logout(); setUserMenuOpen(false); }}
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          className="navbar__toggle"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
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
