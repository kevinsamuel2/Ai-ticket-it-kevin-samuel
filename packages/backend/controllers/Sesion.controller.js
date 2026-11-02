import { validarCamposPermitidos, validarCamposRequeridos } from "./validaciones.js";

export class SesionController {
  constructor(authService) {
    this.authService = authService;
  }

  // POST /sesiones { email, contrasenia } — iniciar sesión crea un recurso "sesión"
  async iniciarSesion(req, res) {
    validarCamposPermitidos(req.body, ["email", "contrasenia"]);
    validarCamposRequeridos(req.body, ["email", "contrasenia"]);
    res.status(201).json(await this.authService.iniciarSesion(req.body.email, req.body.contrasenia));
  }

  // DELETE /sesiones/actual — cerrar sesión invalida el token
  async cerrarSesion(req, res) {
    await this.authService.cerrarSesion(req.token);
    res.status(204).send();
  }
}
