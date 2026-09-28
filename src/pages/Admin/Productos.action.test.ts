import { describe, expect, it } from "vitest";

import { leerFiltros, LIMITE } from "@/pages/Admin/Productos.action";

/**
 * Atajo para leer filtros a partir de una cadena de consulta.
 */
const filtros = (consulta: string) => leerFiltros(new URLSearchParams(consulta));

describe("leerFiltros", () => {
  it("sin parámetros devuelve la primera página", () => {
    expect(filtros("")).toEqual({
      pagina: 1,
      limite: LIMITE,
      q: undefined,
      categoriaId: undefined,
      estado: undefined,
      orden: undefined,
    });
  });

  it("lee la página y la categoría como números", () => {
    const f = filtros("pagina=3&categoriaId=7");

    expect(f.pagina).toBe(3);
    expect(f.categoriaId).toBe(7);
  });

  it("recorta la búsqueda y descarta la que queda vacía", () => {
    expect(filtros("q=  jabon  ").q).toBe("jabon");
    expect(filtros("q=   ").q).toBeUndefined();
  });

  it("acepta los estados del contrato", () => {
    expect(filtros("estado=activos").estado).toBe("activos");
    expect(filtros("estado=inactivos").estado).toBe("inactivos");
    expect(filtros("estado=todos").estado).toBe("todos");
  });

  it("descarta un estado que no existe", () => {
    // Si se enviara tal cual, la API responderia 400 y la pantalla quedaria rota
    expect(filtros("estado=cualquiera").estado).toBeUndefined();
  });

  it("descarta un orden que no existe", () => {
    expect(filtros("orden=precio").orden).toBeUndefined();
    expect(filtros("orden=stock").orden).toBe("stock");
  });

  it("vuelve a la primera página si el número no sirve", () => {
    expect(filtros("pagina=0").pagina).toBe(1);
    expect(filtros("pagina=-4").pagina).toBe(1);
    expect(filtros("pagina=abc").pagina).toBe(1);
    expect(filtros("pagina=2.5").pagina).toBe(1);
  });

  it("descarta una categoría que no es un id válido", () => {
    expect(filtros("categoriaId=abc").categoriaId).toBeUndefined();
    expect(filtros("categoriaId=0").categoriaId).toBeUndefined();
    expect(filtros("categoriaId=-1").categoriaId).toBeUndefined();
  });

  it("siempre pide el mismo límite, venga lo que venga en la URL", () => {
    // El limite no es del usuario: la API lo topea en 50 y la pagina usa uno fijo
    expect(filtros("limite=999").limite).toBe(LIMITE);
  });
});
