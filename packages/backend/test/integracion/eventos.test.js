import request from "supertest";
import { crearAppConDatosDePrueba } from "./helpers.js";

describe("API: búsqueda y detalle de eventos", () => {
  let app;

  beforeEach(async () => {
    ({ app } = await crearAppConDatosDePrueba());
  });

  const nombres = (res) => res.body.items.map((e) => e.nombre);

  it("GET /eventos lista los próximos eventos ordenados por fecha", async () => {
    const res = await request(app).get("/eventos");

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(13);
    expect(nombres(res)[0]).toBe("Stand-up en Belushi");
  });

  it("GET /eventos?texto= busca sin distinguir mayúsculas ni tildes", async () => {
    const res = await request(app).get("/eventos").query({ texto: "ESCALANDRUM" });

    expect(nombres(res)).toEqual(["Escalandrum en Bebop Club"]);
  });

  it("GET /eventos?categoria= filtra por categoría", async () => {
    const res = await request(app).get("/eventos").query({ categoria: "Recitales" });

    expect(nombres(res)).toEqual(["Escalandrum en Bebop Club", "Divididos en Obras", "Bad Bunny en River"]);
  });

  it("GET /eventos?orden=precio ordena por la entrada más barata", async () => {
    const res = await request(app).get("/eventos").query({ orden: "precio" });

    expect(res.body.items.map((e) => e.precioMinimo)).toEqual([
      0, 8000, 9000, 12000, 15000, 16000, 25000, 30000, 45000, 50000,
    ]);
  });

  it("GET /eventos?orden=puntaje ordena por la reputación del organizador", async () => {
    const res = await request(app).get("/eventos").query({ orden: "puntaje" });
    const puntajes = res.body.items.map((e) => e.organizador.puntaje);

    expect(puntajes).toEqual([4.5, 4.5, 4.5, 4.4, 4.4, 4.4, 4, 4, 4, 4]);
  });

  it("responde 400 con parámetros de búsqueda inválidos", async () => {
    const ordenInvalido = await request(app).get("/eventos").query({ orden: "nombre" });
    const precioInvalido = await request(app).get("/eventos").query({ precioMinimo: "barato" });
    const paginaInvalida = await request(app).get("/eventos").query({ page: 0 });

    expect(ordenInvalido.status).toBe(400);
    expect(ordenInvalido.body.message).toBe("El parámetro orden debe ser uno de: fecha, precio, puntaje");
    expect(precioInvalido.status).toBe(400);
    expect(paginaInvalida.status).toBe(400);
  });

  it("GET /eventos/:id devuelve el detalle con tipos de entrada y reseñas del organizador", async () => {
    const res = await request(app).get("/eventos/1");

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe("Divididos en Obras");
    expect(res.body.tiposEntrada.map((t) => [t.nombre, t.disponibles])).toEqual([
      ["General", 198],
      ["Campo VIP", 29],
    ]);
    expect(res.body.reseniasOrganizador.map((r) => r.puntuacion).sort()).toEqual([4, 5]);
  });

  it("GET /eventos/:id responde 404 si no existe", async () => {
    const res = await request(app).get("/eventos/999");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("El evento con id 999 no existe");
  });
});
