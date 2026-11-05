import { Router } from "express";
import { requerirUsuario } from "../middleware/identificacion.js";

export function crearEventoRouter(eventoController) {
  const router = Router();
  router.get("/", (req, res) => eventoController.buscarEventos(req, res));
  router.post("/", requerirUsuario, (req, res) => eventoController.crearEvento(req, res));
  router.get("/:eventoId", (req, res) => eventoController.obtenerEvento(req, res));
  return router;
}

// Favoritos del usuario identificado
export function crearFavoritoRouter(eventoController) {
  const router = Router();
  router.use(requerirUsuario);
  router.get("/", (req, res) => eventoController.listarFavoritos(req, res));
  router.put("/:eventoId", (req, res) => eventoController.agregarFavorito(req, res));
  router.delete("/:eventoId", (req, res) => eventoController.quitarFavorito(req, res));
  return router;
}

// Se monta en /usuarios/:usuarioId (mergeParams para leer el :usuarioId del path padre)
export function crearOrganizadorRouter(eventoController) {
  const router = Router({ mergeParams: true });
  router.get("/eventos", (req, res) => eventoController.listarEventosDeOrganizador(req, res));
  router.get("/resenias", (req, res) => eventoController.obtenerReputacionDeOrganizador(req, res));
  return router;
}
