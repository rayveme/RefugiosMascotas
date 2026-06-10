import "./LegalPage.css";

export default function CookiesPage() {
  return (
    <main className="legal-page">
      <div className="legal-page__inner">
        <p className="legal-page__eyebrow">Legal</p>
        <h1 className="legal-page__title">Política de Cookies</h1>
        <p className="legal-page__date">Última actualización: junio de 2026</p>

        <div className="legal-page__body">
          <p>
            Esta política explica cómo <strong>AdoptaMe</strong> usa cookies y tecnologías
            similares para que la plataforma funcione correctamente y para mejorar tu experiencia.
          </p>

          <h2>¿Qué es una cookie?</h2>
          <p>
            Una cookie es un pequeño archivo de texto que se guarda en tu dispositivo cuando
            visitas un sitio web. Nos permite recordar tu sesión, preferencias y otra información
            básica para que la plataforma funcione adecuadamente.
          </p>

          <h2>Tipos de cookies que usamos</h2>

          <h3>Cookies estrictamente necesarias</h3>
          <p>
            Estas cookies son indispensables para que puedas usar AdoptaMe. Sin ellas,
            servicios como el inicio de sesión no funcionarían.
          </p>
          <ul>
            <li>
              <strong>Sesión de usuario:</strong> almacena tu sesión activa para que no tengas
              que iniciar sesión en cada página.
            </li>
            <li>
              <strong>Token de autenticación:</strong> guarda tu token JWT en el almacenamiento
              local del navegador para identificar tu cuenta de forma segura.
            </li>
          </ul>

          <h3>Cookies de Google OAuth</h3>
          <p>
            Si inicias sesión con Google, Google establece sus propias cookies para gestionar
            el proceso de autenticación. Consulta la{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              política de privacidad de Google
            </a>{" "}
            para más información.
          </p>

          <h3>Cookies de rendimiento (opcionales)</h3>
          <p>
            En el futuro podríamos usar herramientas de análisis para entender cómo se usa
            la plataforma y mejorarla. Si lo hacemos, te lo comunicaremos y podrás rechazarlas.
          </p>

          <h2>Cómo controlar las cookies</h2>
          <p>
            Puedes controlar y eliminar las cookies desde la configuración de tu navegador.
            Ten en cuenta que deshabilitar ciertas cookies puede afectar el funcionamiento
            de la plataforma.
          </p>
          <ul>
            <li>
              <a
                href="https://support.google.com/chrome/answer/95647"
                target="_blank"
                rel="noopener noreferrer"
              >
                Chrome — gestionar cookies
              </a>
            </li>
            <li>
              <a
                href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies"
                target="_blank"
                rel="noopener noreferrer"
              >
                Firefox — gestionar cookies
              </a>
            </li>
            <li>
              <a
                href="https://support.apple.com/es-mx/guide/safari/sfri11471/mac"
                target="_blank"
                rel="noopener noreferrer"
              >
                Safari — gestionar cookies
              </a>
            </li>
          </ul>

          <h2>Cambios a esta política</h2>
          <p>
            Podemos actualizar esta política si cambiamos las tecnologías que usamos.
            Te notificaremos de cambios importantes a través de la plataforma.
          </p>

          <h2>Contacto</h2>
          <p>
            ¿Tienes dudas? Escríbenos a{" "}
            <a href="mailto:contacto@adoptame.mx">contacto@adoptame.mx</a>.
          </p>
        </div>
      </div>
    </main>
  );
}
