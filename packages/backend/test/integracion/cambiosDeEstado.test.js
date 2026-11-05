import { jest } from "@jest/globals";
import request from "supertest";
import { crearAppConDatosDePrueba } from "./helpers.js";

// Al simular el reloj solo se reemplaza Date: los timers reales siguen funcionando para supertest
const TODO_MENOS_DATE = [
  "hrtime",
  "nextTick",
  "performance",
  "queueMicrotask",
  "requestAnimationFrame",
  "cancelAnimationFrame",
  "requestIdleCallback",
  "cancelIdleCallback",
  "setImmediate",
  "clearImmediate",
  "setInterval",
  "clearInterval",
  "setTimeout",
  "clearTimeout",
];

describe("API: cambios de estado de una compra", () => {
  let app;
  let usuarios;
  let comoUsuario;

  // Hamlet (id 5) lo organiza Martín
  const HAMLET = 5;

  beforeEach(async () => {
    ({ app, usuarios, comoUsuario } = await crearAppConDatosDePrueba());
  });

  afterEach(() => jest.useRealTimers());

  // La entrada se valida recién el día del evento: se adelanta el reloj (solo Date) a la mañana del día de Hamlet
  const llegarAlDiaDeHamlet = async () => {
    const { fecha } = (await request(app).get(`/eventos/${HAMLET}`)).body;
    const mananaDelEvento = new Date(fecha);
    mananaDelEvento.setHours(10, 0, 0, 0);
    jest.useFakeTimers({ now: mananaDelEvento, doNotFake: TODO_MENOS_DATE });
  };

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
    await llegarAlDiaDeHamlet();
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
    await llegarAlDiaDeHamlet();
    await cambiarEstado(compra.id, usuarios.martin, "UTILIZADA");

    const res = await cambiarEstado(compra.id, usuarios.sofia, "CANCELADA");

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("No se puede cancelar una compra en estado UTILIZADA");
  });

  it("antes del día del evento no se puede marcar la entrada como utilizada y el comprador puede cancelar", async () => {
    const compra = await comprarHamlet();
    const pagada = await cambiarEstado(compra.id, usuarios.sofia, "CONFIRMADA");
    const comoOrganizador = await request(app).get(`/compras/${compra.id}`).set(comoUsuario(usuarios.martin));

    const uso = await cambiarEstado(compra.id, usuarios.martin, "UTILIZADA");
    const cancelacion = await cambiarEstado(compra.id, usuarios.sofia, "CANCELADA");

    expect(pagada.body.acciones.puedeCancelar).toBe(true);
    expect(comoOrganizador.body.acciones.puedeMarcarComoUtilizada).toBe(false);
    expect(uso.status).toBe(409);
    expect(uso.body.message).toBe("La entrada se puede marcar como utilizada recién el día del evento");
    expect(cancelacion.body.estado).toBe("REEMBOLSADA");
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
