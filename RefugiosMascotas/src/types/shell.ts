// Contexto que el AppShell pasa a las páginas vía Outlet.

export interface ShellContext {
  petsRefreshKey: number;
  foundationsRefreshKey: number;
  bumpPets: () => void;
  bumpFoundations: () => void;
  openLogin: () => void;
  openRegister: () => void;
  openPetForm: () => void;
  openProfileEdit: () => void;
  showToast: (msg: string) => void;
}
