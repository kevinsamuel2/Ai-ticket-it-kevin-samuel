import { Router } from "express";
import { requerirUsuario } from "../middleware/identificacion.js";

export function crearSesionRouter(sesionController) {
  const router = Router();
  router.post("/", (req, res) => sesionController.iniciarSesion(req, res));
  router.delete("/actual", requerirUsuario, (req, res) => sesionController.cerrarSesion(req, res));
  return router;
}
