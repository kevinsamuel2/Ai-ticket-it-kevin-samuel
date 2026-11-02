import { jest } from "@jest/globals";
import { CompraService } from "../../services/Compra.service.js";
import { Compra } from "../../domain/Compra.js";
import { Evento } from "../../domain/Evento.js";
import { Usuario } from "../../domain/Usuario.js";
import { Categoria } from "../../domain/Categoria.js";
import { ForbiddenError } from "../../errors/ForbiddenError.js";
import { UnprocessableEntityError } from "../../errors/UnprocessableEntityError.js";

describe("CompraService: chat de la compra", () => {
  const ahora = new Date(2026, 10, 1, 12, 0);
  const usuario = (id, nombre) => Object.assign(new Usuario({ nombre, apellido: "Test" }), { id });
  const organizador = usuario(1, "Lucía");
  const comprador = usuario(2, "Juan");
  const otro = usuario(3, "Otro");

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
    compraRepository = { buscarPorId: jest.fn().mockResolvedValue(compra), guardar: jest.fn(async (c) => c) };
    service = new CompraService({ compraRepository, eventoRepository: {} });
  });

  it("el comprador envía un mensaje y el organizador lo responde", async () => {
    const pregunta = await service.enviarMensaje(comprador, 1, "¿Hay estacionamiento?", ahora);
    const respuesta = await service.enviarMensaje(organizador, 1, "Sí, en la cochera de enfrente", ahora);

    expect(pregunta).toEqual({
      autor: { id: 2, nombreCompleto: "Juan Test", rol: "comprador" },
      mensaje: "¿Hay estacionamiento?",
      enviado: ahora,
      esMio: true,
    });
    expect(respuesta.autor.rol).toBe("organizador");
    expect(compraRepository.guardar).toHaveBeenCalledTimes(2);
  });

  it("listarMensajes marca como propios los mensajes del usuario que consulta", async () => {
    compra.enviarMensaje(comprador, "Hola", ahora);
    compra.enviarMensaje(organizador, "¡Hola!", ahora);

    const vistosPorElComprador = await service.listarMensajes(comprador, 1);
    const vistosPorElOrganizador = await service.listarMensajes(organizador, 1);

    expect(vistosPorElComprador.map((m) => m.esMio)).toEqual([true, false]);
    expect(vistosPorElOrganizador.map((m) => m.esMio)).toEqual([false, true]);
  });

  it("se puede escribir aunque la compra esté cancelada", async () => {
    compra.cancelar(comprador, ahora);

    await expect(service.enviarMensaje(comprador, 1, "¿Cuándo vuelve la obra?", ahora)).resolves.toHaveProperty(
      "mensaje",
    );
  });

  it("otro usuario no puede leer ni escribir en el chat", async () => {
    await expect(service.listarMensajes(otro, 1)).rejects.toThrow(ForbiddenError);
    await expect(service.enviarMensaje(otro, 1, "Hola", ahora)).rejects.toThrow(ForbiddenError);
  });

  it("un mensaje vacío no se guarda", async () => {
    await expect(service.enviarMensaje(comprador, 1, "   ", ahora)).rejects.toThrow(UnprocessableEntityError);
    expect(compraRepository.guardar).not.toHaveBeenCalled();
  });
});
