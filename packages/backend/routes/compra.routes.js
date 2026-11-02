import { Router } from "express";
import { requerirUsuario } from "../middleware/identificacion.js";

// Todas las operaciones sobre compras requieren saber quién es el usuario
export function crearCompraRouter(compraController) {
  const router = Router();
  router.use(requerirUsuario);
  router.get("/", (req, res) => compraController.listarMisCompras(req, res));
  router.post("/", (req, res) => compraController.comprar(req, res));
  router.get("/:compraId", (req, res) => compraController.obtenerCompra(req, res));
  return router;
}
