// Registro histórico de cada cambio de estado de una compra: quién lo hizo y cuándo
export class CambioEstadoCompra {
  constructor({ compra, estado, quien, fechaHora = new Date() }) {
    this.compra = compra;
    this.estado = estado;
    this.quien = quien;
    this.fechaHora = fechaHora;
  }
}
