import request from "supertest";
import { Router } from "express";
import { crearApp } from "../../app.js";
import { crearMiddlewareIdentificacion, requerirUsuario } from "../../middleware/identificacion.js";
import { crearAppConDatosDePrueba } from "./helpers.js";

describe("API: usuarios y categorías", () => {
  let app;

  beforeEach(async () => {
    ({ app } = await crearAppConDatosDePrueba());
  });

  it("GET /usuarios lista los usuarios", async () => {
    const res = await request(app).get("/usuarios");

    expect(res.status).toBe(200);
    expect(res.body.map((u) => u.nombreCompleto)).toEqual([
      "Lucía Fernández",
      "Martín Sosa",
      "Juan Gómez",
      "Sofía Ramírez",
    ]);
  });

  it("GET /usuarios/:id devuelve un usuario o 404", async () => {
    const encontrado = await request(app).get("/usuarios/3");
    const inexistente = await request(app).get("/usuarios/99");

    expect(encontrado.status).toBe(200);
    expect(encontrado.body).toEqual({ id: 3, nombre: "Juan", apellido: "Gómez", nombreCompleto: "Juan Gómez" });
    expect(inexistente.status).toBe(404);
    expect(inexistente.body.message).toBe("El usuario con id 99 no existe");
  });

  it("GET /categorias lista las categorías", async () => {
    const res = await request(app).get("/categorias");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(6);
    expect(res.body[0]).toEqual({ id: 1, nombre: "Recitales", descripcion: "Música en vivo" });
  });

  it("un header X-Usuario-Id de un usuario inexistente responde 401", async () => {
    const res = await request(app).get("/categorias").set("X-Usuario-Id", "99");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("No existe un usuario con id 99");
  });
});

describe("Middleware de identificación", () => {
  const usuarioRepository = { buscarPorId: async (id) => (Number(id) === 1 ? { id: 1, nombre: "Ana" } : null) };
  const router = Router();
  router.get("/publico", (req, res) => res.json({ usuario: req.usuario }));
  router.get("/privado", requerirUsuario, (req, res) => res.json({ usuario: req.usuario }));
  const app = crearApp({ middlewares: [crearMiddlewareIdentificacion(usuarioRepository)], rutas: { "/": router } });

  it("sin header, el usuario es null y las rutas públicas funcionan", async () => {
    const res = await request(app).get("/publico");

    expect(res.status).toBe(200);
    expect(res.body.usuario).toBeNull();
  });

  it("con header válido, deja el usuario en req.usuario", async () => {
    const res = await request(app).get("/privado").set("X-Usuario-Id", "1");

    expect(res.status).toBe(200);
    expect(res.body.usuario).toEqual({ id: 1, nombre: "Ana" });
  });

  it("requerirUsuario responde 401 si no hay usuario identificado", async () => {
    const res = await request(app).get("/privado");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Tenés que identificarte para realizar esta operación");
  });
});
