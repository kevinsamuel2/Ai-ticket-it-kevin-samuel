import request from "supertest";
import { crearAppConDatosDePrueba } from "./helpers.js";

// Esperando la carroza (id 5) la organiza Gonzalo. Tiene una compra de Nahuel sin pagar, una de Agustina ya pagada
// (platea, 2 entradas) y todavía nadie la reseñó.
describe("API: finalizar un evento (solo el organizador)", () => {
  const CARROZA = 5;
  let app;
  let usuarios;
  let comoUsuario;

  beforeEach(async () => {
    ({ app, usuarios, comoUsuario } = await crearAppConDatosDePrueba());
  });

  const finalizar = (usuario, eventoId = CARROZA) =>
    request(app).post(`/eventos/${eventoId}/finalizacion`).set(comoUsuario(usuario));
  const comprasDe = async (usuario) => (await request(app).get("/compras").set(comoUsuario(usuario))).body;
  const compraDeLaCarroza = async (usuario) => (await comprasDe(usuario)).find((c) => c.evento.id === CARROZA);

  it("solo el organizador puede finalizarlo: cualquier otro usuario recibe 403 y nada cambia", async () => {
    const comprador = await finalizar(usuarios.agustina);
    const otroOrganizador = await finalizar(usuarios.florencia);
    const sinSesion = await request(app).post(`/eventos/${CARROZA}/finalizacion`);

    expect(comprador.status).toBe(403);
    expect(comprador.body.message).toBe("Solo el organizador del evento puede finalizarlo");
    expect(otroOrganizador.status).toBe(403);
    expect(sinSesion.status).toBe(401);
    expect((await compraDeLaCarroza(usuarios.agustina)).estado).toBe("CONFIRMADA");
    expect((await request(app).get(`/eventos/${CARROZA}`)).body.finalizado).toBe(false);
  });

  it("el organizador lo finaliza: las compras pagas pasan a UTILIZADA y las pendientes se cancelan", async () => {
    const res = await finalizar(usuarios.gonzalo);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ comprasUtilizadas: 1, comprasCanceladas: 1 });
    expect(res.body.evento).toMatchObject({ id: CARROZA, finalizado: true, yaSeRealizo: true });

    const deAgustina = await compraDeLaCarroza(usuarios.agustina);
    const deNahuel = await compraDeLaCarroza(usuarios.nahuel);
    expect(deAgustina).toMatchObject({ estado: "UTILIZADA", puedeReseniar: true });
    expect(deNahuel).toMatchObject({ estado: "CANCELADA", puedeReseniar: false });
  });

  it("libera el cupo de las compras pendientes que se cancelan", async () => {
    const antes = (await request(app).get(`/eventos/${CARROZA}`)).body.tiposEntrada;
    await finalizar(usuarios.gonzalo);
    const despues = (await request(app).get(`/eventos/${CARROZA}`)).body.tiposEntrada;

    // La compra pendiente de Nahuel era de 1 entrada de Platea (tipo 1)
    expect(despues[0].disponibles).toBe(antes[0].disponibles + 1);
    expect(despues[1].disponibles).toBe(antes[1].disponibles);
  });

  it("después de finalizado cada comprador puede reseñar y la reseña aparece en las del organizador", async () => {
    await finalizar(usuarios.gonzalo);
    const compra = await compraDeLaCarroza(usuarios.agustina);

    const detalleAntes = await request(app).get(`/compras/${compra.id}`).set(comoUsuario(usuarios.agustina));
    const resenia = await request(app)
      .post(`/compras/${compra.id}/resenia`)
      .set(comoUsuario(usuarios.agustina))
      .send({ detalle: "La obra más divertida que vi este año", puntuacion: 5 });
    const reputacion = await request(app).get(`/usuarios/${usuarios.gonzalo.id}/resenias`);
    const detalleDelEvento = await request(app).get(`/eventos/${CARROZA}`);

    expect(detalleAntes.body.acciones.puedeReseniar).toBe(true);
    expect(resenia.status).toBe(201);
    expect(reputacion.body.resenias[0]).toMatchObject({
      evento: { id: CARROZA, nombre: "Esperando la carroza" },
      comprador: "Agustina Benítez",
      detalle: "La obra más divertida que vi este año",
      puntuacion: 5,
    });
    expect(reputacion.body.organizador.cantidadResenias).toBe(3);
    // Es de este mismo evento, así que sale primera en su detalle
    expect(detalleDelEvento.body.reseniasOrganizador[0].detalle).toBe("La obra más divertida que vi este año");
    expect((await compraDeLaCarroza(usuarios.agustina)).puedeReseniar).toBe(false);
  });

  it("un comprador no puede reseñar antes de que se finalice el evento", async () => {
    const compra = await compraDeLaCarroza(usuarios.agustina);

    const res = await request(app)
      .post(`/compras/${compra.id}/resenia`)
      .set(comoUsuario(usuarios.agustina))
      .send({ detalle: "Todavía no fui", puntuacion: 5 });

    expect(res.status).toBe(409);
  });

  it("no se puede finalizar dos veces (409) y un evento inexistente da 404", async () => {
    await finalizar(usuarios.gonzalo);

    const segunda = await finalizar(usuarios.gonzalo);
    const inexistente = await finalizar(usuarios.gonzalo, 999);

    expect(segunda.status).toBe(409);
    expect(segunda.body.message).toBe("El evento ya fue finalizado");
    expect(inexistente.status).toBe(404);
  });

  it("un evento finalizado ya no se puede comprar ni cancelar, y sale de los próximos eventos", async () => {
    await finalizar(usuarios.gonzalo);
    const compra = await compraDeLaCarroza(usuarios.agustina);

    const comprar = await request(app)
      .post("/compras")
      .set(comoUsuario(usuarios.nahuel))
      .send({ eventoId: CARROZA, tipoEntradaId: 1, cantidad: 1 });
    const cancelar = await request(app)
      .post(`/compras/${compra.id}/cambios-de-estado`)
      .set(comoUsuario(usuarios.agustina))
      .send({ estado: "CANCELADA" });
    const proximos = (await request(app).get("/eventos")).body.items.map((e) => e.id);

    expect(comprar.status).toBe(409);
    expect(cancelar.status).toBe(409);
    expect(proximos).not.toContain(CARROZA);
  });

  it("la vista de ventas del organizador refleja los nuevos estados y que el evento está finalizado", async () => {
    await finalizar(usuarios.gonzalo);

    const ventas = await request(app).get(`/eventos/${CARROZA}/compras`).set(comoUsuario(usuarios.gonzalo));

    expect(ventas.body.evento.finalizado).toBe(true);
    expect(ventas.body.cantidadPorEstado).toMatchObject({ UTILIZADA: 1, CANCELADA: 1, CONFIRMADA: 0, PENDIENTE: 0 });
  });
});
