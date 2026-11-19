import request from "supertest";
import { crearAppConDatosDePrueba } from "./helpers.js";

describe("API: organizadores seguidos", () => {
  let app;
  let usuarios;
  let comoUsuario;

  // En los datos de prueba Nahuel sigue a Florencia y a Camila, Agustina a Gonzalo y Gonzalo a Ramiro
  beforeEach(async () => {
    ({ app, usuarios, comoUsuario } = await crearAppConDatosDePrueba());
  });

  const seguidosPor = async (usuario) =>
    (await request(app).get("/seguidos").set(comoUsuario(usuario))).body.map((o) => o.nombreCompleto);

  it("GET /seguidos lista los organizadores que sigue el usuario con su reputación y sus seguidores", async () => {
    const res = await request(app).get("/seguidos").set(comoUsuario(usuarios.nahuel));

    expect(res.status).toBe(200);
    expect(res.body.map((o) => o.nombreCompleto)).toEqual(["Florencia Acosta", "Camila Ferreyra"]);
    expect(res.body[0]).toMatchObject({ id: usuarios.florencia.id, seguidores: 1, loSigo: true });
    expect(res.body[0].puntaje).toBe(4.5);
    expect(await seguidosPor(usuarios.florencia)).toEqual([]);
  });

  it("PUT /seguidos/:organizadorId lo sigue y repetirlo no lo duplica", async () => {
    const url = `/seguidos/${usuarios.ramiro.id}`;

    const primera = await request(app).put(url).set(comoUsuario(usuarios.nahuel));
    const segunda = await request(app).put(url).set(comoUsuario(usuarios.nahuel));

    expect(primera.status).toBe(204);
    expect(segunda.status).toBe(204);
    expect(await seguidosPor(usuarios.nahuel)).toEqual(["Florencia Acosta", "Camila Ferreyra", "Ramiro Domínguez"]);
  });

  it("DELETE /seguidos/:organizadorId deja de seguirlo", async () => {
    const res = await request(app).delete(`/seguidos/${usuarios.florencia.id}`).set(comoUsuario(usuarios.nahuel));

    expect(res.status).toBe(204);
    expect(await seguidosPor(usuarios.nahuel)).toEqual(["Camila Ferreyra"]);
  });

  it("el detalle del evento indica cuántos siguen al organizador y si lo sigue quien lo mira", async () => {
    // El evento 1 (Divididos en Obras) lo organiza Florencia, a quien sigue Nahuel
    const comoNahuel = await request(app).get("/eventos/1").set(comoUsuario(usuarios.nahuel));
    const comoAgustina = await request(app).get("/eventos/1").set(comoUsuario(usuarios.agustina));
    const sinSesion = await request(app).get("/eventos/1");

    expect(comoNahuel.body.organizador).toMatchObject({ seguidores: 1, loSigo: true });
    expect(comoAgustina.body.organizador).toMatchObject({ seguidores: 1, loSigo: false });
    expect(sinSesion.body.organizador).toMatchObject({ seguidores: 1, loSigo: false });
  });

  it("seguir cambia el contador de seguidores", async () => {
    await request(app).put(`/seguidos/${usuarios.florencia.id}`).set(comoUsuario(usuarios.agustina));

    const res = await request(app).get("/eventos/1").set(comoUsuario(usuarios.agustina));

    expect(res.body.organizador).toMatchObject({ seguidores: 2, loSigo: true });
  });

  it("GET /usuarios/:usuarioId/resenias también informa los seguidores del organizador", async () => {
    const res = await request(app).get(`/usuarios/${usuarios.florencia.id}/resenias`).set(comoUsuario(usuarios.nahuel));

    expect(res.body.organizador).toMatchObject({ nombreCompleto: "Florencia Acosta", seguidores: 1, loSigo: true });
  });

  it("nadie puede seguirse a sí mismo (422)", async () => {
    const res = await request(app).put(`/seguidos/${usuarios.nahuel.id}`).set(comoUsuario(usuarios.nahuel));

    expect(res.status).toBe(422);
    expect(res.body.message).toBe("No podés seguirte a vos mismo");
  });

  it("requiere sesión (401) y que el organizador exista (404)", async () => {
    expect((await request(app).get("/seguidos")).status).toBe(401);
    expect((await request(app).put("/seguidos/1")).status).toBe(401);
    expect((await request(app).put("/seguidos/999").set(comoUsuario(usuarios.nahuel))).status).toBe(404);
    expect((await request(app).delete("/seguidos/999").set(comoUsuario(usuarios.nahuel))).status).toBe(404);
  });
});
