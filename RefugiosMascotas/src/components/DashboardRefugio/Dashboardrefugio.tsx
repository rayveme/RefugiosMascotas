import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboardrefugio.css';

// ─── Types ────────────────────────────────────────────────────────────────────
type Status = 'Disponible' | 'En proceso';

interface Mascota {
  id: number;
  nombre: string;
  especie: string;
  edad: string;
  descripcion: string;
  foto: string;
  tags: string[];
  status: Status;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const MASCOTAS_INICIALES: Mascota[] = [
  {
    id: 1,
    nombre: 'Luna',
    especie: 'Perro',
    edad: '2 años',
    descripcion: 'Una compañera incansable que ama las caminatas largas y dormir a tus pies.',
    foto: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=600&h=700&auto=format&fit=crop',
    tags: ['Leal', 'Energética'],
    status: 'Disponible',
  },
  {
    id: 2,
    nombre: 'Bigotes',
    especie: 'Gato',
    edad: '4 meses',
    descripcion: 'Experto en cazar sombras y ronronear apenas siente un toque humano.',
    foto: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=600&h=700&auto=format&fit=crop',
    tags: ['Curioso', 'Tierno'],
    status: 'En proceso',
  },
  {
    id: 3,
    nombre: 'Milo',
    especie: 'Perro',
    edad: '5 años',
    descripcion: 'El alma de la fiesta. Se lleva bien con niños y otros perros.',
    foto: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=600&h=700&auto=format&fit=crop',
    tags: ['Social', 'Noble'],
    status: 'Disponible',
  },
];

const FILTERS = ['Todos', 'Disponible', 'En proceso'] as const;
type Filter = typeof FILTERS[number];

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconBack = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
);

const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
  </svg>
);

const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconDelete = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const IconArrow = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
interface ModalProps {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (m: Mascota) => void;
}

