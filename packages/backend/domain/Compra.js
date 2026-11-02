import { UnprocessableEntityError } from "../errors/UnprocessableEntityError.js";
import { ConflictError } from "../errors/ConflictError.js";
import { EstadoCompra } from "./EstadoCompra.js";
import { CambioEstadoCompra } from "./CambioEstadoCompra.js";
import { Mensaje } from "./Mensaje.js";
import { Resenia } from "./Resenia.js";
import { validarEnteroPositivo } from "./validaciones.js";

export class Compra {
  // Al crearse, la compra reserva el cupo del tipo de entrada y queda PENDIENTE de pago
  constructor({ comprador, evento, tipoEntrada, cantidad }, ahora = new Date()) {
    if (!comprador) {
      throw new UnprocessableEntityError("La compra debe tener un comprador");
    }
    if (!evento || !tipoEntrada) {
      throw new UnprocessableEntityError("La compra debe tener un evento y un tipo de entrada");
    }
    if (!evento.tiposEntrada.includes(tipoEntrada)) {
      throw new UnprocessableEntityError(`El tipo de entrada "${tipoEntrada.nombre}" no pertenece al evento`);
    }
    validarEnteroPositivo(cantidad, "La cantidad de entradas debe ser un número entero mayor a 0");
    if (evento.yaSeRealizo(ahora)) {
      throw new ConflictError("No se pueden comprar entradas para un evento que ya se realizó");
    }

    tipoEntrada.reservar(cantidad);

    this.comprador = comprador;
    this.evento = evento;
    this.tipoEntrada = tipoEntrada;
    this.cantidad = cantidad;
    this.total = tipoEntrada.precioPara(cantidad);
    this.fechaCompra = ahora;
    this.estado = EstadoCompra.PENDIENTE;
    this.historialEstados = [
      new CambioEstadoCompra({ compra: this, estado: this.estado, quien: comprador, fechaHora: ahora }),
    ];
    this.mensajes = [];
    this.resenia = null;
  }

  // Del diagrama: valida la transición, registra quién la hizo y devuelve el cupo si la compra se da de baja
  actualizarEstado(nuevoEstado, quien, ahora = new Date()) {
    if (!this.estado.puedePasarA(nuevoEstado)) {
      throw new ConflictError(`Una compra ${this.estado} no puede pasar a ${nuevoEstado}`);
    }
    this.estado = nuevoEstado;
    this.historialEstados.push(new CambioEstadoCompra({ compra: this, estado: nuevoEstado, quien, fechaHora: ahora }));

    if (nuevoEstado.liberaCupo) {
      this.tipoEntrada.liberar(this.cantidad);
    }
  }

  confirmarPago(quien, ahora = new Date()) {
    this.actualizarEstado(EstadoCompra.CONFIRMADA, quien, ahora);
  }

  marcarComoUtilizada(quien, ahora = new Date()) {
    this.actualizarEstado(EstadoCompra.UTILIZADA, quien, ahora);
  }

  // Se puede cancelar mientras no esté utilizada (ni ya dada de baja) y el evento no se haya realizado
  puedeCancelarse(ahora = new Date()) {
    return this.estado.permiteCancelar() && !this.evento.yaSeRealizo(ahora);
  }

  cancelar(quien, ahora = new Date()) {
    if (this.evento.yaSeRealizo(ahora)) {
      throw new ConflictError("No se puede cancelar una compra de un evento que ya se realizó");
    }
    this.actualizarEstado(this.estado.estadoAlCancelar(), quien, ahora);
  }

  // Solo tiene sentido contar los días para una compra confirmada
  diasParaElEvento(ahora = new Date()) {
    return this.estado === EstadoCompra.CONFIRMADA ? this.evento.diasRestantes(ahora) : null;
  }

  esDe(usuario) {
    return this.comprador.esElMismoQue(usuario);
  }

  // Participantes de la compra: el comprador y el organizador del evento
  participa(usuario) {
    return this.esDe(usuario) || this.evento.estaOrganizadoPor(usuario);
  }

  // El chat está disponible en cualquier estado de la compra
  enviarMensaje(usuario, texto, ahora = new Date()) {
    const mensaje = new Mensaje({ usuario, mensaje: texto, enviado: ahora });
    this.mensajes.push(mensaje);
    return mensaje;
  }

  // Solo se puede reseñar una vez, y después de haber usado la entrada
  puedeReseniarse() {
    return this.estado === EstadoCompra.UTILIZADA && this.resenia === null;
  }

  reseniar({ detalle, puntuacion }, ahora = new Date()) {
    if (this.estado !== EstadoCompra.UTILIZADA) {
      throw new ConflictError("Solo se puede reseñar un evento después de haber utilizado la entrada");
    }
    if (this.resenia !== null) {
      throw new ConflictError("Esta compra ya tiene una reseña");
    }
    this.resenia = new Resenia({ comprador: this.comprador, evento: this.evento, detalle, puntuacion, fecha: ahora });
    return this.resenia;
  }
}
