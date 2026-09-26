import type { components } from "./api.generated";

type Esquemas = components["schemas"];

// Alias de los tipos generados desde el OpenAPI. No se redefinen a mano.
export type Usuario = Esquemas["Usuario"];
export type RolUsuario = Usuario["rol"];
export type RespuestaError = Esquemas["Error"];

export type * from "./error.types";
