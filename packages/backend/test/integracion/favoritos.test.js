import request from "supertest";
import { crearAppConDatosDePrueba } from "./helpers.js";

describe("API: favoritos", () => {
  let app;
  let usuarios;
  let comoUsuario;

  // En los datos de prueba Juan tiene de favoritos el Festival (id 2) y Jazz en el Bosque (id 3)
  const ROCK = 1;
  const JAZZ = 3;

  beforeEach(async () => {
    ({ app, usuarios, comoUsuario } = await crearAppConDatosDePrueba());
  });

  const favoritosDe = async (usuario) =>
    (await request(app).get("/favoritos").set(comoUsuario(usuario))).body.map((e) => e.nombre);

  it("GET /favoritos lista los eventos favoritos del usuario", async () => {
    expect(await favoritosDe(usuarios.juan)).toEqual(["Festival Primavera Sonora", "Jazz en el Bosque"]);
    expect(await favoritosDe(usuarios.lucia)).toEqual([]);
  });

  it("PUT /favoritos/:eventoId agrega un favorito y repetirlo no lo duplica", async () => {
    const primera = await request(app).put(`/favoritos/${ROCK}`).set(comoUsuario(usuarios.juan));
    const segunda = await request(app).put(`/favoritos/${ROCK}`).set(comoUsuario(usuarios.juan));

    expect(primera.status).toBe(204);
    expect(segunda.status).toBe(204);
    expect(await favoritosDe(usuarios.juan)).toEqual([
      "Festival Primavera Sonora",
      "Jazz en el Bosque",
      "Noche de Rock Nacional",
    ]);
  });

  it("DELETE /favoritos/:eventoId quita un favorito", async () => {
    const res = await request(app).delete(`/favoritos/${JAZZ}`).set(comoUsuario(usuarios.juan));

    expect(res.status).toBe(204);
    expect(await favoritosDe(usuarios.juan)).toEqual(["Festival Primavera Sonora"]);
  });

  it("el detalle del evento indica si es favorito del usuario que lo mira", async () => {
    const comoJuan = await request(app).get(`/eventos/${JAZZ}`).set(comoUsuario(usuarios.juan));
    const comoSofia = await request(app).get(`/eventos/${JAZZ}`).set(comoUsuario(usuarios.sofia));
    const sinSesion = await request(app).get(`/eventos/${JAZZ}`);

    expect(comoJuan.body.esFavorito).toBe(true);
    expect(comoSofia.body.esFavorito).toBe(false);
    expect(sinSesion.body.esFavorito).toBe(false);
  });

  it("requiere sesión (401) y que el evento exista (404)", async () => {
    expect((await request(app).get("/favoritos")).status).toBe(401);
    expect((await request(app).put("/favoritos/999").set(comoUsuario(usuarios.juan))).status).toBe(404);
  });
});
