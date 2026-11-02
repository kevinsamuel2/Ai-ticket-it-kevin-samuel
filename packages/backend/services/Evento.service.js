import { NotFoundError } from "../errors/NotFoundError.js";
import { ValidationError } from "../errors/ValidationError.js";
import { Resenia } from "../domain/Resenia.js";
import { Evento } from "../domain/Evento.js";

// Cómo se obtiene el valor por el que se ordena cada criterio, y su dirección por defecto
const CRITERIOS_DE_ORDEN = {
  fecha: { valor: (evento) => evento.fecha.getTime(), direccion: "asc" },
  precio: { valor: (evento) => evento.precioMinimo(), direccion: "asc" },
  // Los organizadores sin reseñas quedan al final
  puntaje: { valor: (evento, reputaciones) => reputaciones.get(evento.organizador).puntaje ?? -1, direccion: "desc" },
};
export const ORDENES_VALIDOS = Object.keys(CRITERIOS_DE_ORDEN);

export class EventoService {
  // Recibe las dependencias con nombre para evitar una lista larga de parámetros posicionales
  constructor({ eventoRepository, compraRepository, categoriaRepository, usuarioRepository }) {
    this.eventoRepository = eventoRepository;
    this.compraRepository = compraRepository;
    this.categoriaRepository = categoriaRepository;
    this.usuarioRepository = usuarioRepository;
  }

  // --- DTOs ---

  organizadorToDTO(organizador, reputacion) {
    return {
      id: organizador.id,
      nombreCompleto: organizador.nombreCompleto(),
      puntaje: reputacion.puntaje,
      cantidadResenias: reputacion.cantidadResenias,
    };
  }

  tipoEntradaToDTO(tipo) {
    return {
      id: tipo.id,
      nombre: tipo.nombre,
      descripcion: tipo.descripcion,
      precio: tipo.precio,
      cupo: tipo.cupo,
      disponibles: tipo.disponibles(),
      agotado: tipo.estaAgotado(),
    };
  }

  // Versión reducida para los listados
  toResumenDTO(evento, reputacion, ahora = new Date()) {
    return {
      id: evento.id,
      nombre: evento.nombre,
      categoria: evento.categoria.nombre,
      fecha: evento.fecha,
      imagen: evento.multimedia[0] ?? null,
      precioMinimo: evento.precioMinimo(),
      agotado: evento.estaAgotado(),
      yaSeRealizo: evento.yaSeRealizo(ahora),
      organizador: this.organizadorToDTO(evento.organizador, reputacion),
    };
  }

  reseniaToDTO(resenia) {
    return {
      evento: { id: resenia.evento.id, nombre: resenia.evento.nombre },
      comprador: resenia.comprador.nombreCompleto(),
      detalle: resenia.detalle,
      puntuacion: resenia.puntuacion,
      fecha: resenia.fecha,
    };
  }

  // --- Casos de uso ---

  // Búsqueda textual, filtro por categoría y rango de precio, orden y paginado
  async buscarEventos(
    {
      texto,
      categoria,
      precioMinimo,
      precioMaximo,
      orden = "fecha",
      direccion,
      incluirPasados = false,
      page = 1,
      limit = 10,
    } = {},
    ahora = new Date(),
  ) {
    if (precioMinimo !== undefined && precioMaximo !== undefined && precioMinimo > precioMaximo) {
      throw new ValidationError("El precio mínimo no puede ser mayor al precio máximo");
    }

    const eventos = (await this.eventoRepository.buscarTodos()).filter(
      (evento) =>
        (incluirPasados || !evento.yaSeRealizo(ahora)) &&
        (!texto || evento.coincideCon(texto)) &&
        (!categoria || evento.esDeCategoria({ nombre: categoria })) &&
        evento.tuPrecioEstaEntre(precioMinimo ?? 0, precioMaximo ?? Infinity),
    );

    const reputaciones = await this._reputacionesDe(eventos.map((evento) => evento.organizador));
    const criterio = CRITERIOS_DE_ORDEN[orden];
    const signo = (direccion ?? criterio.direccion) === "asc" ? 1 : -1;
    eventos.sort((a, b) => signo * (criterio.valor(a, reputaciones) - criterio.valor(b, reputaciones)));

    const inicio = (page - 1) * limit;
    return {
      items: eventos
        .slice(inicio, inicio + limit)
        .map((evento) => this.toResumenDTO(evento, reputaciones.get(evento.organizador), ahora)),
      page,
      limit,
      total: eventos.length,
      totalPages: Math.ceil(eventos.length / limit),
    };
  }

