import "./LegalPage.css";

export default function PrivacidadPage() {
  return (
    <main className="legal-page">
      <div className="legal-page__inner">
        <p className="legal-page__eyebrow">Legal</p>
        <h1 className="legal-page__title">Política de Privacidad</h1>
        <p className="legal-page__date">Última actualización: junio de 2026</p>

        <div className="legal-page__body">
          <p>
            En <strong>AdoptaMe</strong> nos tomamos muy en serio la privacidad de quienes
            usan nuestra plataforma. Esta política explica qué información recopilamos,
            cómo la usamos y qué derechos tienes sobre tus datos.
          </p>

          <h2>1. Información que recopilamos</h2>
          <h3>Datos que tú nos proporcionas</h3>
          <ul>
            <li>Nombre, correo electrónico y foto de perfil (mediante registro directo o Google OAuth).</li>
            <li>Información del refugio: dirección, teléfono, descripción, documentos de verificación.</li>
            <li>Información de la mascota: nombre, especie, edad, fotos, historial de salud.</li>
            <li>Solicitudes de adopción y mensajes enviados dentro de la plataforma.</li>
          </ul>

          <h3>Datos que recopilamos automáticamente</h3>
          <ul>
            <li>Dirección IP y tipo de navegador.</li>
            <li>Páginas visitadas y tiempo de sesión (a través de cookies técnicas).</li>
          </ul>

          <h2>2. Cómo usamos tu información</h2>
          <p>Usamos los datos exclusivamente para:</p>
          <ul>
            <li>Gestionar tu cuenta y autenticarte de forma segura.</li>
            <li>Conectar adoptantes con refugios de confianza.</li>
            <li>Enviar notificaciones relacionadas con tus solicitudes o publicaciones.</li>
            <li>Verificar la identidad y documentación de los refugios registrados.</li>
            <li>Mejorar la experiencia dentro de la plataforma.</li>
          </ul>
          <p>
            <strong>No vendemos ni compartimos tus datos con terceros con fines comerciales.</strong>
          </p>

          <h2>3. Almacenamiento y seguridad</h2>
          <p>
            Tus datos se almacenan en servidores seguros. Los archivos y documentos que subes
            (como fotos e identificaciones) se guardan en Cloudinary, un servicio de almacenamiento
            en la nube con cifrado en tránsito y en reposo. Las contraseñas nunca se almacenan
            en texto plano.
          </p>

          <h2>4. Retención de datos</h2>
          <p>
            Conservamos tu información mientras tu cuenta esté activa. Si decides eliminar tu
            cuenta, tus datos personales serán borrados en un plazo de 30 días, excepto aquellos
            que debamos conservar por obligaciones legales.
          </p>

          <h2>5. Tus derechos</h2>
          <p>Tienes derecho a:</p>
          <ul>
            <li><strong>Acceder</strong> a los datos que tenemos sobre ti.</li>
            <li><strong>Corregir</strong> información incorrecta desde tu perfil.</li>
            <li><strong>Eliminar</strong> tu cuenta y datos asociados.</li>
            <li><strong>Portabilidad</strong>: solicitar una copia de tus datos en formato legible.</li>
          </ul>
          <p>
            Para ejercer cualquiera de estos derechos, escríbenos a{" "}
            <a href="mailto:contacto@adoptame.mx">contacto@adoptame.mx</a>.
          </p>

          <h2>6. Menores de edad</h2>
          <p>
            AdoptaMe no está dirigida a personas menores de 18 años. Si detectamos que un menor
            ha proporcionado datos personales sin consentimiento parental, eliminaremos esa
            información a la brevedad.
          </p>

          <h2>7. Cambios a esta política</h2>
          <p>
            Podemos actualizar esta política ocasionalmente. Te notificaremos por correo
            electrónico o mediante un aviso en la plataforma si los cambios son significativos.
          </p>

          <h2>8. Contacto</h2>
          <p>
            Si tienes preguntas sobre esta política, contáctanos en{" "}
            <a href="mailto:contacto@adoptame.mx">contacto@adoptame.mx</a>.
          </p>
        </div>
      </div>
    </main>
  );
}
