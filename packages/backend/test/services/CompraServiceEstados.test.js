import { jest } from "@jest/globals";
import { CompraService } from "../../services/Compra.service.js";
import { Compra } from "../../domain/Compra.js";
import { Evento } from "../../domain/Evento.js";
import { Usuario } from "../../domain/Usuario.js";
import { Categoria } from "../../domain/Categoria.js";
import { ForbiddenError } from "../../errors/ForbiddenError.js";
import { ValidationError } from "../../errors/ValidationError.js";
import { ConflictError } from "../../errors/ConflictError.js";

describe("CompraService: cambios de estado", () => {
  const ahora = new Date(2026, 10, 1, 12, 0);
  const despuesDelEvento = new Date(2026, 10, 10, 12, 0);
  const usuario = (id, nombre) => Object.assign(new Usuario({ nombre, apellido: "Test" }), { id });
  const organizador = usuario(1, "Lucía");
  const comprador = usuario(2, "Juan");

  let evento;
  let compra;
  let compraRepository;
  let eventoRepository;
  let service;

  beforeEach(() => {
    evento = new Evento({
      nombre: "Hamlet",
      descripcion: "Obra",
      categoria: new Categoria({ nombre: "Teatro" }),
      fecha: new Date(2026, 10, 6, 20, 0),
      organizador,
      tiposEntrada: [{ nombre: "Platea", precio: 20000, cupo: 10 }],
    });
    compra = Object.assign(
      new Compra({ comprador, evento, tipoEntrada: evento.buscarTipoEntrada(1), cantidad: 4 }, ahora),
      { id: 1 },
    );
    compraRepository = { buscarPorId: jest.fn().mockResolvedValue(compra), guardar: jest.fn(async (c) => c) };
    eventoRepository = { guardar: jest.fn(async (e) => e) };
    service = new CompraService({ compraRepository, eventoRepository });
  });

  it("el comprador paga: la compra queda CONFIRMADA y se guarda", async () => {
    const dto = await service.cambiarEstado(comprador, 1, "CONFIRMADA", ahora);

    expect(dto.estado).toBe("CONFIRMADA");
    expect(dto.diasParaElEvento).toBe(5);
    expect(dto.historialEstados.map((h) => h.estado)).toEqual(["PENDIENTE", "CONFIRMADA"]);
    expect(compraRepository.guardar).toHaveBeenCalledWith(compra);
  });

  it("el comprador cancela una compra paga: queda REEMBOLSADA y se devuelve el cupo", async () => {
    await service.cambiarEstado(comprador, 1, "CONFIRMADA", ahora);

    const dto = await service.cambiarEstado(comprador, 1, "CANCELADA", ahora);

    expect(dto.estado).toBe("REEMBOLSADA");
    expect(evento.buscarTipoEntrada(1).disponibles()).toBe(10);
    expect(eventoRepository.guardar).toHaveBeenCalledWith(evento);
  });

  it("el organizador marca la entrada como utilizada", async () => {
    await service.cambiarEstado(comprador, 1, "CONFIRMADA", ahora);

    const dto = await service.cambiarEstado(organizador, 1, "UTILIZADA", ahora);

    expect(dto.estado).toBe("UTILIZADA");
    expect(dto.historialEstados.at(-1)).toMatchObject({ estado: "UTILIZADA", quien: "Lucía Test" });
  });

  it("cada rol solo puede pedir sus cambios de estado", async () => {
    await expect(service.cambiarEstado(organizador, 1, "CONFIRMADA", ahora)).rejects.toThrow(
      "Solo el comprador puede pagar la compra",
    );
    await expect(service.cambiarEstado(organizador, 1, "CANCELADA", ahora)).rejects.toThrow(ForbiddenError);
    await expect(service.cambiarEstado(comprador, 1, "UTILIZADA", ahora)).rejects.toThrow(
      "Solo el organizador puede marcar como utilizada la compra",
    );
  });

  it("no se pueden pedir estados que no son acciones (PENDIENTE, REEMBOLSADA)", async () => {
    await expect(service.cambiarEstado(comprador, 1, "REEMBOLSADA", ahora)).rejects.toThrow(ValidationError);
    await expect(service.cambiarEstado(comprador, 1, "PENDIENTE", ahora)).rejects.toThrow(
      "Solo se puede solicitar uno de estos estados: CONFIRMADA, CANCELADA, UTILIZADA",
    );
  });

  it("propaga las reglas del dominio y no guarda si la transición es inválida", async () => {
    await expect(service.cambiarEstado(organizador, 1, "UTILIZADA", ahora)).rejects.toThrow(ConflictError);
    await expect(service.cambiarEstado(comprador, 1, "CANCELADA", despuesDelEvento)).rejects.toThrow(
      "No se puede cancelar una compra de un evento que ya se realizó",
    );
    expect(compraRepository.guardar).not.toHaveBeenCalled();
  });

  describe("acciones disponibles en el detalle", () => {
    it("una compra pendiente: el comprador puede pagar o cancelar, el organizador no puede hacer nada", async () => {
      const comoComprador = await service.obtenerCompra(comprador, 1, ahora);
      const comoOrganizador = await service.obtenerCompra(organizador, 1, ahora);

      expect(comoComprador.acciones).toEqual({
        puedePagar: true,
        puedeCancelar: true,
        puedeMarcarComoUtilizada: false,
        puedeReseniar: false,
      });
      expect(Object.values(comoOrganizador.acciones).some(Boolean)).toBe(false);
    });

    it("una compra confirmada: el organizador puede marcarla como utilizada", async () => {
      compra.confirmarPago(comprador, ahora);

      const comoOrganizador = await service.obtenerCompra(organizador, 1, ahora);

      expect(comoOrganizador.acciones.puedeMarcarComoUtilizada).toBe(true);
    });

    it("una compra utilizada: el comprador ya no puede cancelar pero sí reseñar", async () => {
      compra.confirmarPago(comprador, ahora);
      compra.marcarComoUtilizada(organizador, ahora);

      const { acciones } = await service.obtenerCompra(comprador, 1, ahora);

      expect(acciones).toEqual({
        puedePagar: false,
        puedeCancelar: false,
        puedeMarcarComoUtilizada: false,
        puedeReseniar: true,
      });
    });
  });
});
