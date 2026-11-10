import request from "supertest";
import { crearAppConDatosDePrueba } from "./helpers.js";

describe("API: favoritos", () => {
  let app;
  let usuarios;
  let comoUsuario;

  // En los datos de prueba Nahuel tiene de favoritos el Festival (id 2) y Escalandrum en Bebop Club (id 3)
  const ROCK = 1;
  const JAZZ = 3;

  beforeEach(async () => {
    ({ app, usuarios, comoUsuario } = await crearAppConDatosDePrueba());
  });

  const favoritosDe = async (usuario) =>
    (await request(app).get("/favoritos").set(comoUsuario(usuario))).body.map((e) => e.nombre);

  it("GET /favoritos lista los eventos favoritos del usuario", async () => {
    expect(await favoritosDe(usuarios.nahuel)).toEqual(["Quilmes Rock", "Escalandrum en Bebop Club"]);
    expect(await favoritosDe(usuarios.florencia)).toEqual([]);
  });

  it("PUT /favoritos/:eventoId agrega un favorito y repetirlo no lo duplica", async () => {
    const primera = await request(app).put(`/favoritos/${ROCK}`).set(comoUsuario(usuarios.nahuel));
    const segunda = await request(app).put(`/favoritos/${ROCK}`).set(comoUsuario(usuarios.nahuel));

    expect(primera.status).toBe(204);
    expect(segunda.status).toBe(204);
    expect(await favoritosDe(usuarios.nahuel)).toEqual([
      "Quilmes Rock",
      "Escalandrum en Bebop Club",
      "Divididos en Obras",
    ]);
  });

  it("DELETE /favoritos/:eventoId quita un favorito", async () => {
    const res = await request(app).delete(`/favoritos/${JAZZ}`).set(comoUsuario(usuarios.nahuel));

    expect(res.status).toBe(204);
    expect(await favoritosDe(usuarios.nahuel)).toEqual(["Quilmes Rock"]);
  });

  it("el detalle del evento indica si es favorito del usuario que lo mira", async () => {
    const comoNahuel = await request(app).get(`/eventos/${JAZZ}`).set(comoUsuario(usuarios.nahuel));
    const comoAgustina = await request(app).get(`/eventos/${JAZZ}`).set(comoUsuario(usuarios.agustina));
    const sinSesion = await request(app).get(`/eventos/${JAZZ}`);

    expect(comoNahuel.body.esFavorito).toBe(true);
    expect(comoAgustina.body.esFavorito).toBe(false);
    expect(sinSesion.body.esFavorito).toBe(false);
  });

  it("requiere sesión (401) y que el evento exista (404)", async () => {
    expect((await request(app).get("/favoritos")).status).toBe(401);
    expect((await request(app).put("/favoritos/999").set(comoUsuario(usuarios.nahuel))).status).toBe(404);
  });
});
