import { UnprocessableEntityError } from "../errors/UnprocessableEntityError.js";
import { validarTextoNoVacio } from "./validaciones.js";

// Un mismo usuario puede comprar entradas y organizar eventos: el rol lo define cada caso de uso,
// no la clase (no hay "Comprador" ni "Organizador" en el dominio)
export class Usuario {
  constructor({ nombre, apellido }) {
    this.nombre = validarTextoNoVacio(nombre, "El usuario debe tener un nombre");
    this.apellido = validarTextoNoVacio(apellido, "El usuario debe tener un apellido");
    this.favoritos = [];
    this.seguidos = [];
  }

  nombreCompleto() {
    return `${this.nombre} ${this.apellido}`;
  }

  esFavorito(evento) {
    return this.favoritos.includes(evento);
  }

  // Agregar o quitar dos veces el mismo evento no tiene efecto (operaciones idempotentes)
  agregarFavorito(evento) {
    if (!this.esFavorito(evento)) {
      this.favoritos.push(evento);
    }
  }

  quitarFavorito(evento) {
    this.favoritos = this.favoritos.filter((favorito) => favorito !== evento);
  }

  sigueA(organizador) {
    return this.seguidos.includes(organizador);
  }

  // Seguir a un organizador para enterarse de sus eventos. Como los favoritos, seguir o dejar de seguir dos veces
  // no tiene efecto (idempotente), y nadie puede seguirse a sí mismo
  seguir(organizador) {
    if (this.esElMismoQue(organizador)) {
      throw new UnprocessableEntityError("No podés seguirte a vos mismo");
    }
    if (!this.sigueA(organizador)) {
      this.seguidos.push(organizador);
    }
  }

  dejarDeSeguir(organizador) {
    this.seguidos = this.seguidos.filter((seguido) => seguido !== organizador);
  }

  esElMismoQue(otroUsuario) {
    return this === otroUsuario || (this.id !== undefined && this.id === otroUsuario?.id);
  }
}
