import { estadoCompraDesdeNombre } from "../domain/EstadoCompra.js";
import { ValidationError } from "../errors/ValidationError.js";
import { validarCamposPermitidos, validarCamposRequeridos } from "./validaciones.js";

const CAMPOS_COMPRA = ["eventoId", "tipoEntradaId", "cantidad"];

export class CompraController {
  constructor(compraService) {
    this.compraService = compraService;
  }

  // POST /compras — el comprador es el usuario identificado
  async comprar(req, res) {
    validarCamposPermitidos(req.body, CAMPOS_COMPRA);
    validarCamposRequeridos(req.body, CAMPOS_COMPRA);

    const compra = await this.compraService.comprar(req.usuario, req.body);
    res.status(201).location(`/compras/${compra.id}`).json(compra);
  }

  // GET /compras?estado= — las compras del usuario identificado
  async listarMisCompras(req, res) {
    const estado = req.query.estado === undefined ? undefined : estadoCompraDesdeNombre(req.query.estado);
    res.status(200).json(await this.compraService.listarComprasDe(req.usuario, { estado }));
  }

  async obtenerCompra(req, res) {
    res.status(200).json(await this.compraService.obtenerCompra(req.usuario, req.params.compraId));
  }

  // POST /compras/:compraId/cambios-de-estado { estado } — crea un CambioEstadoCompra (recurso del diagrama)
  // en vez de exponer verbos en la URL como /pagar o /cancelar
  async cambiarEstado(req, res) {
    validarCamposPermitidos(req.body, ["estado"]);
    validarCamposRequeridos(req.body, ["estado"]);
    if (typeof req.body.estado !== "string") {
      throw new ValidationError("El estado debe ser un texto");
    }

    const compra = await this.compraService.cambiarEstado(
      req.usuario,
      req.params.compraId,
      req.body.estado.trim().toUpperCase(),
    );
    res.status(201).json(compra);
  }
}
