import { jest } from "@jest/globals";
import { ejecutarVencimientoDeCompras } from "../../jobs/vencimientoDeCompras.js";
import { CompraService } from "../../services/Compra.service.js";
import { CompraRepository } from "../../repository/Compra.repository.js";
import { Compra } from "../../domain/Compra.js";
import { Evento } from "../../domain/Evento.js";
import { Usuario } from "../../domain/Usuario.js";
import { Categoria } from "../../domain/Categoria.js";
import { EstadoCompra } from "../../domain/EstadoCompra.js";

describe("Cron job: vencimiento de compras pendientes", () => {
  const MINUTOS_PARA_PAGAR = 60;
  const ahora = new Date(2026, 10, 1, 12, 0);
  const haceMinutos = (minutos) => new Date(ahora.getTime() - minutos * 60 * 1000);

  let evento;
  let compraRepository;
  let eventoRepository;
  let service;
  let comprador;

  beforeEach(() => {
    comprador = Object.assign(new Usuario({ nombre: "Juan", apellido: "Gómez" }), { id: 2 });
    evento = new Evento({
      nombre: "Hamlet",
      descripcion: "Obra",
      categoria: new Categoria({ nombre: "Teatro" }),
      fecha: new Date(2026, 10, 10, 20, 0),
      organizador: Object.assign(new Usuario({ nombre: "Martín", apellido: "Sosa" }), { id: 1 }),
      tiposEntrada: [{ nombre: "Platea", precio: 20000, cupo: 10 }],
    });
    compraRepository = new CompraRepository();
    eventoRepository = { guardar: jest.fn(async (e) => e) };
    service = new CompraService({ compraRepository, eventoRepository });
  });

  const comprarHace = async (minutos, cantidad = 2) =>
    compraRepository.guardar(
      new Compra({ comprador, evento, tipoEntrada: evento.buscarTipoEntrada(1), cantidad }, haceMinutos(minutos)),
    );

  it("cancela solo las compras pendientes que superaron el plazo y libera su cupo", async () => {
    const vencida = await comprarHace(90);
    const enPlazo = await comprarHace(10);
    const pagada = await comprarHace(120);
    pagada.confirmarPago(comprador, haceMinutos(110));
    expect(evento.buscarTipoEntrada(1).disponibles()).toBe(4);

    const cantidad = await ejecutarVencimientoDeCompras(service, MINUTOS_PARA_PAGAR, ahora);

    expect(cantidad).toBe(1);
    expect(vencida.estado).toBe(EstadoCompra.CANCELADA);
    expect(enPlazo.estado).toBe(EstadoCompra.PENDIENTE);
    expect(pagada.estado).toBe(EstadoCompra.CONFIRMADA);
    expect(evento.buscarTipoEntrada(1).disponibles()).toBe(6);
    expect(eventoRepository.guardar).toHaveBeenCalledWith(evento);
  });

  it("el historial muestra que la canceló el sistema", async () => {
    const vencida = await comprarHace(90);
    await ejecutarVencimientoDeCompras(service, MINUTOS_PARA_PAGAR, ahora);

    const detalle = await service.obtenerCompra(comprador, vencida.id, ahora);

    expect(detalle.historialEstados.at(-1)).toEqual({ estado: "CANCELADA", quien: "Sistema", fechaHora: ahora });
  });

  it("si no hay nada para vencer no cambia nada", async () => {
    await comprarHace(5);

    await expect(ejecutarVencimientoDeCompras(service, MINUTOS_PARA_PAGAR, ahora)).resolves.toBe(0);
  });

  it("si la ejecución falla, registra el error y no lo propaga (no tira abajo el servidor)", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const serviceQueFalla = { vencerComprasPendientes: jest.fn().mockRejectedValue(new Error("se cayó algo")) };

    await expect(ejecutarVencimientoDeCompras(serviceQueFalla, MINUTOS_PARA_PAGAR, ahora)).resolves.toBe(0);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
