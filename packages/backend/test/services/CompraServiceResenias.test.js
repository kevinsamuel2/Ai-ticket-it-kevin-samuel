import { jest } from "@jest/globals";
import { CompraService } from "../../services/Compra.service.js";
import { Compra } from "../../domain/Compra.js";
import { Evento } from "../../domain/Evento.js";
import { Usuario } from "../../domain/Usuario.js";
import { Categoria } from "../../domain/Categoria.js";
import { ForbiddenError } from "../../errors/ForbiddenError.js";
import { ConflictError } from "../../errors/ConflictError.js";

describe("CompraService: reseñas", () => {
  const ahora = new Date(2026, 10, 1, 12, 0);
  const diaDelEvento = new Date(2026, 10, 6, 18, 0);
  const usuario = (id, nombre) => Object.assign(new Usuario({ nombre, apellido: "Test" }), { id });
  const organizador = usuario(1, "Lucía");
  const comprador = usuario(2, "Juan");

  let compra;
  let compraRepository;
  let service;

  beforeEach(() => {
    const evento = new Evento({
      nombre: "Hamlet",
      descripcion: "Obra",
      categoria: new Categoria({ nombre: "Teatro" }),
      fecha: new Date(2026, 10, 6, 20, 0),
      organizador,
      tiposEntrada: [{ nombre: "Platea", precio: 20000, cupo: 10 }],
    });
    compra = Object.assign(
      new Compra({ comprador, evento, tipoEntrada: evento.buscarTipoEntrada(1), cantidad: 1 }, ahora),
      { id: 1 },
    );
    compra.confirmarPago(comprador, ahora);
    compraRepository = { buscarPorId: jest.fn().mockResolvedValue(compra), guardar: jest.fn(async (c) => c) };
    service = new CompraService({ compraRepository, eventoRepository: {} });
  });

  it("el comprador reseña después de usar la entrada y la reseña queda en el detalle", async () => {
    compra.marcarComoUtilizada(organizador, diaDelEvento);

    const dto = await service.reseniar(comprador, 1, { detalle: "Gran puesta", puntuacion: 4.5 }, diaDelEvento);

    expect(dto.resenia).toEqual({ detalle: "Gran puesta", puntuacion: 4.5, fecha: diaDelEvento });
    expect(dto.acciones.puedeReseniar).toBe(false);
    expect(compraRepository.guardar).toHaveBeenCalledWith(compra);
  });

  it("no se puede reseñar antes de usar la entrada", async () => {
    await expect(service.reseniar(comprador, 1, { detalle: "Bien", puntuacion: 4 }, ahora)).rejects.toThrow(
      ConflictError,
    );
    expect(compraRepository.guardar).not.toHaveBeenCalled();
  });

  it("el organizador no puede reseñar su propio evento", async () => {
    compra.marcarComoUtilizada(organizador, diaDelEvento);

    await expect(service.reseniar(organizador, 1, { detalle: "Excelente", puntuacion: 5 }, ahora)).rejects.toThrow(
      ForbiddenError,
    );
  });

  it("una compra sin reseña la muestra como null", async () => {
    expect((await service.obtenerCompra(comprador, 1, ahora)).resenia).toBeNull();
  });
});
