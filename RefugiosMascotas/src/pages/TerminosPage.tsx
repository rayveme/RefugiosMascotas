import "./LegalPage.css";

export default function TerminosPage() {
  return (
    <main className="legal-page">
      <div className="legal-page__inner">
        <p className="legal-page__eyebrow">Legal</p>
        <h1 className="legal-page__title">Términos de Uso</h1>
        <p className="legal-page__date">Última actualización: junio de 2026</p>

        <div className="legal-page__body">
          <p>
            Al usar <strong>AdoptaMe</strong> aceptas los siguientes términos. Si no estás
            de acuerdo con alguno de ellos, por favor no uses la plataforma.
          </p>

          <h2>1. Descripción del servicio</h2>
          <p>
            AdoptaMe es una plataforma digital que conecta a refugios de animales con personas
            interesadas en adoptar mascotas. Facilitamos el proceso de publicación, búsqueda y
            solicitud de adopción, pero <strong>no somos parte directa del proceso de adopción</strong>:
            la responsabilidad final recae en el refugio y el adoptante.
          </p>

          <h2>2. Registro y cuenta</h2>
          <ul>
            <li>Debes proporcionar información veraz al crear tu cuenta.</li>
            <li>Eres responsable de mantener la confidencialidad de tus credenciales.</li>
            <li>Una persona o refugio por cuenta. No se permite la duplicación de perfiles.</li>
            <li>Nos reservamos el derecho de suspender cuentas que infrinjan estas condiciones.</li>
          </ul>

          <h2>3. Uso aceptable</h2>
          <p>Al usar AdoptaMe te comprometes a:</p>
          <ul>
            <li>No publicar información falsa sobre animales, refugios o adoptantes.</li>
            <li>No usar la plataforma para comercializar animales (venta).</li>
            <li>No acosar, intimidar ni discriminar a otros usuarios.</li>
            <li>No intentar vulnerar la seguridad de la plataforma.</li>
            <li>Respetar el bienestar animal en todo momento.</li>
          </ul>

          <h2>4. Contenido publicado</h2>
          <p>
            Al subir fotos, descripciones u otro contenido, declaras que tienes los derechos
            necesarios para hacerlo. Nos concedes una licencia no exclusiva para mostrar
            ese contenido en la plataforma con el fin de facilitar adopciones.
          </p>
          <p>
            No nos hacemos responsables del contenido publicado por terceros. Si detectas
            contenido inapropiado, repórtalo a{" "}
            <a href="mailto:contacto@adoptame.mx">contacto@adoptame.mx</a>.
          </p>

          <h2>5. Refugios verificados</h2>
          <p>
            Los refugios registrados deben proporcionar documentación válida para obtener el
            estatus de <strong>"aprobado"</strong>. Un refugio aprobado no implica que AdoptaMe
            garantice su operación; es una validación documental básica. El proceso de
            adopción es responsabilidad exclusiva del refugio.
          </p>

          <h2>6. Limitación de responsabilidad</h2>
          <p>
            AdoptaMe se proporciona "tal cual" y no garantizamos disponibilidad continua,
            ausencia de errores ni resultados específicos. No somos responsables por daños
            derivados del uso de la plataforma o de adopciones realizadas a través de ella.
          </p>

          <h2>7. Propiedad intelectual</h2>
          <p>
            El diseño, código, logo y contenido de AdoptaMe son propiedad de sus creadores.
            No está permitida su reproducción o uso sin autorización escrita.
          </p>

          <h2>8. Modificaciones</h2>
          <p>
            Podemos actualizar estos términos en cualquier momento. El uso continuado de la
            plataforma después de un cambio implica la aceptación de los nuevos términos.
          </p>

          <h2>9. Legislación aplicable</h2>
          <p>
            Estos términos se rigen por las leyes de los Estados Unidos Mexicanos.
            Cualquier disputa se resolverá ante los tribunales competentes de México.
          </p>
        </div>
      </div>
    </main>
  );
}
