import { UnprocessableEntityError } from "../errors/UnprocessableEntityError.js";
import { validarTextoNoVacio } from "./validaciones.js";

export const LARGO_MAXIMO_MENSAJE = 1000;

// Mensaje del chat de una compra, entre el comprador y el organizador del evento
export class Mensaje {
  constructor({ usuario, mensaje, enviado = new Date() }) {
    if (!usuario) {
      throw new UnprocessableEntityError("El mensaje debe tener un autor");
    }
    const texto = validarTextoNoVacio(mensaje, "El mensaje no puede estar vacío");
    if (texto.length > LARGO_MAXIMO_MENSAJE) {
      throw new UnprocessableEntityError(`El mensaje no puede superar los ${LARGO_MAXIMO_MENSAJE} caracteres`);
    }
    this.usuario = usuario;
    this.mensaje = texto;
    this.enviado = enviado;
  }
}
