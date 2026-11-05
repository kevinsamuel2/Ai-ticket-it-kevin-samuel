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

export const MINUTOS_PARA_PAGAR_POR_DEFECTO = 24 * 60;

export class CompraService {
  // minutosParaPagar: plazo que tiene una compra PENDIENTE antes de que el cron job la cancele
  constructor({ compraRepository, eventoRepository, minutosParaPagar = MINUTOS_PARA_PAGAR_POR_DEFECTO }) {
    this.compraRepository = compraRepository;
    this.eventoRepository = eventoRepository;
    this.minutosParaPagar = minutosParaPagar;
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
      // Solo viene con valor si la compra está pendiente: pasado ese momento se cancela sola
      pagarAntesDe: compra.estado === EstadoCompra.PENDIENTE ? compra.venceEl(this.minutosParaPagar) : null,
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
      cantidadMensajes: compra.mensajes.length,
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
        // Sin usuario: lo hizo el sistema (vencimiento automático por falta de pago)
        quien: cambio.quien?.nombreCompleto() ?? "Sistema",
        fechaHora: cambio.fechaHora,
      })),
      resenia: compra.resenia && {
        detalle: compra.resenia.detalle,
        puntuacion: compra.resenia.puntuacion,
        fecha: compra.resenia.fecha,
      },
      acciones: {
        puedePagar: esComprador && compra.estado.puedePasarA(EstadoCompra.CONFIRMADA),
        puedeCancelar: esComprador && compra.puedeCancelarse(ahora),
        puedeMarcarComoUtilizada: esOrganizador && compra.puedeMarcarseComoUtilizada(ahora),
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

  // Vista del organizador: compras de su evento por estado y cuántas entradas quedan de cada tipo
  async listarComprasDeEvento(organizador, eventoId, { estado } = {}, ahora = new Date()) {
    const evento = await this.eventoRepository.buscarPorId(eventoId);
    if (!evento) {
      throw new NotFoundError(`El evento con id ${eventoId} no existe`);
    }
    if (!evento.estaOrganizadoPor(organizador)) {
      throw new ForbiddenError("Solo el organizador del evento puede ver sus compras");
    }

    const compras = await this.compraRepository.buscarPorEvento(evento);
    const cantidadPorEstado = Object.fromEntries(
      Object.keys(EstadoCompra).map((nombre) => [nombre, compras.filter((c) => c.estado.nombre === nombre).length]),
    );

    return {
      evento: { id: evento.id, nombre: evento.nombre, fecha: evento.fecha, yaSeRealizo: evento.yaSeRealizo(ahora) },
      disponibilidad: evento.tiposEntrada.map((tipo) => ({
        tipoEntrada: { id: tipo.id, nombre: tipo.nombre, precio: tipo.precio },
        cupo: tipo.cupo,
        // Incluye las compras pendientes de pago: el cupo queda reservado hasta que se paguen o venzan
        vendidas: tipo.vendidas,
        disponibles: tipo.disponibles(),
        agotado: tipo.estaAgotado(),
      })),
      cantidadPorEstado,
      compras: compras
        .filter((compra) => !estado || compra.estado === estado)
        .toSorted((a, b) => b.fechaCompra - a.fechaCompra)
        .map((compra) => this.toDTO(compra, ahora)),
    };
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

  // Una vez utilizada la entrada, el comprador puntúa el evento; la reseña suma a la reputación del organizador
  async reseniar(usuario, compraId, { detalle, puntuacion }, ahora = new Date()) {
    const compra = await this.buscarCompraVisiblePara(usuario, compraId);
    if (!ROLES.comprador(compra, usuario)) {
      throw new ForbiddenError("Solo el comprador puede reseñar el evento");
    }
    compra.reseniar({ detalle, puntuacion }, ahora);
    await this.compraRepository.guardar(compra);
    return this.toDetalleDTO(compra, usuario, ahora);
  }

  // Lo ejecuta el cron job: cancela las compras pendientes que superaron el plazo para pagar y libera su cupo.
  // Devuelve cuántas venció.
  async vencerComprasPendientes(ahora = new Date()) {
    const limite = new Date(ahora.getTime() - this.minutosParaPagar * 60 * 1000);
    const candidatas = await this.compraRepository.buscarPendientesAnterioresA(limite);
    const vencidas = candidatas.filter((compra) => compra.estaVencida(this.minutosParaPagar, ahora));

    for (const compra of vencidas) {
      compra.vencerPorFaltaDePago(ahora);
      await this.compraRepository.guardar(compra);
      await this.eventoRepository.guardar(compra.evento);
    }
    return vencidas.length;
  }

  // --- Chat de la compra ---

  // `esMio` le dice a la app de qué lado mostrar cada mensaje sin tener que comparar ids
  mensajeToDTO(compra, mensaje, usuario) {
    return {
      autor: {
        id: mensaje.usuario.id,
        nombreCompleto: mensaje.usuario.nombreCompleto(),
        rol: ROLES.comprador(compra, mensaje.usuario) ? "comprador" : "organizador",
      },
      mensaje: mensaje.mensaje,
      enviado: mensaje.enviado,
      esMio: mensaje.usuario.esElMismoQue(usuario),
    };
  }

  async listarMensajes(usuario, compraId) {
    const compra = await this.buscarCompraVisiblePara(usuario, compraId);
    return compra.mensajes.map((mensaje) => this.mensajeToDTO(compra, mensaje, usuario));
  }

  // Comprador y organizador pueden escribir en cualquier momento, sin importar el estado de la compra
  async enviarMensaje(usuario, compraId, texto, ahora = new Date()) {
    const compra = await this.buscarCompraVisiblePara(usuario, compraId);
    const mensaje = compra.enviarMensaje(usuario, texto, ahora);
    await this.compraRepository.guardar(compra);
    return this.mensajeToDTO(compra, mensaje, usuario);
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
