import { ORDENES_VALIDOS } from "../services/Evento.service.js";
import { ValidationError } from "../errors/ValidationError.js";
import {
  validarCamposPermitidos,
  parsearEnteroPositivo,
  parsearNumeroNoNegativo,
  parsearOpcion,
  parsearBooleano,
} from "./validaciones.js";

const LIMITE_MAXIMO_POR_PAGINA = 50;
const CAMPOS_EVENTO = ["nombre", "descripcion", "categoriaId", "fecha", "multimedia", "tiposEntrada"];
const CAMPOS_TIPO_ENTRADA = ["nombre", "descripcion", "precio", "cupo"];

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

  // POST /eventos — el organizador es el usuario identificado
  async crearEvento(req, res) {
    validarCamposPermitidos(req.body, CAMPOS_EVENTO);
    const { tiposEntrada } = req.body;
    if (Array.isArray(tiposEntrada)) {
      tiposEntrada.forEach((tipo) => validarCamposPermitidos(tipo, CAMPOS_TIPO_ENTRADA));
    } else if (tiposEntrada !== undefined) {
      throw new ValidationError("tiposEntrada debe ser una lista");
    }

    const evento = await this.eventoService.crearEvento(req.usuario, req.body);
    res.status(201).location(`/eventos/${evento.id}`).json(evento);
  }

  // GET /usuarios/:usuarioId/eventos
  async listarEventosDeOrganizador(req, res) {
    res.status(200).json(await this.eventoService.listarEventosDeOrganizador(req.params.usuarioId));
  }

  // GET /usuarios/:usuarioId/resenias
  async obtenerReputacionDeOrganizador(req, res) {
    res.status(200).json(await this.eventoService.obtenerReputacionDeOrganizador(req.params.usuarioId));
  }
}