function ModalAgregar({ abierto, onCerrar, onGuardar }: ModalProps) {
  const [form, setForm] = useState({
    nombre: '', especie: '', edad: '', descripcion: '',
    foto: '', tagsStr: '', status: 'Disponible' as Status,
  });
  const [errores, setErrores] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const validar = () => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido';
    if (!form.especie)       e.especie = 'Selecciona una especie';
    setErrores(e);
    return !Object.keys(e).length;
  };

  const handleGuardar = () => {
    if (!validar()) return;
    onGuardar({
      id: Date.now(),
      nombre:      form.nombre.trim(),
      especie:     form.especie,
      edad:        form.edad.trim(),
      descripcion: form.descripcion.trim(),
      foto:        form.foto.trim(),
      tags:        form.tagsStr.split(',').map(t => t.trim()).filter(Boolean),
      status:      form.status,
    });
    setForm({ nombre: '', especie: '', edad: '', descripcion: '', foto: '', tagsStr: '', status: 'Disponible' });
    setErrores({});
    onCerrar();
  };

  if (!abierto) return null;

  const previewOk = form.foto.trim().startsWith('http');

  return (
    <div className="rd-modal-overlay" onClick={onCerrar}>
      <div className="rd-modal" onClick={e => e.stopPropagation()}>

        <div className="rd-modal__header">
          <div className="rd-modal__title-group">
            <span className="rd-modal__eyebrow">Registro</span>
            <h2 className="rd-modal__title">Nueva mascota</h2>
          </div>
          <button className="rd-modal__close" onClick={onCerrar} aria-label="Cerrar">✕</button>
        </div>

        {/* Sección 1: Identidad */}
        <div className="rd-modal-section">
          <span className="rd-modal-section-label">Identidad</span>

          <div className="rd-field">
            <label className="rd-field__label">Nombre *</label>
            <input className="rd-input" placeholder="Ej. Luna"
              value={form.nombre} onChange={e => set('nombre', e.target.value)} />
            {errores.nombre && <span className="rd-field__error">{errores.nombre}</span>}
          </div>

          <div className="rd-row2">
            <div className="rd-field">
              <label className="rd-field__label">Especie *</label>
              <select className="rd-input rd-select" value={form.especie}
                onChange={e => set('especie', e.target.value)}>
                <option value="">Seleccionar…</option>
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
                <option value="Conejo">Conejo</option>
                <option value="Ave">Ave</option>
                <option value="Reptil">Reptil</option>
                <option value="Otro">Otro</option>
              </select>
              {errores.especie && <span className="rd-field__error">{errores.especie}</span>}
            </div>

            <div className="rd-field">
              <label className="rd-field__label">Edad</label>
              <input className="rd-input" placeholder="Ej. 2 años"
                value={form.edad} onChange={e => set('edad', e.target.value)} />
            </div>
          </div>

          <div className="rd-field">
            <label className="rd-field__label">Estado</label>
            <select className="rd-input rd-select" value={form.status}
              onChange={e => set('status', e.target.value as Status)}>
              <option value="Disponible">Disponible</option>
              <option value="En proceso">En proceso</option>
            </select>
          </div>
        </div>

        {/* Sección 2: Descripción */}
        <div className="rd-modal-section">
          <span className="rd-modal-section-label">Descripción</span>

          <div className="rd-field">
            <label className="rd-field__label">Personalidad / Historia</label>
            <textarea className="rd-input rd-textarea"
              placeholder="Personalidad, cuidados especiales, historia de rescate…"
              value={form.descripcion} onChange={e => set('descripcion', e.target.value)} />
          </div>

          <div className="rd-field">
            <label className="rd-field__label">Tags (separados por coma)</label>
            <input className="rd-input" placeholder="Ej. Cariñoso, Juguetón, Vacunado"
              value={form.tagsStr} onChange={e => set('tagsStr', e.target.value)} />
          </div>
        </div>

        {/* Sección 3: Foto */}
        <div className="rd-modal-section">
          <span className="rd-modal-section-label">Foto</span>

          <div className="rd-img-preview">
            {previewOk
              ? <img src={form.foto} alt="Preview" onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
              : '🐾'
            }
          </div>

          <div className="rd-field">
            <label className="rd-field__label">URL de la imagen</label>
            <input className="rd-input" placeholder="https://..."
              value={form.foto} onChange={e => set('foto', e.target.value)} />
          </div>
        </div>

        <div className="rd-modal__actions">
          <button className="rd-btn-secondary" onClick={onCerrar}>Cancelar</button>
          <button className="rd-btn-primary" onClick={handleGuardar}>
            <IconPlus /> Agregar mascota
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Pet Card ─────────────────────────────────────────────────────────────────
function PetCard({ mascota, onDelete }: { mascota: Mascota; onDelete: (id: number) => void }) {
  return (
    <article className="rd-profile-card">
      <div className="rd-card-image">
        {mascota.foto
          ? <img src={mascota.foto} alt={mascota.nombre} loading="lazy" />
          : <div className="rd-img-placeholder">🐾</div>
        }
        <div className="rd-card-gradient" />

        <div className={`rd-card-status rd-card-status--${mascota.status === 'Disponible' ? 'available' : 'pending'}`}>
          {mascota.status}
        </div>

        <div className="rd-card-actions-overlay">
          <button className="rd-icon-btn" title="Editar" aria-label="Editar">
            <IconEdit />
          </button>
          <button className="rd-icon-btn rd-icon-btn--delete" title="Eliminar"
            aria-label="Eliminar" onClick={() => onDelete(mascota.id)}>
            <IconDelete />
          </button>
        </div>

        <div className="rd-card-overlay">
          <div className="rd-tags">
            {mascota.tags.map(tag => <span key={tag} className="rd-tag">{tag}</span>)}
          </div>
        </div>
      </div>

      <div className="rd-card-body">
        <div className="rd-card-header">
          <h3 className="rd-card-name">{mascota.nombre}</h3>
          {mascota.edad && <span className="rd-card-age">{mascota.edad}</span>}
        </div>
        <p className="rd-card-species">{mascota.especie}</p>
        {mascota.descripcion && <p className="rd-card-desc">{mascota.descripcion}</p>}
        <div className="rd-card-divider" />
        <button className="rd-btn-adopt">
          Conocer a {mascota.nombre} <IconArrow />
        </button>
      </div>
    </article>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function DashboardRefugio() {
  const navigate = useNavigate();
  const [mascotas, setMascotas]     = useState<Mascota[]>(MASCOTAS_INICIALES);
  const [modalAbierto, setModal]    = useState(false);
  const [filtro, setFiltro]         = useState<Filter>('Todos');
  const [busqueda, setBusqueda]     = useState('');

  const agregarMascota = (nueva: Mascota) => setMascotas(p => [nueva, ...p]);
  const eliminarMascota = (id: number)   => setMascotas(p => p.filter(m => m.id !== id));

  const visibles = useMemo(() => {
    return mascotas
      .filter(m => filtro === 'Todos' || m.status === filtro)
      .filter(m => {
        const q = busqueda.toLowerCase();
        return !q || m.nombre.toLowerCase().includes(q) || m.especie.toLowerCase().includes(q);
      });
  }, [mascotas, filtro, busqueda]);

  const disponibles = mascotas.filter(m => m.status === 'Disponible').length;

  return (
    <div className="rd-root">
      {/* Background mesh */}
      <div className="rd-bg" aria-hidden="true">
        <div className="rd-bg-mid" />
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="rd-hero">
        <div className="rd-hero-inner">
          <button className="rd-back-btn" onClick={() => navigate('/')} aria-label="Volver al inicio">
            <IconBack /> Volver al inicio
          </button>

          <div className="rd-shelter-info">
            <div className="rd-avatar-ring" aria-hidden="true">🏠</div>
            <div className="rd-badge">Refugio Verificado</div>
            <h1 className="rd-title">Huellitas <em>de Esperanza</em></h1>
            <span className="rd-location">📍 Ciudad de México, MX</span>
          </div>

          <div className="rd-stats-bar">
            <div className="rd-stat">
              <strong>240</strong>
              <span>Rescatados</span>
            </div>
            <div className="rd-stat">
              <strong>185</strong>
              <span>Adoptados</span>
            </div>
            <div className="rd-stat">
              <strong>{disponibles}</strong>
              <span>Disponibles</span>
            </div>
            <div className="rd-stat">
              <strong>{mascotas.length}</strong>
              <span>En refugio</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div className="rd-toolbar">
        <div className="rd-toolbar-left">
          <span className="rd-section-label">Gestión de mascotas</span>
          <h2 className="rd-section-title">Nuestros Residentes</h2>
        </div>

        <div className="rd-toolbar-right">
          <div className="rd-search-wrap">
            <IconSearch />
            <input
              className="rd-search"
              placeholder="Buscar por nombre…"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              aria-label="Buscar mascota"
            />
          </div>
          <button className="rd-btn-primary" onClick={() => setModal(true)}>
            <IconPlus /> Registrar mascota
          </button>
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────────────────── */}
      <div className="rd-filters">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`rd-filter-pill${filtro === f ? ' rd-filter-pill--active' : ''}`}
            onClick={() => setFiltro(f)}
          >
            {f}
            {f !== 'Todos' && (
              <span style={{ marginLeft: 5, opacity: 0.6 }}>
                ({mascotas.filter(m => m.status === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Grid ─────────────────────────────────────────────────────── */}
      <main className="rd-grid">
        {visibles.length === 0 ? (
          <div className="rd-empty">
            <div className="rd-empty-icon">🐾</div>
            <p>{busqueda ? `Sin resultados para "${busqueda}"` : '¡Aún no hay mascotas aquí!'}</p>
            <span>{busqueda ? 'Intenta con otro nombre o especie.' : 'Registra la primera con el botón de arriba.'}</span>
          </div>
        ) : (
          visibles.map(m => (
            <PetCard key={m.id} mascota={m} onDelete={eliminarMascota} />
          ))
        )}
      </main>

      {/* ── Modal ────────────────────────────────────────────────────── */}
      <ModalAgregar
        abierto={modalAbierto}
        onCerrar={() => setModal(false)}
        onGuardar={agregarMascota}
      />
    </div>
  );
}