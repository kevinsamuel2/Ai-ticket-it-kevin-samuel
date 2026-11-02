import { Categoria } from "../../domain/Categoria.js";

describe("Dominio: Categoria", () => {
  it("crea una categoría con nombre y descripción", () => {
    const categoria = new Categoria({ nombre: " Recitales ", descripcion: "Música en vivo" });

    expect(categoria.nombre).toBe("Recitales");
    expect(categoria.descripcion).toBe("Música en vivo");
  });

  it("la descripción es opcional", () => {
    expect(new Categoria({ nombre: "Teatro" }).descripcion).toBe("");
  });

  it("error si falta el nombre", () => {
    expect(() => new Categoria({ descripcion: "Sin nombre" })).toThrow("La categoría debe tener un nombre");
  });

  it("dos categorías son la misma si coinciden en el nombre sin importar mayúsculas", () => {
    const teatro = new Categoria({ nombre: "Teatro" });

    expect(teatro.esLaMismaQue(new Categoria({ nombre: "TEATRO" }))).toBe(true);
    expect(teatro.esLaMismaQue(new Categoria({ nombre: "Deportes" }))).toBe(false);
    expect(teatro.esLaMismaQue(null)).toBe(false);
  });
});
