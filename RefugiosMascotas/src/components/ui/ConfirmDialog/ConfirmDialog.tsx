import { useState, useCallback, useRef, type ReactNode } from 'react';
import Modal from '../Modal/Modal';
import './ConfirmDialog.css';

interface ConfirmOptions {
  title: string;
  message?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  tone?: 'danger' | 'primary';
}

interface QueueItem extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

/**
 * Hook que devuelve `confirm(options)` — promesa que resuelve true/false.
 * Reemplaza `window.confirm()` con un modal estilizado.
 */
export function useConfirm() {
  const [current, setCurrent] = useState<QueueItem | null>(null);
  const resolverRef = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setCurrent({ ...options, resolve });
    });
  }, []);

  const handle = (answer: boolean) => {
    resolverRef.current?.(answer);
    resolverRef.current = null;
    setCurrent(null);
  };

  const dialog = current ? (
    <Modal
      open
      onClose={() => handle(false)}
      title={current.title}
      width="sm"
    >
      <div className="confirm-dialog">
        {current.message && <div className="confirm-dialog__message">{current.message}</div>}
        <div className="confirm-dialog__actions">
          <button
            type="button"
            className="btn btn--ghost-dark btn--lg"
            onClick={() => handle(false)}
          >
            {current.cancelText ?? 'Cancelar'}
          </button>
          <button
            type="button"
            className={`btn btn--lg ${current.tone === 'danger' ? 'confirm-dialog__btn--danger' : 'btn--amber'}`}
            onClick={() => handle(true)}
            autoFocus
          >
            {current.confirmText ?? 'Confirmar'}
          </button>
        </div>
      </div>
    </Modal>
  ) : null;

  return { confirm, dialog };
}
