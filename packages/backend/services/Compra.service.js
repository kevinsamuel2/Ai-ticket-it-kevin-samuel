import { Compra } from "../domain/Compra.js";
import { EstadoCompra } from "../domain/EstadoCompra.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ForbiddenError } from "../errors/ForbiddenError.js";
import { ValidationError } from "../errors/ValidationError.js";

// Rol de cada participante de una compra
const ROLES = {
  comprador: (compra, usuario) => compra.esDe(usuario),
  organizador: (compra, usuario) => compra.evento.estaOrganizadoPor(usuario),
};

// Estados que se pueden pedir por la API, quién puede pedirlos y qué operación del dominio los resuelve.
// Cancelar se pide como CANCELADA; el dominio decide si queda CANCELADA o REEMBOLSADA (si ya estaba paga).
const CAMBIOS_DE_ESTADO = {
  CONFIRMADA: {
    rol: "comprador",
    accion: "pagar",
    aplicar: (compra, usuario, ahora) => compra.confirmarPago(usuario, ahora),
  },
  CANCELADA: {
    rol: "comprador",
    accion: "cancelar",
    aplicar: (compra, usuario, ahora) => compra.cancelar(usuario, ahora),
  },
  UTILIZADA: {
    rol: "organizador",
    accion: "marcar como utilizada",
    aplicar: (compra, usuario, ahora) => compra.marcarComoUtilizada(usuario, ahora),
  },
};
export const ESTADOS_SOLICITABLES = Object.keys(CAMBIOS_DE_ESTADO);

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

  // El detalle incluye qué puede hacer el usuario que la está viendo, así la app muestra solo los botones válidos
  toDetalleDTO(compra, usuario, ahora = new Date()) {
    const esComprador = ROLES.comprador(compra, usuario);
    const esOrganizador = ROLES.organizador(compra, usuario);
    return {
      ...this.toDTO(compra, ahora),
      historialEstados: compra.historialEstados.map((cambio) => ({
        estado: cambio.estado.nombre,
        quien: cambio.quien.nombreCompleto(),
        fechaHora: cambio.fechaHora,
      })),
      acciones: {
        puedePagar: esComprador && compra.estado.puedePasarA(EstadoCompra.CONFIRMADA),
        puedeCancelar: esComprador && compra.puedeCancelarse(ahora),
        puedeMarcarComoUtilizada: esOrganizador && compra.estado.puedePasarA(EstadoCompra.UTILIZADA),
        puedeReseniar: esComprador && compra.puedeReseniarse(),
      },
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
    return this.toDetalleDTO(compra, comprador, ahora);
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
    return this.toDetalleDTO(await this.buscarCompraVisiblePara(usuario, compraId), usuario, ahora);
  }

  // Pagar (CONFIRMADA) y cancelar (CANCELADA) los pide el comprador; usar la entrada (UTILIZADA), el organizador
  async cambiarEstado(usuario, compraId, nombreEstado, ahora = new Date()) {
    const compra = await this.buscarCompraVisiblePara(usuario, compraId);
    const cambio = CAMBIOS_DE_ESTADO[nombreEstado];
    if (!cambio) {
      throw new ValidationError(`Solo se puede solicitar uno de estos estados: ${ESTADOS_SOLICITABLES.join(", ")}`);
    }
    if (!ROLES[cambio.rol](compra, usuario)) {
      throw new ForbiddenError(`Solo el ${cambio.rol} puede ${cambio.accion} la compra`);
    }

    cambio.aplicar(compra, usuario, ahora);
    await this.compraRepository.guardar(compra);
    // Cancelar devuelve el cupo al tipo de entrada
    await this.eventoRepository.guardar(compra.evento);
    return this.toDetalleDTO(compra, usuario, ahora);
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
