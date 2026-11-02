import request from "supertest";
import { crearAppConDatosDePrueba } from "./helpers.js";

describe("API: cambios de estado de una compra", () => {
  let app;
  let usuarios;
  let comoUsuario;

  // Hamlet (id 5) lo organiza Martín
  const HAMLET = 5;

  beforeEach(async () => {
    ({ app, usuarios, comoUsuario } = await crearAppConDatosDePrueba());
  });

  const comprarHamlet = async (cantidad = 2) =>
    (
      await request(app)
        .post("/compras")
        .set(comoUsuario(usuarios.sofia))
        .send({ eventoId: HAMLET, tipoEntradaId: 1, cantidad })
    ).body;
  const cambiarEstado = (compraId, usuario, estado) =>
    request(app).post(`/compras/${compraId}/cambios-de-estado`).set(comoUsuario(usuario)).send({ estado });
  const disponiblesPlatea = async () => (await request(app).get(`/eventos/${HAMLET}`)).body.tiposEntrada[0].disponibles;

  it("flujo completo: comprar, pagar y usar la entrada en la puerta", async () => {
    const compra = await comprarHamlet();

    const pago = await cambiarEstado(compra.id, usuarios.sofia, "confirmada");
    const uso = await cambiarEstado(compra.id, usuarios.martin, "UTILIZADA");

    expect(pago.status).toBe(201);
    expect(pago.body.estado).toBe("CONFIRMADA");
    expect(uso.body.estado).toBe("UTILIZADA");
    expect(uso.body.historialEstados.map((h) => [h.estado, h.quien])).toEqual([
      ["PENDIENTE", "Sofía Ramírez"],
      ["CONFIRMADA", "Sofía Ramírez"],
      ["UTILIZADA", "Martín Sosa"],
    ]);
  });

  it("cancelar una compra pendiente la deja CANCELADA y devuelve el cupo", async () => {
    const antes = await disponiblesPlatea();
    const compra = await comprarHamlet(3);
    expect(await disponiblesPlatea()).toBe(antes - 3);

    const res = await cambiarEstado(compra.id, usuarios.sofia, "CANCELADA");

    expect(res.body.estado).toBe("CANCELADA");
    expect(await disponiblesPlatea()).toBe(antes);
  });

  it("cancelar una compra paga la deja REEMBOLSADA", async () => {
    const compra = await comprarHamlet();
    await cambiarEstado(compra.id, usuarios.sofia, "CONFIRMADA");

    const res = await cambiarEstado(compra.id, usuarios.sofia, "CANCELADA");

    expect(res.body.estado).toBe("REEMBOLSADA");
    expect(res.body.acciones.puedeCancelar).toBe(false);
  });

  it("no se puede cancelar una entrada ya utilizada (409)", async () => {
    const compra = await comprarHamlet();
    await cambiarEstado(compra.id, usuarios.sofia, "CONFIRMADA");
    await cambiarEstado(compra.id, usuarios.martin, "UTILIZADA");

    const res = await cambiarEstado(compra.id, usuarios.sofia, "CANCELADA");

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("No se puede cancelar una compra en estado UTILIZADA");
  });

  it("respeta los permisos de cada rol (403) y valida el estado pedido (400)", async () => {
    const compra = await comprarHamlet();

    const organizadorPaga = await cambiarEstado(compra.id, usuarios.martin, "CONFIRMADA");
    const otroCancela = await cambiarEstado(compra.id, usuarios.juan, "CANCELADA");
    const estadoInvalido = await cambiarEstado(compra.id, usuarios.sofia, "PAGADA");
    const sinEstado = await request(app)
      .post(`/compras/${compra.id}/cambios-de-estado`)
      .set(comoUsuario(usuarios.sofia))
      .send({});

    expect(organizadorPaga.status).toBe(403);
    expect(otroCancela.status).toBe(403);
    expect(estadoInvalido.status).toBe(400);
    expect(sinEstado.status).toBe(400);
  });
});
