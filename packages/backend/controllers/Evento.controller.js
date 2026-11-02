import { ORDENES_VALIDOS } from "../services/Evento.service.js";
import { parsearEnteroPositivo, parsearNumeroNoNegativo, parsearOpcion, parsearBooleano } from "./validaciones.js";

const LIMITE_MAXIMO_POR_PAGINA = 50;

export class EventoController {
  constructor(eventoService) {
    this.eventoService = eventoService;
  }

  // GET /eventos?texto=&categoria=&precioMinimo=&precioMaximo=&orden=&direccion=&incluirPasados=&page=&limit=
  async buscarEventos(req, res) {
    const { texto, categoria } = req.query;
    const filtros = {
      texto: texto?.trim() || undefined,
      categoria: categoria?.trim() || undefined,
      precioMinimo: parsearNumeroNoNegativo(req.query.precioMinimo, "precioMinimo"),
      precioMaximo: parsearNumeroNoNegativo(req.query.precioMaximo, "precioMaximo"),
      orden: parsearOpcion(req.query.orden, "orden", ORDENES_VALIDOS, "fecha"),
      direccion: parsearOpcion(req.query.direccion, "direccion", ["asc", "desc"], undefined),
      incluirPasados: parsearBooleano(req.query.incluirPasados, "incluirPasados", false),
      page: parsearEnteroPositivo(req.query.page, "page", 1),
      limit: Math.min(parsearEnteroPositivo(req.query.limit, "limit", 10), LIMITE_MAXIMO_POR_PAGINA),
    };
    res.status(200).json(await this.eventoService.buscarEventos(filtros));
  }

  async obtenerEvento(req, res) {
    res.status(200).json(await this.eventoService.obtenerEvento(req.params.eventoId));
  }
}
