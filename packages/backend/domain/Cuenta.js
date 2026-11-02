import { UnprocessableEntityError } from "../errors/UnprocessableEntityError.js";
import { hashearContrasenia, verificarContrasenia } from "../utils/contrasenias.js";
import { validarTextoNoVacio } from "./validaciones.js";

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const LARGO_MINIMO_CONTRASENIA = 6;

// Credenciales para iniciar sesión. Están separadas de Usuario para que el modelo del negocio
// (el del diagrama) no dependa de cómo se autentica la gente
export class Cuenta {
  constructor({ email, contrasenia, usuario }) {
    const emailNormalizado = validarTextoNoVacio(email, "La cuenta debe tener un email").toLowerCase();
    if (!FORMATO_EMAIL.test(emailNormalizado)) {
      throw new UnprocessableEntityError("El email no tiene un formato válido");
    }
    if (typeof contrasenia !== "string" || contrasenia.length < LARGO_MINIMO_CONTRASENIA) {
      throw new UnprocessableEntityError(`La contraseña debe tener al menos ${LARGO_MINIMO_CONTRASENIA} caracteres`);
    }
    if (!usuario) {
      throw new UnprocessableEntityError("La cuenta debe pertenecer a un usuario");
    }
    this.email = emailNormalizado;
    this.hashContrasenia = hashearContrasenia(contrasenia);
    this.usuario = usuario;
  }

  tieneEmail(email) {
    return typeof email === "string" && this.email === email.trim().toLowerCase();
  }

  contraseniaEsCorrecta(contrasenia) {
    return typeof contrasenia === "string" && verificarContrasenia(contrasenia, this.hashContrasenia);
  }
}
