import { ConflictError } from "../errors/ConflictError.js";
import { validarTextoNoVacio, validarEnteroPositivo, validarNumeroNoNegativo } from "./validaciones.js";

// Un tipo de entrada de un evento (General, Platea, VIP...). `cupo` es la capacidad total;
// las entradas vendidas se descuentan con reservar() y se devuelven con liberar() (ej: al cancelar una compra)
export class TipoEntrada {
  constructor({ nombre, descripcion = "", precio, cupo }) {
    this.nombre = validarTextoNoVacio(nombre, "El tipo de entrada debe tener un nombre");
    this.descripcion = typeof descripcion === "string" ? descripcion.trim() : "";
    this.precio = validarNumeroNoNegativo(precio, `El precio de "${this.nombre}" debe ser un número mayor o igual a 0`);
    this.cupo = validarEnteroPositivo(cupo, `El cupo de "${this.nombre}" debe ser un número entero mayor a 0`);
    this.vendidas = 0;
  }

  disponibles() {
    return this.cupo - this.vendidas;
  }

  hayCupoPara(cantidad) {
    return Number.isInteger(cantidad) && cantidad > 0 && cantidad <= this.disponibles();
  }

  estaAgotado() {
    return this.disponibles() === 0;
  }

  reservar(cantidad) {
    if (!this.hayCupoPara(cantidad)) {
      throw new ConflictError(
        `No hay cupo suficiente para "${this.nombre}": se pidieron ${cantidad} y quedan ${this.disponibles()}`,
      );
    }
    this.vendidas += cantidad;
  }

  liberar(cantidad) {
    this.vendidas = Math.max(0, this.vendidas - cantidad);
  }

  precioPara(cantidad) {
    return this.precio * cantidad;
  }

  precioEstaEntre(minimo, maximo) {
    return this.precio >= minimo && this.precio <= maximo;
  }
}
