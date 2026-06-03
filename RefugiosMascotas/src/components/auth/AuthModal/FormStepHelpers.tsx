import { useRef, useState } from 'react';

// ── Barra de pasos ─────────────────────────────────────────────────────────────
export function StepsBar({
  current,
  labels,
  onGoTo,
}: {
  current: number;
  labels: string[];
  onGoTo: (step: number) => void;
}) {
  return (
    <div className="form-steps" role="list" aria-label="Pasos del formulario">
      {labels.map((label, i) => {
        const n = i + 1;
        const state = n === current ? 'active' : n < current ? 'done' : 'future';
        return (
          <button
            key={n}
            type="button"
            role="listitem"
            className={`form-step form-step--${state}`}
            onClick={() => state === 'done' && onGoTo(n)}
            aria-current={state === 'active' ? 'step' : undefined}
            disabled={state === 'future'}
          >
            <span className="form-step__number">
              {state === 'done' ? '✓' : n}
            </span>
            <span className="form-step__label">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Zona de carga de archivos ──────────────────────────────────────────────────
interface FileZoneProps {
  label: string;
  hint?: string;
  accept?: string;
  multiple?: boolean;
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  error?: string;
  required?: boolean;
}

export function FileZone({
  label,
  hint,
  accept = 'image/*,.pdf',
  multiple = false,
  files,
  onChange,
  maxFiles = 1,
  error,
  required = false,
}: FileZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const merged = [...files, ...Array.from(incoming)].slice(0, maxFiles);
    onChange(merged);
  };

  const remove = (idx: number) => onChange(files.filter((_, i) => i !== idx));

  return (
    <div className="file-field">
      <span className="field__label">
        {label}
        {required && <span className="field__required" aria-hidden="true">*</span>}
      </span>
      {hint && <span className="field__msg">{hint}</span>}

      {files.length < maxFiles && (
        <div
          className={`file-zone${dragging ? ' file-zone--drag' : ''}`}
          role="button"
          tabIndex={0}
          aria-label={`Subir ${label}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple && maxFiles > 1}
            style={{ display: 'none' }}
            onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
          />
          <span className="file-zone__icon">📎</span>
          <span className="file-zone__text">Arrastra aquí o haz clic para seleccionar</span>
          <span className="file-zone__sub">
            {accept.includes('image') ? 'JPG · PNG · PDF · Máx. 5 MB' : 'PDF · Imágenes · Máx. 5 MB'}
          </span>
        </div>
      )}

      {files.length > 0 && (
        <div className="file-previews">
          {files.map((f, i) => {
            const isImg = f.type.startsWith('image/');
            const url = isImg ? URL.createObjectURL(f) : null;
            return (
              <div key={`${f.name}-${i}`} className="file-preview">
                {url
                  ? <img src={url} alt={f.name} />
                  : <div className="file-preview__doc">📄</div>
                }
                <span className="file-preview__name">{f.name}</span>
                <button
                  type="button"
                  className="file-preview__remove"
                  onClick={() => remove(i)}
                  aria-label={`Quitar ${f.name}`}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}

      {error && <span className="field__msg field__msg--error" role="alert">{error}</span>}
    </div>
  );
}

// ── Pad de firma digital ───────────────────────────────────────────────────────
interface SigPadProps {
  isSigned: boolean;
  onSign: (dataUrl: string) => void;
  onClear: () => void;
  error?: string;
}

export function SigPad({ isSigned, onSign, onClear, error }: SigPadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastXY = useRef<{ x: number; y: number } | null>(null);

  const getXY = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * sx,
        y: (e.touches[0].clientY - rect.top) * sy,
      };
    }
    return {
      x: (e.clientX - rect.left) * sx,
      y: (e.clientY - rect.top) * sy,
    };
  };

  const startDraw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    isDrawing.current = true;
    lastXY.current = getXY(e);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!isDrawing.current || !lastXY.current) return;
    e.preventDefault();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const pos = getXY(e);
    ctx.beginPath();
    ctx.moveTo(lastXY.current.x, lastXY.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#1A2205';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastXY.current = pos;
  };

  const endDraw = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    lastXY.current = null;
    onSign(canvasRef.current!.toDataURL('image/png'));
  };

  const clear = () => {
    const canvas = canvasRef.current!;
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height);
    onClear();
  };

  return (
    <div className="sig-wrap">
      <canvas
        ref={canvasRef}
        width={680}
        height={150}
        className={`sig-pad${isSigned ? ' sig-pad--signed' : ''}`}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
        aria-label="Área para dibujar tu firma"
      />
      <div className="sig-footer">
        <span className={`sig-status${isSigned ? ' sig-status--ok' : ''}`}>
          {isSigned ? '✓ Firma capturada' : 'Dibuja tu firma con el mouse o con el dedo'}
        </span>
        {isSigned && (
          <button type="button" className="sig-clear" onClick={clear}>
            Borrar y firmar de nuevo
          </button>
        )}
      </div>
      {error && <span className="field__msg field__msg--error" role="alert">{error}</span>}
    </div>
  );
}

// ── Toggle Sí / No ─────────────────────────────────────────────────────────────
export function YNToggle({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="yn-toggle" role="group">
      <button
        type="button"
        className={`yn-btn yn-btn--yes${value === true ? ' yn-btn--active' : ''}`}
        onClick={() => onChange(true)}
        aria-pressed={value === true}
      >
        Sí
      </button>
      <button
        type="button"
        className={`yn-btn yn-btn--no${value === false ? ' yn-btn--active' : ''}`}
        onClick={() => onChange(false)}
        aria-pressed={value === false}
      >
        No
      </button>
    </div>
  );
}
