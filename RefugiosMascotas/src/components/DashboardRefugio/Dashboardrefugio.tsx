import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { petsApi } from '../../api/pets';
import { extractApiError } from '../../api/client';
import { notify } from '../../services/notify.service';
import type { Pet } from '../../types';
import type { ShellContext } from '../../types/shell';
import './Dashboardrefugio.css';

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

// ─── Pet Card ─────────────────────────────────────────────────────────────────
function PetCard({ pet, onDelete }: { pet: Pet; onDelete: (id: number) => void }) {
  const statusLabel = pet.isAdopted ? 'Adoptado' : 'Disponible';
  const statusMod   = pet.isAdopted ? 'pending' : 'available';

  return (
    <article className="rd-profile-card">
      <div className="rd-card-image">
        {pet.imageUrl
          ? <img src={pet.imageUrl} alt={pet.name} loading="lazy" />
          : <div className="rd-img-placeholder">🐾</div>
        }
        <div className="rd-card-gradient" />

        <div className={`rd-card-status rd-card-status--${statusMod}`}>
          {statusLabel}
        </div>

        {pet.urgent && (
          <div className="rd-card-urgent">⚡ Urgente</div>
        )}

        <div className="rd-card-actions-overlay">
          <button className="rd-icon-btn" title="Editar" aria-label="Editar" disabled>
            <IconEdit />
          </button>
          <button
            className="rd-icon-btn rd-icon-btn--delete"
            title="Eliminar"
            aria-label="Eliminar"
            onClick={() => onDelete(pet.id)}
          >
            <IconDelete />
          </button>
        </div>

        <div className="rd-card-overlay">
          <div className="rd-tags">
            <span className="rd-tag">{pet.type}</span>
            {pet.urgent && <span className="rd-tag rd-tag--urgent">Urgente</span>}
          </div>
        </div>
      </div>

      <div className="rd-card-body">
        <div className="rd-card-header">
          <h3 className="rd-card-name">{pet.name}</h3>
          {pet.age && <span className="rd-card-age">{pet.age}</span>}
        </div>
        <p className="rd-card-species">{pet.breed || pet.type}</p>
        {pet.description && <p className="rd-card-desc">{pet.description}</p>}
        <div className="rd-card-divider" />
        <button className="rd-btn-adopt" disabled>
          Perfil de adopción <IconArrow />
        </button>
      </div>
    </article>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
const FILTERS = ['Todos', 'Disponible', 'Adoptado'] as const;
type Filter = typeof FILTERS[number];

export default function DashboardRefugio() {
  const navigate = useNavigate();
  const ctx = useOutletContext<ShellContext>();
  const { user } = useAuth();

  const foundation = user?.role === 'foundation' ? user.profile : null;

  const [pets, setPets]       = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro]   = useState<Filter>('Todos');
  const [busqueda, setBusqueda] = useState('');

  // Cargar mascotas del refugio desde la API
  const fetchPets = async () => {
    if (!foundation) return;
    setLoading(true);
    try {
      const data = await petsApi.list({ foundation_id: foundation.id, include_adopted: true, limit: 200 });
      setPets(data);
    } catch (err) {
      notify.error('Error al cargar mascotas', extractApiError(err));
    } finally {
      setLoading(false);
    }
  };

  // Recargar cuando PetForm crea una nueva mascota (bumpPets cambia petsRefreshKey)
  useEffect(() => {
    fetchPets();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.petsRefreshKey, foundation?.id]);

  const handleDelete = async (id: number) => {
    const ok = await ctx.confirm({
      title: 'Eliminar mascota',
      message: '¿Seguro que quieres eliminar esta mascota? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      tone: 'danger',
    });
    if (!ok) return;
    try {
      await petsApi.remove(id);
      setPets(p => p.filter(m => m.id !== id));
      notify.success('Mascota eliminada');
    } catch (err) {
      notify.error('No se pudo eliminar', extractApiError(err));
    }
  };

  const visibles = useMemo(() => {
    return pets
      .filter(p => {
        if (filtro === 'Disponible') return !p.isAdopted;
        if (filtro === 'Adoptado')   return  p.isAdopted;
        return true;
      })
      .filter(p => {
        const q = busqueda.toLowerCase();
        return !q || p.name.toLowerCase().includes(q) || p.type.toLowerCase().includes(q) || (p.breed ?? '').toLowerCase().includes(q);
      });
  }, [pets, filtro, busqueda]);

  const disponibles = pets.filter(p => !p.isAdopted).length;
  const adoptados   = pets.filter(p =>  p.isAdopted).length;

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
            {foundation ? (
              <div
                className="rd-avatar-ring"
                aria-hidden="true"
                style={{ background: `linear-gradient(135deg, ${foundation.gradientFrom}, ${foundation.gradientTo})` }}
              >
                {foundation.initial}
              </div>
            ) : (
              <div className="rd-avatar-ring" aria-hidden="true">🏠</div>
            )}
            <div className="rd-badge">
              {foundation?.status === 'approved' ? 'Refugio Verificado' : 'Refugio Pendiente'}
            </div>
            <h1 className="rd-title">
              {foundation ? <>{foundation.name.split(' ')[0]} <em>{foundation.name.split(' ').slice(1).join(' ')}</em></> : 'Mi Refugio'}
            </h1>
            <span className="rd-location">
              📍 {foundation?.city ?? '—'}{foundation?.state ? `, ${foundation.state}` : ''}
            </span>
          </div>

          <div className="rd-stats-bar">
            <div className="rd-stat">
              <strong>{foundation?.years ?? 0}</strong>
              <span>Años</span>
            </div>
            <div className="rd-stat">
              <strong>{adoptados}</strong>
              <span>Adoptados</span>
            </div>
            <div className="rd-stat">
              <strong>{disponibles}</strong>
              <span>Disponibles</span>
            </div>
            <div className="rd-stat">
              <strong>{pets.length}</strong>
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
              placeholder="Buscar por nombre, especie…"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              aria-label="Buscar mascota"
            />
          </div>
          <button className="rd-btn-primary" onClick={ctx.openPetForm}>
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
                ({f === 'Disponible' ? disponibles : adoptados})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Grid ─────────────────────────────────────────────────────── */}
      <main className="rd-grid">
        {loading ? (
          <div className="rd-empty">
            <div className="rd-empty-icon">🐾</div>
            <p>Cargando mascotas…</p>
          </div>
        ) : visibles.length === 0 ? (
          <div className="rd-empty">
            <div className="rd-empty-icon">🐾</div>
            <p>{busqueda ? `Sin resultados para "${busqueda}"` : '¡Aún no hay mascotas aquí!'}</p>
            <span>{busqueda ? 'Intenta con otro nombre o especie.' : 'Registra la primera con el botón de arriba.'}</span>
          </div>
        ) : (
          visibles.map(p => (
            <PetCard key={p.id} pet={p} onDelete={handleDelete} />
          ))
        )}
      </main>
    </div>
  );
}
