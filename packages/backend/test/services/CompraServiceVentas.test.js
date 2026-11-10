import { jest } from "@jest/globals";
import { CompraService } from "../../services/Compra.service.js";
import { Compra } from "../../domain/Compra.js";
import { Evento } from "../../domain/Evento.js";
import { Usuario } from "../../domain/Usuario.js";
import { Categoria } from "../../domain/Categoria.js";
import { EstadoCompra } from "../../domain/EstadoCompra.js";
import { ForbiddenError } from "../../errors/ForbiddenError.js";

describe("CompraService: compras de un evento (vista del organizador)", () => {
  const ahora = new Date(2026, 10, 1, 12, 0);
  const usuario = (id, nombre) => Object.assign(new Usuario({ nombre, apellido: "Test" }), { id });
  const organizador = usuario(1, "Florencia");
  const nahuel = usuario(2, "Nahuel");
  const agustina = usuario(3, "Agustina");

  let evento;
  let compras;
  let service;

  beforeEach(() => {
    evento = Object.assign(
      new Evento({
        nombre: "Noche de Rock",
        descripcion: "Recital",
        categoria: new Categoria({ nombre: "Recitales" }),
        fecha: new Date(2026, 10, 20, 21, 0),
        organizador,
        tiposEntrada: [
          { nombre: "General", precio: 25000, cupo: 100 },
          { nombre: "VIP", precio: 60000, cupo: 2 },
        ],
      }),
      { id: 1 },
    );
    const comprar = (comprador, tipo, cantidad, dia) =>
      new Compra({ comprador, evento, tipoEntrada: evento.buscarTipoEntrada(tipo), cantidad }, new Date(2026, 9, dia));

    const pendiente = Object.assign(comprar(nahuel, 1, 3, 1), { id: 1 });
    const confirmada = Object.assign(comprar(agustina, 2, 2, 2), { id: 2 });
    confirmada.confirmarPago(agustina, ahora);
    const cancelada = Object.assign(comprar(nahuel, 1, 5, 3), { id: 3 });
    cancelada.cancelar(nahuel, ahora);
    compras = [pendiente, confirmada, cancelada];

    service = new CompraService({
      compraRepository: { buscarPorEvento: jest.fn().mockResolvedValue(compras) },
      eventoRepository: { buscarPorId: jest.fn(async (id) => (Number(id) === 1 ? evento : null)) },
    });
  });

  it("informa cuántas entradas quedan disponibles de cada tipo", async () => {
    const { disponibilidad } = await service.listarComprasDeEvento(organizador, 1, {}, ahora);

    expect(disponibilidad).toEqual([
      {
        tipoEntrada: { id: 1, nombre: "General", precio: 25000 },
        cupo: 100,
        vendidas: 3,
        disponibles: 97,
        agotado: false,
      },
      { tipoEntrada: { id: 2, nombre: "VIP", precio: 60000 }, cupo: 2, vendidas: 2, disponibles: 0, agotado: true },
    ]);
  });

  it("cuenta las compras por estado e incluye todos los estados", async () => {
    const { cantidadPorEstado } = await service.listarComprasDeEvento(organizador, 1, {}, ahora);

    expect(cantidadPorEstado).toEqual({ PENDIENTE: 1, CONFIRMADA: 1, UTILIZADA: 0, CANCELADA: 1, REEMBOLSADA: 0 });
  });

  it("lista las compras de la más reciente a la más antigua y permite filtrar por estado", async () => {
    const todas = await service.listarComprasDeEvento(organizador, 1, {}, ahora);
    const confirmadas = await service.listarComprasDeEvento(organizador, 1, { estado: EstadoCompra.CONFIRMADA }, ahora);

    expect(todas.compras.map((c) => c.id)).toEqual([3, 2, 1]);
    expect(confirmadas.compras.map((c) => [c.id, c.comprador.nombreCompleto])).toEqual([[2, "Agustina Test"]]);
  });

  it("solo el organizador del evento puede ver sus compras", async () => {
    await expect(service.listarComprasDeEvento(nahuel, 1, {}, ahora)).rejects.toThrow(ForbiddenError);
    await expect(service.listarComprasDeEvento(organizador, 99, {}, ahora)).rejects.toThrow(
      "El evento con id 99 no existe",
    );
  });
});
