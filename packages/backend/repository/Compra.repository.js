import { RepositorioEnMemoria } from "./RepositorioEnMemoria.js";
import { EstadoCompra } from "../domain/EstadoCompra.js";

export class CompraRepository extends RepositorioEnMemoria {
  async buscarPorComprador(comprador) {
    return this.buscarDonde((compra) => compra.esDe(comprador));
  }

  async buscarPorEvento(evento) {
    return this.buscarDonde((compra) => compra.evento === evento);
  }

  // Para el proceso que vence las compras que no se pagaron a tiempo
  async buscarPendientesAnterioresA(fecha) {
    return this.buscarDonde((compra) => compra.estado === EstadoCompra.PENDIENTE && compra.fechaCompra < fecha);
  }

  // Reseñas de todos los eventos de un organizador: es la reputación que ven los compradores
  async buscarReseniasDeOrganizador(organizador) {
    const compras = await this.buscarDonde(
      (compra) => compra.resenia !== null && compra.evento.estaOrganizadoPor(organizador),
    );
    return compras.map((compra) => compra.resenia);
  }
}
