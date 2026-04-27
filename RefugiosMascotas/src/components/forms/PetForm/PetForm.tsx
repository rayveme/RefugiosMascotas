import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from 'react';
import Modal from '../../ui/Modal/Modal';
import FormField from '../../ui/FormField/FormField';
import { extractApiError } from '../../../api/client';
import { petsApi } from '../../../api/pets';
import type { Pet } from '../../../types';
import type { PetTypeApi } from '../../../types/api';
import './PetForm.css';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (pet: Pet) => void;
}

const PALETTE: Array<{ from: string; to: string; label: string }> = [
  { from: '#C4813A', to: '#E8A060', label: 'Ámbar' },
  { from: '#4A7A5A', to: '#72A882', label: 'Bosque' },
  { from: '#7A5530', to: '#B07A50', label: 'Tierra' },
  { from: '#3A6080', to: '#5A88A8', label: 'Océano' },
  { from: '#6B3058', to: '#9A5080', label: 'Ciruela' },
  { from: '#2A5560', to: '#4A7888', label: 'Laguna' },
];

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const initialState = {
  name: '',
  type: 'Perro' as PetTypeApi,
  breed: '',
  age: '',
  city: '',
  urgent: false,
  vaccinated: true,
  sterilized: false,
  paletteIndex: 0,
};

