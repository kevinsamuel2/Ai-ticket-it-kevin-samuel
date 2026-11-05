import { Router } from "express";
import { requerirUsuario } from "../middleware/identificacion.js";

// Los datos de los usuarios solo los ven usuarios con sesión iniciada
export function crearUsuarioRouter(usuarioController) {
  const router = Router();
  router.use(requerirUsuario);
  router.get("/", (req, res) => usuarioController.listarUsuarios(req, res));
  router.get("/:usuarioId", (req, res) => usuarioController.obtenerUsuario(req, res));
  return router;
}
