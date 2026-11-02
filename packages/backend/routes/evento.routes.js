import { Router } from "express";
import { requerirUsuario } from "../middleware/identificacion.js";

export function crearEventoRouter(eventoController) {
  const router = Router();
  router.get("/", (req, res) => eventoController.buscarEventos(req, res));
  router.post("/", requerirUsuario, (req, res) => eventoController.crearEvento(req, res));
  router.get("/:eventoId", (req, res) => eventoController.obtenerEvento(req, res));
  return router;
}

// Se monta en /usuarios/:usuarioId/eventos (mergeParams para leer el :usuarioId del path padre)
export function crearEventosDeOrganizadorRouter(eventoController) {
  const router = Router({ mergeParams: true });
  router.get("/", (req, res) => eventoController.listarEventosDeOrganizador(req, res));
  return router;
}
