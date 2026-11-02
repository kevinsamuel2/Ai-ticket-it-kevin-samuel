import { Compra } from "../domain/Compra.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ForbiddenError } from "../errors/ForbiddenError.js";

export class CompraService {
  constructor({ compraRepository, eventoRepository }) {
    this.compraRepository = compraRepository;
    this.eventoRepository = eventoRepository;
  }

  // --- DTOs ---

  toDTO(compra, ahora = new Date()) {
    const { evento, tipoEntrada } = compra;
    return {
      id: compra.id,
      estado: compra.estado.nombre,
      fechaCompra: compra.fechaCompra,
      cantidad: compra.cantidad,
      total: compra.total,
      // Solo viene con valor si la compra está confirmada
      diasParaElEvento: compra.diasParaElEvento(ahora),
      evento: {
        id: evento.id,
        nombre: evento.nombre,
        fecha: evento.fecha,
        categoria: evento.categoria.nombre,
        imagen: evento.multimedia[0] ?? null,
        yaSeRealizo: evento.yaSeRealizo(ahora),
      },
      tipoEntrada: { id: tipoEntrada.id, nombre: tipoEntrada.nombre, precio: tipoEntrada.precio },
      comprador: { id: compra.comprador.id, nombreCompleto: compra.comprador.nombreCompleto() },
      organizador: { id: evento.organizador.id, nombreCompleto: evento.organizador.nombreCompleto() },
    };
  }

  toDetalleDTO(compra, ahora = new Date()) {
    return {
      ...this.toDTO(compra, ahora),
      historialEstados: compra.historialEstados.map((cambio) => ({
        estado: cambio.estado.nombre,
        quien: cambio.quien.nombreCompleto(),
        fechaHora: cambio.fechaHora,
      })),
    };
  }

  // --- Casos de uso ---

  // El comprador elige un tipo de entrada y la cantidad; el dominio valida el cupo y que el evento no haya pasado
  async comprar(comprador, { eventoId, tipoEntradaId, cantidad }, ahora = new Date()) {
    const evento = await this.eventoRepository.buscarPorId(eventoId);
    if (!evento) {
      throw new NotFoundError(`El evento con id ${eventoId} no existe`);
    }
    const tipoEntrada = evento.buscarTipoEntrada(tipoEntradaId);

    const compra = new Compra({ comprador, evento, tipoEntrada, cantidad }, ahora);
    await this.compraRepository.guardar(compra);
    // El cupo del tipo de entrada cambió: se guarda también el evento
    await this.eventoRepository.guardar(evento);
    return this.toDetalleDTO(compra, ahora);
  }

  // Mis compras, de la más reciente a la más antigua, opcionalmente filtradas por estado
  async listarComprasDe(comprador, { estado } = {}, ahora = new Date()) {
    const compras = await this.compraRepository.buscarPorComprador(comprador);
    return compras
      .filter((compra) => !estado || compra.estado === estado)
      .toSorted((a, b) => b.fechaCompra - a.fechaCompra)
      .map((compra) => this.toDTO(compra, ahora));
  }

  async obtenerCompra(usuario, compraId, ahora = new Date()) {
    return this.toDetalleDTO(await this.buscarCompraVisiblePara(usuario, compraId), ahora);
  }

  // Una compra solo la pueden ver su comprador y el organizador del evento
  async buscarCompraVisiblePara(usuario, compraId) {
    const compra = await this.compraRepository.buscarPorId(compraId);
    if (!compra) {
      throw new NotFoundError(`La compra con id ${compraId} no existe`);
    }
    if (!compra.participa(usuario)) {
      throw new ForbiddenError("Solo el comprador y el organizador del evento pueden acceder a esta compra");
    }
    return compra;
  }
}
