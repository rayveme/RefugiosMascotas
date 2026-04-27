import { toast } from 'sonner';

/**
 * Wrapper sobre sonner. Centralizamos aquí las notificaciones para que
 * (a) los componentes no importen sonner directamente y
 * (b) podamos cambiar de librería en el futuro sin tocarlos.
 */
export const notify = {
  success(message: string, description?: string) {
    toast.success(message, { description });
  },
  error(message: string, description?: string) {
    toast.error(message, { description });
  },
  info(message: string, description?: string) {
    toast(message, { description });
  },
  warning(message: string, description?: string) {
    toast.warning(message, { description });
  },
  /** Útil para llamadas async — muestra loading y cambia a success/error según el resultado. */
  promise<T>(p: Promise<T>, msgs: { loading: string; success: string; error: string }) {
    return toast.promise(p, msgs);
  },
};
