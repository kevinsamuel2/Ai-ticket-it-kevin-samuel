import { Router } from "express";

export function crearUsuarioRouter(usuarioController) {
  const router = Router();
  router.get("/", (req, res) => usuarioController.listarUsuarios(req, res));
  router.get("/:usuarioId", (req, res) => usuarioController.obtenerUsuario(req, res));
  return router;
}
