import request from "supertest";
import { crearAppConDatosDePrueba } from "./helpers.js";

describe("API: reseñas y reputación de organizadores", () => {
  let app;
  let usuarios;

  beforeEach(async () => {
    ({ app, usuarios } = await crearAppConDatosDePrueba());
  });

  const comoUsuario = (usuario) => ({ "X-Usuario-Id": String(usuario.id) });
  const compraDeJuan = async (nombreEvento) =>
    (await request(app).get("/compras").set(comoUsuario(usuarios.juan))).body.find(
      (c) => c.evento.nombre === nombreEvento,
    );

  it("GET /usuarios/:id/resenias devuelve el puntaje y las reseñas del organizador", async () => {
    const res = await request(app).get(`/usuarios/${usuarios.martin.id}/resenias`);

    expect(res.status).toBe(200);
    expect(res.body.organizador).toMatchObject({ nombreCompleto: "Martín Sosa", puntaje: 3.8, cantidadResenias: 2 });
    expect(res.body.resenias.map((r) => r.evento.nombre)).toEqual([
      "La Casa de Bernarda Alba",
      "Stand-up: Edición Otoño",
    ]);
  });

  it("Juan reseña la obra que vio y cambia la reputación del organizador", async () => {
    const compra = await compraDeJuan("La Casa de Bernarda Alba");
    expect(
      (await request(app).get(`/compras/${compra.id}`).set(comoUsuario(usuarios.juan))).body.acciones,
    ).toMatchObject({ puedeReseniar: true });

    const res = await request(app)
      .post(`/compras/${compra.id}/resenia`)
      .set(comoUsuario(usuarios.juan))
      .send({ detalle: "Conmovedora, la recomiendo", puntuacion: 5 });

    expect(res.status).toBe(201);
    expect(res.body.resenia).toMatchObject({ detalle: "Conmovedora, la recomiendo", puntuacion: 5 });

    const reputacion = await request(app).get(`/usuarios/${usuarios.martin.id}/resenias`);
    expect(reputacion.body.organizador).toMatchObject({ puntaje: 4.2, cantidadResenias: 3 });

    // La reseña también aparece en los eventos del organizador antes de comprar
    const hamlet = await request(app).get("/eventos/5");
    expect(hamlet.body.reseniasOrganizador[0].detalle).toBe("Conmovedora, la recomiendo");
  });

  it("no se puede reseñar dos veces ni una compra sin usar (409)", async () => {
    const yaReseniada = await compraDeJuan("Tributo a Soda Stereo");
    const sinUsar = await compraDeJuan("Noche de Rock Nacional");

    const segunda = await request(app)
      .post(`/compras/${yaReseniada.id}/resenia`)
      .set(comoUsuario(usuarios.juan))
      .send({ detalle: "Otra", puntuacion: 3 });
    const antesDeUsar = await request(app)
      .post(`/compras/${sinUsar.id}/resenia`)
      .set(comoUsuario(usuarios.juan))
      .send({ detalle: "Todavía no fui", puntuacion: 3 });

    expect(segunda.status).toBe(409);
    expect(antesDeUsar.status).toBe(409);
  });

  it("valida la reseña: campos obligatorios (400) y puntuación de 1 a 5 (422)", async () => {
    const compra = await compraDeJuan("La Casa de Bernarda Alba");

    const sinPuntuacion = await request(app)
      .post(`/compras/${compra.id}/resenia`)
      .set(comoUsuario(usuarios.juan))
      .send({ detalle: "Buena" });
    const puntuacionInvalida = await request(app)
      .post(`/compras/${compra.id}/resenia`)
      .set(comoUsuario(usuarios.juan))
      .send({ detalle: "Buena", puntuacion: 7 });

    expect(sinPuntuacion.status).toBe(400);
    expect(puntuacionInvalida.status).toBe(422);
    expect(puntuacionInvalida.body.message).toBe("La puntuación debe ser un número entre 1 y 5");
  });

  it("GET /usuarios/:id/resenias responde 404 si el usuario no existe", async () => {
    expect((await request(app).get("/usuarios/99/resenias")).status).toBe(404);
  });
});
