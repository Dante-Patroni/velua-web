import type { Usuario } from "@/types";

/**
 * Valor del contexto de sesión del panel. El usuario viene del contrato
 * (`Usuario`, generado desde el OpenAPI); acá solo se define la forma del contexto.
 */
export type ValorAuth = {
  usuario: Usuario;
};
