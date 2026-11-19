import request from "supertest";
import { crearAppConDatosDePrueba } from "./helpers.js";

describe("API: reseñas y reputación de organizadores", () => {
  let app;
  let usuarios;
  let comoUsuario;

  beforeEach(async () => {
    ({ app, usuarios, comoUsuario } = await crearAppConDatosDePrueba());
  });

  const compraDeNahuel = async (nombreEvento) =>
    (await request(app).get("/compras").set(comoUsuario(usuarios.nahuel))).body.find(
      (c) => c.evento.nombre === nombreEvento,
    );

  it("GET /usuarios/:id/resenias devuelve el puntaje y las reseñas del organizador", async () => {
    const res = await request(app).get(`/usuarios/${usuarios.gonzalo.id}/resenias`);

    expect(res.status).toBe(200);
    expect(res.body.organizador).toMatchObject({
      nombreCompleto: "Gonzalo Pereyra",
      puntaje: 3.8,
      cantidadResenias: 2,
    });
    expect(res.body.resenias.map((r) => r.evento.nombre)).toEqual(["El método Grönholm", "Stand-up en La Tangente"]);
  });

  it("Nahuel reseña la obra que vio y cambia la reputación del organizador", async () => {
    const compra = await compraDeNahuel("El método Grönholm");
    expect(
      (await request(app).get(`/compras/${compra.id}`).set(comoUsuario(usuarios.nahuel))).body.acciones,
    ).toMatchObject({ puedeReseniar: true });

    const res = await request(app)
      .post(`/compras/${compra.id}/resenia`)
      .set(comoUsuario(usuarios.nahuel))
      .send({ detalle: "Conmovedora, la recomiendo", puntuacion: 5 });

    expect(res.status).toBe(201);
    expect(res.body.resenia).toMatchObject({ detalle: "Conmovedora, la recomiendo", puntuacion: 5 });

    const reputacion = await request(app).get(`/usuarios/${usuarios.gonzalo.id}/resenias`);
    expect(reputacion.body.organizador).toMatchObject({ puntaje: 4.2, cantidadResenias: 3 });

    // La reseña también aparece en los eventos del organizador antes de comprar
    const hamlet = await request(app).get("/eventos/5");
    expect(hamlet.body.reseniasOrganizador[0].detalle).toBe("Conmovedora, la recomiendo");
  });

  it("no se puede reseñar dos veces ni una compra sin usar (409)", async () => {
    const yaReseniada = await compraDeNahuel("Ciro y Los Persas en Vorterix");
    const sinUsar = await compraDeNahuel("Divididos en Obras");

    const segunda = await request(app)
      .post(`/compras/${yaReseniada.id}/resenia`)
      .set(comoUsuario(usuarios.nahuel))
      .send({ detalle: "Otra", puntuacion: 3 });
    const antesDeUsar = await request(app)
      .post(`/compras/${sinUsar.id}/resenia`)
      .set(comoUsuario(usuarios.nahuel))
      .send({ detalle: "Todavía no fui", puntuacion: 3 });

    expect(segunda.status).toBe(409);
    expect(antesDeUsar.status).toBe(409);
  });

  it("valida la reseña: campos obligatorios (400) y puntuación de 1 a 5 (422)", async () => {
    const compra = await compraDeNahuel("El método Grönholm");

    const sinPuntuacion = await request(app)
      .post(`/compras/${compra.id}/resenia`)
      .set(comoUsuario(usuarios.nahuel))
      .send({ detalle: "Buena" });
    const puntuacionInvalida = await request(app)
      .post(`/compras/${compra.id}/resenia`)
      .set(comoUsuario(usuarios.nahuel))
      .send({ detalle: "Buena", puntuacion: 7 });

    expect(sinPuntuacion.status).toBe(400);
    expect(puntuacionInvalida.status).toBe(422);
    expect(puntuacionInvalida.body.message).toBe("La puntuación debe ser un número entre 1 y 5");
  });

  it("GET /usuarios/:id/resenias responde 404 si el usuario no existe", async () => {
    expect((await request(app).get("/usuarios/99/resenias")).status).toBe(404);
  });

  describe("reseñas en el detalle de cada evento", () => {
    // Trueno (id 19) y Nicki Nicole (id 20) son eventos pasados de Camila; Bad Bunny (id 11) es uno próximo
    const eventosDeLasReseniasDe = async (eventoId) =>
      (await request(app).get(`/eventos/${eventoId}`)).body.reseniasOrganizador.map((r) => r.evento.nombre);

    it("en un evento que ya pasó salen primero sus propias reseñas, aunque haya otras más recientes", async () => {
      expect(await eventosDeLasReseniasDe(19)).toEqual([
        "Trueno en Movistar Arena",
        "Trueno en Movistar Arena",
        "Nicki Nicole en el Luna Park",
        "Nicki Nicole en el Luna Park",
      ]);
      expect((await eventosDeLasReseniasDe(20)).slice(0, 2)).toEqual([
        "Nicki Nicole en el Luna Park",
        "Nicki Nicole en el Luna Park",
      ]);
    });

    it("en un evento próximo salen las reseñas del organizador de la más reciente a la más antigua", async () => {
      expect(await eventosDeLasReseniasDe(11)).toEqual([
        "Nicki Nicole en el Luna Park",
        "Nicki Nicole en el Luna Park",
        "Trueno en Movistar Arena",
        "Trueno en Movistar Arena",
      ]);
    });

    it("cada organizador muestra reseñas de lo que organiza, no las de otros", async () => {
      const recital = await eventosDeLasReseniasDe(11);
      const boxeo = await eventosDeLasReseniasDe(12);

      expect(boxeo).toEqual([
        "Copa Potrero: fase de grupos",
        "Copa Potrero: fase de grupos",
        "Párense de Manos III",
        "Párense de Manos III",
      ]);
      expect(recital.some((nombre) => boxeo.includes(nombre))).toBe(false);
    });
  });
});