  // Detalle de un evento, con las reseñas de los eventos anteriores de su organizador
  async obtenerEvento(eventoId, ahora = new Date()) {
    const evento = await this.buscarEventoExistente(eventoId);
    const resenias = await this.compraRepository.buscarReseniasDeOrganizador(evento.organizador);
    const reputacion = this._reputacion(resenias);

    return {
      ...this.toResumenDTO(evento, reputacion, ahora),
      descripcion: evento.descripcion,
      multimedia: evento.multimedia,
      tiposEntrada: evento.tiposEntrada.map((tipo) => this.tipoEntradaToDTO(tipo)),
      reseniasOrganizador: resenias.toSorted((a, b) => b.fecha - a.fecha).map((resenia) => this.reseniaToDTO(resenia)),
    };
  }

  // El usuario identificado publica un evento y queda como su organizador
  async crearEvento(
    organizador,
    { nombre, descripcion, categoriaId, fecha, multimedia, tiposEntrada },
    ahora = new Date(),
  ) {
    if (categoriaId === undefined) {
      throw new ValidationError("Falta la categoría del evento (categoriaId)");
    }
    const categoria = await this.categoriaRepository.buscarPorId(categoriaId);
    if (!categoria) {
      throw new NotFoundError(`La categoría con id ${categoriaId} no existe`);
    }

    const evento = new Evento({ nombre, descripcion, categoria, fecha, multimedia, tiposEntrada, organizador });
    evento.validarQueLaFechaSeaFutura(ahora);

    const guardado = await this.eventoRepository.guardar(evento);
    return this.obtenerEvento(guardado.id, ahora);
  }

  // Todos los eventos de un organizador (próximos y pasados), del más cercano al más lejano
  async listarEventosDeOrganizador(organizadorId, ahora = new Date()) {
    const organizador = await this._buscarOrganizador(organizadorId);
    const eventos = await this.eventoRepository.buscarPorOrganizador(organizador);
    const reputacion = this._reputacion(await this.compraRepository.buscarReseniasDeOrganizador(organizador));

    return eventos.toSorted((a, b) => a.fecha - b.fecha).map((evento) => this.toResumenDTO(evento, reputacion, ahora));
  }

  // Reputación de un organizador: su puntaje promedio y las reseñas de sus eventos, de la más nueva a la más vieja
  async obtenerReputacionDeOrganizador(organizadorId) {
    const organizador = await this._buscarOrganizador(organizadorId);
    const resenias = await this.compraRepository.buscarReseniasDeOrganizador(organizador);
    return {
      organizador: this.organizadorToDTO(organizador, this._reputacion(resenias)),
      resenias: resenias.toSorted((a, b) => b.fecha - a.fecha).map((resenia) => this.reseniaToDTO(resenia)),
    };
  }

  async _buscarOrganizador(organizadorId) {
    const organizador = await this.usuarioRepository.buscarPorId(organizadorId);
    if (!organizador) {
      throw new NotFoundError(`El usuario con id ${organizadorId} no existe`);
    }
    return organizador;
  }

  async buscarEventoExistente(eventoId) {
    const evento = await this.eventoRepository.buscarPorId(eventoId);
    if (!evento) {
      throw new NotFoundError(`El evento con id ${eventoId} no existe`);
    }
    return evento;
  }

  // --- Reputación de organizadores ---

  _reputacion(resenias) {
    return { puntaje: Resenia.promedio(resenias), cantidadResenias: resenias.length };
  }

  // Calcula la reputación una sola vez por organizador, aunque tenga muchos eventos en el listado
  async _reputacionesDe(organizadores) {
    const reputaciones = new Map();
    for (const organizador of new Set(organizadores)) {
      const resenias = await this.compraRepository.buscarReseniasDeOrganizador(organizador);
      reputaciones.set(organizador, this._reputacion(resenias));
    }
    return reputaciones;
  }
}
