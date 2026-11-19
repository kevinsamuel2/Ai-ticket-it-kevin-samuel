import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import request from "supertest";
import { crearAppConDatosDePrueba } from "./helpers.js";

const CARPETA_PUBLICA = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "public");

describe("API: fotos de los eventos de ejemplo", () => {
  let app;
  let eventos;

  beforeEach(async () => {
    let repositorios;
    ({ app, repositorios } = await crearAppConDatosDePrueba());
    eventos = await repositorios.eventoRepository.buscarTodos();
  });

  const rutasDeFotos = () => eventos.flatMap((e) => e.multimedia).filter((url) => url.startsWith("/fotos/"));

  it("cada foto local del seed existe en public/fotos", () => {
    const faltantes = rutasDeFotos().filter((ruta) => !fs.existsSync(path.join(CARPETA_PUBLICA, ruta)));

    expect(rutasDeFotos().length).toBeGreaterThan(0);
    expect(faltantes).toEqual([]);
  });

  it("GET /fotos/:archivo sirve la imagen sin necesidad de iniciar sesión", async () => {
    const res = await request(app).get("/fotos/bad-bunny.jpg");

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toBe("image/jpeg");
  });

  it("GET /fotos/:archivo responde 404 si la foto no existe", async () => {
    const res = await request(app).get("/fotos/no-existe.jpg");

    expect(res.status).toBe(404);
  });
});
