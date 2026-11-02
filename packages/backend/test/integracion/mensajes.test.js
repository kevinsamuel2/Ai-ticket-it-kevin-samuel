import request from "supertest";
import { crearAppConDatosDePrueba } from "./helpers.js";

describe("API: chat de una compra", () => {
  let app;
  let usuarios;
  let compraRock;

  beforeEach(async () => {
    ({ app, usuarios } = await crearAppConDatosDePrueba());
    // La compra de Juan para la Noche de Rock ya tiene una pregunta y una respuesta de Lucía
    const compras = (await request(app).get("/compras").set(comoUsuario(usuarios.juan))).body;
    compraRock = compras.find((c) => c.evento.nombre === "Noche de Rock Nacional");
  });

  const comoUsuario = (usuario) => ({ "X-Usuario-Id": String(usuario.id) });

  it("GET /compras/:id/mensajes devuelve la conversación", async () => {
    const res = await request(app).get(`/compras/${compraRock.id}/mensajes`).set(comoUsuario(usuarios.juan));

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
      .set(comoUsuario(usuarios.juan))
      .send({ mensaje: "¿Se puede entrar con mochila?" });
    const respuesta = await request(app)
      .post(`/compras/${compraRock.id}/mensajes`)
      .set(comoUsuario(usuarios.lucia))
      .send({ mensaje: "Sí, mochilas chicas" });

    expect(pregunta.status).toBe(201);
    expect(respuesta.status).toBe(201);

    const chat = await request(app).get(`/compras/${compraRock.id}/mensajes`).set(comoUsuario(usuarios.lucia));
    expect(chat.body.map((m) => m.mensaje).slice(-2)).toEqual(["¿Se puede entrar con mochila?", "Sí, mochilas chicas"]);
  });

  it("valida el mensaje (400 si falta, 422 si está vacío) y los permisos (403)", async () => {
    const sinMensaje = await request(app)
      .post(`/compras/${compraRock.id}/mensajes`)
      .set(comoUsuario(usuarios.juan))
      .send({});
    const vacio = await request(app)
      .post(`/compras/${compraRock.id}/mensajes`)
      .set(comoUsuario(usuarios.juan))
      .send({ mensaje: "  " });
    const ajeno = await request(app).get(`/compras/${compraRock.id}/mensajes`).set(comoUsuario(usuarios.sofia));

    expect(sinMensaje.status).toBe(400);
    expect(vacio.status).toBe(422);
    expect(ajeno.status).toBe(403);
  });
});
