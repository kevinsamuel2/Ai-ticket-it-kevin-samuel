import { Router } from "express";

export function crearEventoRouter(eventoController) {
  const router = Router();
  router.get("/", (req, res) => eventoController.buscarEventos(req, res));
  router.get("/:eventoId", (req, res) => eventoController.obtenerEvento(req, res));
  return router;
}
