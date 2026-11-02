import express from "express";
import cors from "cors";
import { errorHandler, rutaNoEncontrada } from "./middleware/errorHandler.js";

// Arma la app de Express sin levantar el servidor, así los tests de integración (supertest)
// pueden usarla directamente. `rutas` es un objeto { "/path": router } y `middlewares`
// se ejecutan antes de todas las rutas (ej: identificación del usuario).
export function crearApp({ rutas = {}, middlewares = [] } = {}) {
  const app = express();
  app.use(express.json());
  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()) : true,
    }),
  );

  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
  });

  for (const middleware of middlewares) {
    app.use(middleware);
  }
  for (const [path, router] of Object.entries(rutas)) {
    app.use(path, router);
  }

  app.use(rutaNoEncontrada);
  app.use(errorHandler);

  return app;
}
