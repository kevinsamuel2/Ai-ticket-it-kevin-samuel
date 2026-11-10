import { jest } from "@jest/globals";
import { CompraService } from "../../services/Compra.service.js";
import { Compra } from "../../domain/Compra.js";
import { Evento } from "../../domain/Evento.js";
import { Usuario } from "../../domain/Usuario.js";
import { Categoria } from "../../domain/Categoria.js";
import { EstadoCompra } from "../../domain/EstadoCompra.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { ForbiddenError } from "../../errors/ForbiddenError.js";
import { ConflictError } from "../../errors/ConflictError.js";

describe("CompraService: comprar y consultar compras", () => {
  const ahora = new Date(2026, 10, 1, 12, 0);
  const usuario = (id, nombre) => Object.assign(new Usuario({ nombre, apellido: "Test" }), { id });
  const organizador = usuario(1, "Florencia");
  const comprador = usuario(2, "Nahuel");
  const otro = usuario(3, "Otro");

  let evento;
  let compraRepository;
  let eventoRepository;
  let service;

  beforeEach(() => {
    evento = Object.assign(
      new Evento({
        nombre: "Escalandrum en Bebop Club",
        descripcion: "Concierto",
        categoria: new Categoria({ nombre: "Recitales" }),
        fecha: new Date(2026, 10, 6, 20, 0),
        organizador,
        multimedia: ["https://img/jazz.jpg"],
        tiposEntrada: [
          { nombre: "General", precio: 15000, cupo: 80 },
          { nombre: "Mesa", precio: 30000, cupo: 3 },
        ],
      }),
      { id: 7 },
    );
    compraRepository = {
      guardar: jest.fn(async (compra) => Object.assign(compra, { id: compra.id ?? 100 })),
      buscarPorId: jest.fn(),
      buscarPorComprador: jest.fn(),
    };
    eventoRepository = {
      buscarPorId: jest.fn(async (id) => (Number(id) === 7 ? evento : null)),
      guardar: jest.fn(async (e) => e),
    };
    service = new CompraService({ compraRepository, eventoRepository });
  });

  describe("comprar", () => {
    it("crea una compra PENDIENTE, descuenta el cupo y guarda la compra y el evento", async () => {
      const dto = await service.comprar(comprador, { eventoId: 7, tipoEntradaId: 2, cantidad: 2 }, ahora);

      expect(compraRepository.guardar.mock.calls[0][0]).toBeInstanceOf(Compra);
      expect(eventoRepository.guardar).toHaveBeenCalledWith(evento);
      expect(evento.buscarTipoEntrada(2).disponibles()).toBe(1);
      expect(dto).toMatchObject({
        id: 100,
        estado: "PENDIENTE",
        cantidad: 2,
        total: 60000,
        diasParaElEvento: null,
        evento: { id: 7, nombre: "Escalandrum en Bebop Club", categoria: "Recitales", imagen: "https://img/jazz.jpg" },
        tipoEntrada: { id: 2, nombre: "Mesa", precio: 30000 },
        comprador: { id: 2, nombreCompleto: "Nahuel Test" },
        organizador: { id: 1, nombreCompleto: "Florencia Test" },
      });
      expect(dto.historialEstados).toEqual([{ estado: "PENDIENTE", quien: "Nahuel Test", fechaHora: ahora }]);
    });

    it("no permite superar el cupo disponible y no guarda nada", async () => {
      await expect(service.comprar(comprador, { eventoId: 7, tipoEntradaId: 2, cantidad: 4 }, ahora)).rejects.toThrow(
        ConflictError,
      );
      expect(compraRepository.guardar).not.toHaveBeenCalled();
      expect(evento.buscarTipoEntrada(2).disponibles()).toBe(3);
    });

    it("lanza NotFoundError si el evento o el tipo de entrada no existen", async () => {
      await expect(service.comprar(comprador, { eventoId: 99, tipoEntradaId: 1, cantidad: 1 }, ahora)).rejects.toThrow(
        "El evento con id 99 no existe",
      );
      await expect(service.comprar(comprador, { eventoId: 7, tipoEntradaId: 9, cantidad: 1 }, ahora)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("listarComprasDe", () => {
    const compraDe = (fechaCompra, cantidad = 1) => {
      const compra = new Compra({ comprador, evento, tipoEntrada: evento.buscarTipoEntrada(1), cantidad }, fechaCompra);
      return Object.assign(compra, { id: cantidad });
    };

    it("devuelve las compras del usuario, de la más reciente a la más antigua", async () => {
      const vieja = compraDe(new Date(2026, 9, 1), 1);
      const nueva = compraDe(new Date(2026, 9, 20), 2);
      compraRepository.buscarPorComprador.mockResolvedValue([vieja, nueva]);

      const compras = await service.listarComprasDe(comprador, {}, ahora);

      expect(compras.map((c) => c.id)).toEqual([2, 1]);
      expect(compraRepository.buscarPorComprador).toHaveBeenCalledWith(comprador);
    });

    it("informa cuántos días faltan solo para las compras confirmadas", async () => {
      const pendiente = compraDe(new Date(2026, 9, 1), 1);
      const confirmada = compraDe(new Date(2026, 9, 2), 2);
      confirmada.confirmarPago(comprador, ahora);
      compraRepository.buscarPorComprador.mockResolvedValue([pendiente, confirmada]);

      const compras = await service.listarComprasDe(comprador, {}, ahora);

      expect(compras.map((c) => [c.estado, c.diasParaElEvento])).toEqual([
        ["CONFIRMADA", 5],
        ["PENDIENTE", null],
      ]);
    });

    it("filtra por estado", async () => {
      const pendiente = compraDe(new Date(2026, 9, 1), 1);
      const confirmada = compraDe(new Date(2026, 9, 2), 2);
      confirmada.confirmarPago(comprador, ahora);
      compraRepository.buscarPorComprador.mockResolvedValue([pendiente, confirmada]);

      const compras = await service.listarComprasDe(comprador, { estado: EstadoCompra.PENDIENTE }, ahora);

      expect(compras.map((c) => c.id)).toEqual([1]);
    });
  });

  describe("obtenerCompra", () => {
    let compra;

    beforeEach(() => {
      compra = Object.assign(
        new Compra({ comprador, evento, tipoEntrada: evento.buscarTipoEntrada(1), cantidad: 1 }, ahora),
        { id: 5 },
      );
      compraRepository.buscarPorId.mockImplementation(async (id) => (Number(id) === 5 ? compra : null));
    });

    it("el comprador y el organizador pueden ver la compra con su historial", async () => {
      await expect(service.obtenerCompra(comprador, 5, ahora)).resolves.toMatchObject({ id: 5 });
      await expect(service.obtenerCompra(organizador, 5, ahora)).resolves.toHaveProperty("historialEstados");
    });

    it("otro usuario recibe ForbiddenError", async () => {
      await expect(service.obtenerCompra(otro, 5, ahora)).rejects.toThrow(ForbiddenError);
    });

    it("lanza NotFoundError si la compra no existe", async () => {
      await expect(service.obtenerCompra(comprador, 99, ahora)).rejects.toThrow("La compra con id 99 no existe");
    });
  });
});
