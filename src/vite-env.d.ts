/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base de la API, incluido el prefijo /api/v1. */
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
