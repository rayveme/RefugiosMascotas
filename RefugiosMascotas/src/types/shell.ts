// Contexto que el AppShell pasa a las páginas vía Outlet.
import type { ReactNode } from 'react';

export interface ConfirmOptions {
  title: string;
  message?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  tone?: 'danger' | 'primary';
}

export interface ShellContext {
  petsRefreshKey: number;
  foundationsRefreshKey: number;
  bumpPets: () => void;
  bumpFoundations: () => void;
  openLogin: () => void;
  openRegister: () => void;
  openPetForm: () => void;
  openProfileEdit: () => void;
  /**
   * Abre el modal de completar perfil. Lo usan los flujos de adopción y cita
   * cuando el adoptante no ha completado ciudad y teléfono.
   */
  openCompleteProfile: () => void;
  /**
   * Muestra una notificación. Por defecto info; pasa `type` para success/error/warning.
   */
  showToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  /** Promesa booleana — true si el usuario confirmó. */
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}
