import request from "supertest";
import { crearAppConDatosDePrueba } from "./helpers.js";

describe("API: compras de un evento (vista del organizador)", () => {
  let app;
  let usuarios;
  let comoUsuario;

  // Divididos en Obras (id 1) la organiza Florencia; tiene compras de Nahuel (confirmada) y Agustina (pendiente)
  const ROCK = 1;

  beforeEach(async () => {
    ({ app, usuarios, comoUsuario } = await crearAppConDatosDePrueba());
  });

  it("GET /eventos/:id/compras muestra estados y disponibilidad por tipo de entrada", async () => {
    const res = await request(app).get(`/eventos/${ROCK}/compras`).set(comoUsuario(usuarios.florencia));

    expect(res.status).toBe(200);
    expect(res.body.evento).toMatchObject({ id: ROCK, nombre: "Divididos en Obras" });
    expect(res.body.disponibilidad.map((d) => [d.tipoEntrada.nombre, d.vendidas, d.disponibles])).toEqual([
      ["General", 2, 198],
      ["Campo VIP", 1, 29],
    ]);
    expect(res.body.cantidadPorEstado).toMatchObject({ PENDIENTE: 1, CONFIRMADA: 1 });
    expect(res.body.compras.map((c) => c.comprador.nombreCompleto).sort()).toEqual([
      "Agustina Benítez",
      "Nahuel Quiroga",
    ]);
  });

  it("la disponibilidad se actualiza al comprar y al cancelar", async () => {
    const compra = await request(app)
      .post("/compras")
      .set(comoUsuario(usuarios.nahuel))
      .send({ eventoId: ROCK, tipoEntradaId: 2, cantidad: 4 });
    const vipDisponibles = async () =>
      (await request(app).get(`/eventos/${ROCK}/compras`).set(comoUsuario(usuarios.florencia))).body.disponibilidad[1]
        .disponibles;

    expect(await vipDisponibles()).toBe(25);

    await request(app)
      .post(`/compras/${compra.body.id}/cambios-de-estado`)
      .set(comoUsuario(usuarios.nahuel))
      .send({ estado: "CANCELADA" });

    expect(await vipDisponibles()).toBe(29);
  });

  it("filtra por estado", async () => {
    const res = await request(app)
      .get(`/eventos/${ROCK}/compras`)
      .query({ estado: "PENDIENTE" })
      .set(comoUsuario(usuarios.florencia));

    expect(res.body.compras.map((c) => c.comprador.nombreCompleto)).toEqual(["Agustina Benítez"]);
  });

  it("responde 403 a quien no organiza el evento y 401 sin identificarse", async () => {
    const otroOrganizador = await request(app).get(`/eventos/${ROCK}/compras`).set(comoUsuario(usuarios.gonzalo));
    const sinUsuario = await request(app).get(`/eventos/${ROCK}/compras`);

    expect(otroOrganizador.status).toBe(403);
    expect(sinUsuario.status).toBe(401);
  });
});
