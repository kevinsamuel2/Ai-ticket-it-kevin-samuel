import { jest } from "@jest/globals";
import request from "supertest";
import { Router } from "express";
import { crearApp } from "../app.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ConflictError } from "../errors/ConflictError.js";

describe("App", () => {
  it("GET /health responde 200 con status ok", async () => {
    const res = await request(crearApp()).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("un endpoint inexistente responde 404 con el formato de error", async () => {
    const res = await request(crearApp()).get("/no-existe");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ status: "fail", message: "No existe el endpoint GET /no-existe" });
  });

  it("un body con JSON inválido responde 400", async () => {
    const res = await request(crearApp()).post("/health").set("Content-Type", "application/json").send("{ roto");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("El cuerpo de la request no es un JSON válido");
  });

  describe("manejo de errores", () => {
    const routerQueFalla = (error) => {
      const router = Router();
      router.get("/", () => {
        throw error;
      });
      return router;
    };

    it("traduce un AppError a su status HTTP", async () => {
      const app = crearApp({
        "/no-encontrado": routerQueFalla(new NotFoundError("El evento no existe")),
        "/conflicto": routerQueFalla(new ConflictError("La compra ya fue utilizada")),
      });

      const resNotFound = await request(app).get("/no-encontrado");
      const resConflict = await request(app).get("/conflicto");

      expect(resNotFound.status).toBe(404);
      expect(resNotFound.body.message).toBe("El evento no existe");
      expect(resConflict.status).toBe(409);
      expect(resConflict.body.message).toBe("La compra ya fue utilizada");
    });

    it("responde 500 sin exponer el detalle ante un error inesperado", async () => {
      const spy = jest.spyOn(console, "error").mockImplementation(() => {});
      const app = crearApp({ "/roto": routerQueFalla(new Error("detalle interno")) });

      const res = await request(app).get("/roto");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ status: "error", message: "Error interno del servidor" });
      spy.mockRestore();
    });
  });
});
