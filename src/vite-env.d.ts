/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base de la API, incluido el prefijo /api/v1. */
  readonly VITE_API_URL: string;
  /** Número de WhatsApp de la marca. Opcional: vacío, no se muestran los enlaces. */
  readonly VITE_WHATSAPP?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
