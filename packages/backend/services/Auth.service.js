import { randomUUID } from "node:crypto";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";

export class AuthService {
  constructor({ cuentaRepository, sesionRepository }) {
    this.cuentaRepository = cuentaRepository;
    this.sesionRepository = sesionRepository;
  }

  // El mismo mensaje para email inexistente y contraseña incorrecta: no hay que revelar qué emails existen
  async iniciarSesion(email, contrasenia) {
    const cuenta = await this.cuentaRepository.buscarPorEmail(email);
    if (!cuenta || !cuenta.contraseniaEsCorrecta(contrasenia)) {
      throw new UnauthorizedError("Email o contraseña incorrectos");
    }
    const token = randomUUID();
    await this.sesionRepository.guardar(token, cuenta.usuario);
    return {
      token,
      usuario: {
        id: cuenta.usuario.id,
        nombre: cuenta.usuario.nombre,
        apellido: cuenta.usuario.apellido,
        nombreCompleto: cuenta.usuario.nombreCompleto(),
        email: cuenta.email,
      },
    };
  }

  async cerrarSesion(token) {
    await this.sesionRepository.eliminar(token);
  }

  async usuarioDeLaSesion(token) {
    const usuario = await this.sesionRepository.buscarUsuario(token);
    if (!usuario) {
      throw new UnauthorizedError("La sesión no es válida o expiró. Volvé a iniciar sesión");
    }
    return usuario;
  }
}
