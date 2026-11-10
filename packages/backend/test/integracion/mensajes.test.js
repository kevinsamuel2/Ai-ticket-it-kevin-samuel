import request from "supertest";
import { crearAppConDatosDePrueba } from "./helpers.js";

describe("API: chat de una compra", () => {
  let app;
  let usuarios;
  let comoUsuario;
  let compraRock;

  beforeEach(async () => {
    ({ app, usuarios, comoUsuario } = await crearAppConDatosDePrueba());
    // La compra de Nahuel para la Noche de Rock ya tiene una pregunta y una respuesta de Florencia
    const compras = (await request(app).get("/compras").set(comoUsuario(usuarios.nahuel))).body;
    compraRock = compras.find((c) => c.evento.nombre === "Divididos en Obras");
  });

  it("GET /compras/:id/mensajes devuelve la conversación", async () => {
    const res = await request(app).get(`/compras/${compraRock.id}/mensajes`).set(comoUsuario(usuarios.nahuel));

    expect(res.status).toBe(200);
    expect(res.body.map((m) => [m.autor.rol, m.esMio])).toEqual([
      ["comprador", true],
      ["organizador", false],
    ]);
    expect(compraRock.cantidadMensajes).toBe(2);
  });

  it("comprador y organizador pueden seguir la conversación", async () => {
    const pregunta = await request(app)
      .post(`/compras/${compraRock.id}/mensajes`)
      .set(comoUsuario(usuarios.nahuel))
      .send({ mensaje: "¿Se puede entrar con mochila?" });
    const respuesta = await request(app)
      .post(`/compras/${compraRock.id}/mensajes`)
      .set(comoUsuario(usuarios.florencia))
      .send({ mensaje: "Sí, mochilas chicas" });

    expect(pregunta.status).toBe(201);
    expect(respuesta.status).toBe(201);

    const chat = await request(app).get(`/compras/${compraRock.id}/mensajes`).set(comoUsuario(usuarios.florencia));
    expect(chat.body.map((m) => m.mensaje).slice(-2)).toEqual(["¿Se puede entrar con mochila?", "Sí, mochilas chicas"]);
  });

  it("valida el mensaje (400 si falta, 422 si está vacío) y los permisos (403)", async () => {
    const sinMensaje = await request(app)
      .post(`/compras/${compraRock.id}/mensajes`)
      .set(comoUsuario(usuarios.nahuel))
      .send({});
    const vacio = await request(app)
      .post(`/compras/${compraRock.id}/mensajes`)
      .set(comoUsuario(usuarios.nahuel))
      .send({ mensaje: "  " });
    const ajeno = await request(app).get(`/compras/${compraRock.id}/mensajes`).set(comoUsuario(usuarios.agustina));

    expect(sinMensaje.status).toBe(400);
    expect(vacio.status).toBe(422);
    expect(ajeno.status).toBe(403);
  });
});
