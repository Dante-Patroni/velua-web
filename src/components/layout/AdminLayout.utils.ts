import type { EnlaceAdmin } from "@/lib/mappings";
import type { RolUsuario } from "@/types";

/**
 * @description Deja los enlaces del panel que corresponden al rol. Esconder un
 * enlace es solo comodidad: el control real es el 403 de la API.
 * @param enlaces Todos los enlaces del panel.
 * @param rol Rol del usuario de la sesión.
 * @returns Los enlaces que el rol puede ver. `soloAdmin` los esconde al operador.
 */
export const enlacesParaRol = (
  enlaces: readonly EnlaceAdmin[],
  rol: RolUsuario,
): readonly EnlaceAdmin[] => enlaces.filter((enlace) => !enlace.soloAdmin || rol === "admin");
