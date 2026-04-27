import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
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
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 200);
  };

  const onPickImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError('La imagen pesa más de 5 MB. Reduce su tamaño antes de subirla.');
      return;
    }
    setError(null);
    setImageFile(file);
  };

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
              <div className="image-picker">
                <label className="image-picker__drop">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onPickImage}
                  />
                  <span className="image-picker__icon" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </span>
                  <span className="image-picker__text">
                    {imageFile ? imageFile.name : 'Click para subir una foto'}
                  </span>
                  <span className="image-picker__hint">JPG, PNG o WebP · máx 5 MB</span>
                </label>
                {imageFile && (
                  <button
                    type="button"
                    className="image-picker__clear"
                    onClick={() => setImageFile(null)}
                  >
                    Quitar
                  </button>
                )}
              </div>
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
