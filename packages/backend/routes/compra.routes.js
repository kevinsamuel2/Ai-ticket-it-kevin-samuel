import { Router } from "express";
import { requerirUsuario } from "../middleware/identificacion.js";

// Todas las operaciones sobre compras requieren saber quién es el usuario
export function crearCompraRouter(compraController) {
  const router = Router();
  router.use(requerirUsuario);
  router.get("/", (req, res) => compraController.listarMisCompras(req, res));
  router.post("/", (req, res) => compraController.comprar(req, res));
  router.get("/:compraId", (req, res) => compraController.obtenerCompra(req, res));
  router.post("/:compraId/cambios-de-estado", (req, res) => compraController.cambiarEstado(req, res));
  return router;
}

// Se monta en /eventos/:eventoId/compras (mergeParams para leer el :eventoId del path padre)
export function crearComprasDeEventoRouter(compraController) {
  const router = Router({ mergeParams: true });
  router.get("/", requerirUsuario, (req, res) => compraController.listarComprasDeEvento(req, res));
  return router;
}
