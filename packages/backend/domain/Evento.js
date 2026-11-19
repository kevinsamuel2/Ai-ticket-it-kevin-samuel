import { UnprocessableEntityError } from "../errors/UnprocessableEntityError.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ConflictError } from "../errors/ConflictError.js";
import { TipoEntrada } from "./TipoEntrada.js";
import { validarTextoNoVacio, validarFecha } from "./validaciones.js";

const MILISEGUNDOS_POR_DIA = 24 * 60 * 60 * 1000;

export class Evento {
  constructor({ nombre, descripcion, categoria, fecha, tiposEntrada, multimedia = [], organizador }) {
    this.nombre = validarTextoNoVacio(nombre, "El evento debe tener un nombre");
    this.descripcion = validarTextoNoVacio(descripcion, "El evento debe tener una descripción");
    if (!categoria) {
      throw new UnprocessableEntityError("El evento debe tener una categoría");
    }
    if (!organizador) {
      throw new UnprocessableEntityError("El evento debe tener un organizador");
    }
    this.categoria = categoria;
    this.organizador = organizador;
    this.fecha = validarFecha(fecha, "La fecha del evento no es válida");
    this.multimedia = this._validarMultimedia(multimedia);
    this.tiposEntrada = this._crearTiposEntrada(tiposEntrada);
    this.finalizadoEn = null;
  }

  _crearTiposEntrada(tiposEntrada) {
    if (!Array.isArray(tiposEntrada) || tiposEntrada.length === 0) {
      throw new UnprocessableEntityError("El evento debe ofrecer al menos un tipo de entrada");
    }
    const tipos = tiposEntrada.map((datos) => (datos instanceof TipoEntrada ? datos : new TipoEntrada(datos)));

    const nombres = tipos.map((tipo) => tipo.nombre.toLowerCase());
    if (new Set(nombres).size !== nombres.length) {
      throw new UnprocessableEntityError("No puede haber dos tipos de entrada con el mismo nombre");
    }
    // El id de cada tipo de entrada es su posición dentro del evento (1, 2, 3...)
    tipos.forEach((tipo, indice) => {
      tipo.id = indice + 1;
    });
    return tipos;
  }

  _validarMultimedia(multimedia) {
    if (!Array.isArray(multimedia) || multimedia.some((url) => typeof url !== "string" || !url.trim())) {
      throw new UnprocessableEntityError("El material multimedia debe ser una lista de URLs");
    }
    return multimedia.map((url) => url.trim());
  }

  validarQueLaFechaSeaFutura(ahora = new Date()) {
    if (this.fecha <= ahora) {
      throw new UnprocessableEntityError("La fecha del evento tiene que ser posterior a la fecha actual");
    }
  }

  // Terminó porque llegó su fecha o porque el organizador lo finalizó antes
  yaSeRealizo(ahora = new Date()) {
    return this.estaFinalizado() || this.fecha <= ahora;
  }

  estaFinalizado() {
    return this.finalizadoEn !== null;
  }

  // El organizador da por terminado el evento (en la app sirve para simular que ya se realizó)
  finalizar(ahora = new Date()) {
    if (this.estaFinalizado()) {
      throw new ConflictError("El evento ya fue finalizado");
    }
    this.finalizadoEn = ahora;
  }

  // Desde las 00:00 del día del evento ya se pueden validar las entradas en la puerta
  yaEsElDiaDelEvento(ahora = new Date()) {
    const inicioDelDia = new Date(this.fecha.getFullYear(), this.fecha.getMonth(), this.fecha.getDate());
    return ahora >= inicioDelDia;
  }

  // Días calendario que faltan para el evento (0 si es hoy o ya pasó)
  diasRestantes(ahora = new Date()) {
    const inicioDeHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const diaDelEvento = new Date(this.fecha.getFullYear(), this.fecha.getMonth(), this.fecha.getDate());
    return Math.max(0, Math.round((diaDelEvento - inicioDeHoy) / MILISEGUNDOS_POR_DIA));
  }

  buscarTipoEntrada(tipoEntradaId) {
    const tipo = this.tiposEntrada.find((t) => t.id === Number(tipoEntradaId));
    if (!tipo) {
      throw new NotFoundError(`El tipo de entrada ${tipoEntradaId} no existe en el evento "${this.nombre}"`);
    }
    return tipo;
  }

  precioMinimo() {
    return Math.min(...this.tiposEntrada.map((tipo) => tipo.precio));
  }

  // Del diagrama: true si alguno de sus tipos de entrada tiene un precio dentro del rango
  tuPrecioEstaEntre(minimo, maximo) {
    return this.tiposEntrada.some((tipo) => tipo.precioEstaEntre(minimo, maximo));
  }

  estaAgotado() {
    return this.tiposEntrada.every((tipo) => tipo.estaAgotado());
  }

  estaOrganizadoPor(usuario) {
    return this.organizador.esElMismoQue(usuario);
  }

  esDeCategoria(categoria) {
    return this.categoria.esLaMismaQue(categoria);
  }

  // Búsqueda textual sin distinguir mayúsculas ni tildes, sobre nombre, descripción y categoría
  coincideCon(texto) {
    const normalizar = (valor) =>
      valor
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase();
    const buscado = normalizar(texto.trim());
    return [this.nombre, this.descripcion, this.categoria.nombre].some((campo) => normalizar(campo).includes(buscado));
  }
}
