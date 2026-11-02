import { validarTextoNoVacio } from "./validaciones.js";

export class Categoria {
  constructor({ nombre, descripcion = "" }) {
    this.nombre = validarTextoNoVacio(nombre, "La categoría debe tener un nombre");
    this.descripcion = typeof descripcion === "string" ? descripcion.trim() : "";
  }

  esLaMismaQue(otraCategoria) {
    return this.nombre.toLowerCase() === otraCategoria?.nombre?.toLowerCase();
  }
}
