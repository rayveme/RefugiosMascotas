import "./LegalPage.css";

export default function ContactoPage() {
  return (
    <main className="legal-page">
      <div className="legal-page__inner">
        <p className="legal-page__eyebrow">Comunícate con nosotros</p>
        <h1 className="legal-page__title">Contacto</h1>
        <p className="legal-page__date">Respondemos en un plazo de 1–3 días hábiles</p>

        <div className="legal-page__body">
          <p>
            ¿Tienes alguna duda, sugerencia o necesitas reportar un problema?
            Estamos aquí para ayudarte. Elige el canal que mejor se adapte a tu necesidad.
          </p>

          <div className="contact-grid">
            <div className="contact-card">
              <span className="contact-card__label">Correo general</span>
              <span className="contact-card__value">
                <a href="mailto:contacto@adoptame.mx">contacto@adoptame.mx</a>
              </span>
            </div>
            <div className="contact-card">
              <span className="contact-card__label">Soporte técnico</span>
              <span className="contact-card__value">
                <a href="mailto:soporte@adoptame.mx">soporte@adoptame.mx</a>
              </span>
            </div>
            <div className="contact-card">
              <span className="contact-card__label">Refugios y verificación</span>
              <span className="contact-card__value">
                <a href="mailto:refugios@adoptame.mx">refugios@adoptame.mx</a>
              </span>
            </div>
            <div className="contact-card">
              <span className="contact-card__label">Reportar contenido</span>
              <span className="contact-card__value">
                <a href="mailto:reportes@adoptame.mx">reportes@adoptame.mx</a>
              </span>
            </div>
          </div>

          <hr className="legal-page__divider" />

          <h2>Preguntas frecuentes</h2>

          <h3>¿Cómo registro mi refugio?</h3>
          <p>
            Dirígete a <a href="/registrar-refugio">Registrar refugio</a> y completa el
            formulario de alta. Una vez enviados tus documentos, nuestro equipo revisará
            tu solicitud y recibirás una respuesta por correo en 1–3 días hábiles.
          </p>

          <h3>¿Cuánto cuesta usar AdoptaMe?</h3>
          <p>
            AdoptaMe es completamente gratuito para adoptantes y refugios. No cobramos
            comisiones ni tarifas de ningún tipo.
          </p>

          <h3>¿Qué hago si encuentro un animal en situación de calle?</h3>
          <p>
            Consulta los refugios registrados en nuestra sección de{" "}
            <a href="/refugios">Refugios</a>. Muchos cuentan con programas de rescate y
            podrán orientarte sobre los pasos a seguir.
          </p>

          <h3>¿Cómo elimino mi cuenta?</h3>
          <p>
            Por el momento, la eliminación de cuentas se gestiona de forma manual.
            Envíanos un correo a{" "}
            <a href="mailto:contacto@adoptame.mx">contacto@adoptame.mx</a> con el asunto
            "Eliminar cuenta" y procesaremos tu solicitud en 5 días hábiles.
          </p>

          <h3>Tengo un problema técnico, ¿qué hago?</h3>
          <p>
            Describe el problema con el mayor detalle posible (qué estabas haciendo,
            qué error apareció, en qué dispositivo) y envíalo a{" "}
            <a href="mailto:soporte@adoptame.mx">soporte@adoptame.mx</a>.
          </p>
        </div>
      </div>
    </main>
  );
}
