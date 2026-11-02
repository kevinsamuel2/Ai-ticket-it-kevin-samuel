import { RepositorioEnMemoria } from "../../repository/RepositorioEnMemoria.js";

describe("RepositorioEnMemoria", () => {
  let repositorio;

  beforeEach(() => {
    repositorio = new RepositorioEnMemoria();
  });

  it("guardar asigna ids incrementales a las entidades nuevas", async () => {
    const a = await repositorio.guardar({ nombre: "A" });
    const b = await repositorio.guardar({ nombre: "B" });

    expect([a.id, b.id]).toEqual([1, 2]);
  });

  it("guardar una entidad con id la reemplaza sin crear otra", async () => {
    const entidad = await repositorio.guardar({ nombre: "A" });
    entidad.nombre = "A modificada";

    await repositorio.guardar(entidad);

    expect(await repositorio.buscarTodos()).toEqual([{ id: 1, nombre: "A modificada" }]);
  });

  it("buscarPorId acepta el id como número o texto y devuelve null si no existe", async () => {
    const entidad = await repositorio.guardar({ nombre: "A" });

    expect(await repositorio.buscarPorId(1)).toBe(entidad);
    expect(await repositorio.buscarPorId("1")).toBe(entidad);
    expect(await repositorio.buscarPorId(99)).toBeNull();
  });

  it("eliminar borra la entidad e indica si existía", async () => {
    await repositorio.guardar({ nombre: "A" });

    expect(await repositorio.eliminar(1)).toBe(true);
    expect(await repositorio.eliminar(1)).toBe(false);
    expect(await repositorio.buscarTodos()).toEqual([]);
  });

  it("buscarDonde filtra con una condición", async () => {
    await repositorio.guardar({ nombre: "A", activo: true });
    await repositorio.guardar({ nombre: "B", activo: false });

    expect((await repositorio.buscarDonde((e) => e.activo)).map((e) => e.nombre)).toEqual(["A"]);
  });
});
