import { ConflictError } from "../errors/ConflictError.js";
import { ValidationError } from "../errors/ValidationError.js";

// Patrón State: cada estado sabe a qué estados puede pasar y qué significa cancelar estando en él.
// Así Compra no necesita un switch/if por estado, y agregar un estado nuevo no obliga a tocar Compra.
class Estado {
  constructor(nombre, { siguientes = [], alCancelar = null, liberaCupo = false }) {
    this.nombre = nombre;
    this._siguientes = siguientes;
    this._alCancelar = alCancelar;
    this.liberaCupo = liberaCupo;
  }

  puedePasarA(otroEstado) {
    return this._siguientes.includes(otroEstado.nombre);
  }

  esFinal() {
    return this._siguientes.length === 0;
  }

  permiteCancelar() {
    return this._alCancelar !== null;
  }

  // Estado al que pasa la compra si el comprador la cancela estando en este estado
  estadoAlCancelar() {
    if (!this.permiteCancelar()) {
      throw new ConflictError(`No se puede cancelar una compra en estado ${this.nombre}`);
    }
    return EstadoCompra[this._alCancelar];
  }

  toString() {
    return this.nombre;
  }

  toJSON() {
    return this.nombre;
  }
}

export const EstadoCompra = Object.freeze({
  // Cancelar una compra que todavía no se pagó no requiere reembolso
  PENDIENTE: new Estado("PENDIENTE", { siguientes: ["CONFIRMADA", "CANCELADA"], alCancelar: "CANCELADA" }),
  // Cancelar una compra pagada implica devolver el dinero
  CONFIRMADA: new Estado("CONFIRMADA", { siguientes: ["UTILIZADA", "REEMBOLSADA"], alCancelar: "REEMBOLSADA" }),
  UTILIZADA: new Estado("UTILIZADA", {}),
  CANCELADA: new Estado("CANCELADA", { liberaCupo: true }),
  REEMBOLSADA: new Estado("REEMBOLSADA", { liberaCupo: true }),
});

export function estadoCompraDesdeNombre(nombre) {
  const estado = EstadoCompra[typeof nombre === "string" ? nombre.toUpperCase() : nombre];
  if (!estado) {
    throw new ValidationError(
      `El estado "${nombre}" no existe. Estados válidos: ${Object.keys(EstadoCompra).join(", ")}`,
    );
  }
  return estado;
}
