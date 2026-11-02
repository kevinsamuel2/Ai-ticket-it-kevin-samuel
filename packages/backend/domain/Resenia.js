import { UnprocessableEntityError } from "../errors/UnprocessableEntityError.js";
import { validarTextoNoVacio } from "./validaciones.js";

export const PUNTUACION_MINIMA = 1;
export const PUNTUACION_MAXIMA = 5;

export class Resenia {
  constructor({ comprador, evento, detalle, puntuacion, fecha = new Date() }) {
    if (!comprador || !evento) {
      throw new UnprocessableEntityError("La reseña debe tener un comprador y un evento");
    }
    if (typeof puntuacion !== "number" || puntuacion < PUNTUACION_MINIMA || puntuacion > PUNTUACION_MAXIMA) {
      throw new UnprocessableEntityError(
        `La puntuación debe ser un número entre ${PUNTUACION_MINIMA} y ${PUNTUACION_MAXIMA}`,
      );
    }
    this.comprador = comprador;
    this.evento = evento;
    this.detalle = validarTextoNoVacio(detalle, "La reseña debe tener un comentario");
    this.puntuacion = puntuacion;
    this.fecha = fecha;
  }

  // Promedio de puntuaciones redondeado a un decimal; null si no hay reseñas
  static promedio(resenias) {
    if (resenias.length === 0) return null;
    const suma = resenias.reduce((acumulado, resenia) => acumulado + resenia.puntuacion, 0);
    return Math.round((suma / resenias.length) * 10) / 10;
  }
}