export default function PetForm({ open, onClose, onCreated }: Props) {
  const [form, setForm] = useState(initialState);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearImage = () => {
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const acceptFile = (file: File): string | null => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) return 'Solo se aceptan imágenes JPG, PNG o WebP.';
    if (file.size > MAX_IMAGE_BYTES) return 'La imagen pesa más de 5 MB.';
    return null;
  };

  // Limpia la URL del preview cuando cambie o se desmonte para no leak memoria.
  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const reset = () => {
    setForm(initialState);
    setImageFile(null);
    setImagePreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 200);
  };

  const onPickImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = acceptFile(file);
    if (err) { setError(err); return; }
    setError(null);
    setImageFile(file);
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const err = acceptFile(file);
    if (err) { setError(err); return; }
    setError(null);
    setImageFile(file);
  };

  const formatBytes = (n: number) =>
    n < 1024 ? `${n} B` : n < 1024 * 1024 ? `${(n / 1024).toFixed(0)} KB` : `${(n / (1024 * 1024)).toFixed(1)} MB`;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const palette = PALETTE[form.paletteIndex];
      let pet = await petsApi.create({
        name: form.name.trim(),
        type: form.type,
        breed: form.breed.trim(),
        age: form.age.trim(),
        city: form.city.trim(),
        urgent: form.urgent,
        vaccinated: form.vaccinated,
        sterilized: form.sterilized,
        gradient_from: palette.from,
        gradient_to: palette.to,
      });

      if (imageFile) {
        try {
          pet = await petsApi.uploadImage(pet.id, imageFile);
        } catch (err) {
          // La mascota se creó pero la imagen falló: avisamos pero no bloqueamos.
          setError(
            extractApiError(err, 'La mascota se publicó pero no pudimos subir la imagen.')
              + ' Puedes intentar subirla luego desde "Mis publicaciones".',
          );
          onCreated(pet);
          return;
        }
      }

      onCreated(pet);
      handleClose();
    } catch (err) {
      setError(extractApiError(err, 'No pudimos publicar la mascota'));
    } finally {
      setSubmitting(false);
    }
  };

  const palette = PALETTE[form.paletteIndex];
  const previewBg = imagePreview
    ? { backgroundImage: `url(${imagePreview})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: `linear-gradient(140deg, ${palette.from}, ${palette.to})` };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Publicar mascota en adopción"
      subtitle="Estos datos aparecerán en la cuadrícula pública de adopciones."
      width="lg"
    >
      <form onSubmit={onSubmit} className="pet-form" noValidate>
        {error && <div className="form-error-banner">{error}</div>}

        <div className="pet-form__layout">
          <div className="form-grid">
            <div className="form-row">
              <FormField
                label="Nombre"
                name="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <FormField
                variant="select"
                label="Especie"
                name="type"
                required
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as PetTypeApi })}
              >
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
              </FormField>
            </div>

            <div className="form-row">
              <FormField
                label="Raza · tamaño"
                name="breed"
                required
                placeholder="Mestizo · Mediano"
                value={form.breed}
                onChange={(e) => setForm({ ...form, breed: e.target.value })}
              />
              <FormField
                label="Edad"
                name="age"
                required
                placeholder="3 años"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
              />
            </div>

            <FormField
              label="Ciudad"
              name="city"
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />

            <fieldset className="pet-form__chips">
              <legend>Estado</legend>
              <label className={`chip${form.vaccinated ? ' chip--on' : ''}`}>
                <input
                  type="checkbox"
                  checked={form.vaccinated}
                  onChange={(e) => setForm({ ...form, vaccinated: e.target.checked })}
                />
                Vacunado/a
              </label>
              <label className={`chip${form.sterilized ? ' chip--on' : ''}`}>
                <input
                  type="checkbox"
                  checked={form.sterilized}
                  onChange={(e) => setForm({ ...form, sterilized: e.target.checked })}
                />
                Esterilizado/a
              </label>
              <label className={`chip chip--urgent${form.urgent ? ' chip--on' : ''}`}>
                <input
                  type="checkbox"
                  checked={form.urgent}
                  onChange={(e) => setForm({ ...form, urgent: e.target.checked })}
                />
                Caso urgente
              </label>
            </fieldset>

            <fieldset className="pet-form__image">
              <legend>Foto de la mascota</legend>

              {imageFile && imagePreview ? (
                <div className="image-picker image-picker--filled">
                  <div className="image-picker__thumb">
                    <img src={imagePreview} alt="Vista previa" />
                  </div>
                  <div className="image-picker__meta">
                    <span className="image-picker__filename" title={imageFile.name}>
                      {imageFile.name}
                    </span>
                    <span className="image-picker__filesize">{formatBytes(imageFile.size)}</span>
                    <div className="image-picker__actions">
                      <button
                        type="button"
                        className="image-picker__btn image-picker__btn--ghost"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Cambiar
                      </button>
                      <button
                        type="button"
                        className="image-picker__btn image-picker__btn--danger"
                        onClick={clearImage}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                        </svg>
                        Quitar
                      </button>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={onPickImage}
                    className="image-picker__input-hidden"
                  />
                </div>
              ) : (
                <label
                  className={`image-picker image-picker--drop${dragOver ? ' image-picker--drag' : ''}`}
                  onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={onPickImage}
                    className="image-picker__input-hidden"
                  />
                  <span className="image-picker__illo" aria-hidden="true">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <rect x="3" y="3" width="18" height="18" rx="3" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </span>
                  <span className="image-picker__title">
                    Arrastra una foto aquí
                  </span>
                  <span className="image-picker__sub">
                    o <span className="image-picker__cta">selecciónala desde tu equipo</span>
                  </span>
                  <span className="image-picker__hint">JPG · PNG · WebP — máx 5 MB</span>
                </label>
              )}
            </fieldset>

            <fieldset className="pet-form__palette">
              <legend>Color de la tarjeta (si no hay foto)</legend>
              <div className="palette-grid">
                {PALETTE.map((p, i) => (
                  <button
                    type="button"
                    key={p.label}
                    className={`palette-swatch${i === form.paletteIndex ? ' palette-swatch--on' : ''}`}
                    style={{ background: `linear-gradient(140deg, ${p.from}, ${p.to})` }}
                    onClick={() => setForm({ ...form, paletteIndex: i })}
                    aria-label={`Paleta ${p.label}`}
                  />
                ))}
              </div>
            </fieldset>
          </div>

          <aside className="pet-form__preview" aria-label="Vista previa">
            <span className="pet-form__preview-label">Vista previa</span>
            <article className="pet-card pet-card--preview">
              <div className="pet-card__img">
                <div className="pet-card__img-bg" style={previewBg} />
                <span className={`pet-card__badge pet-card__badge--${form.type === 'Perro' ? 'dog' : 'cat'}`}>
                  {form.type}
                </span>
                {form.urgent && <span className="pet-card__urgent">Urgente</span>}
              </div>
              <div className="pet-card__body">
                <h3 className="pet-card__name">{form.name || 'Nombre'}</h3>
                <p className="pet-card__breed">{form.breed || 'Raza · Tamaño'}</p>
                <div className="pet-card__shelter">
                  <span className="pet-card__shelter-dot" />
                  <span className="pet-card__shelter-name">{form.city || 'Tu ciudad'}</span>
                </div>
              </div>
            </article>
          </aside>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn--ghost-dark btn--lg" onClick={handleClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--amber btn--lg" disabled={submitting}>
            {submitting
              ? imageFile ? 'Publicando + subiendo foto…' : 'Publicando…'
              : 'Publicar mascota'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
