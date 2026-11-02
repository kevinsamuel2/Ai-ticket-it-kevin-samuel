import { jest } from "@jest/globals";
import { EventoService } from "../../services/Evento.service.js";
import { Evento } from "../../domain/Evento.js";
import { Usuario } from "../../domain/Usuario.js";
import { Categoria } from "../../domain/Categoria.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { ValidationError } from "../../errors/ValidationError.js";
import { UnprocessableEntityError } from "../../errors/UnprocessableEntityError.js";

describe("EventoService: crear evento y eventos de un organizador", () => {
  const ahora = new Date(2026, 10, 1, 12, 0);
  const organizador = Object.assign(new Usuario({ nombre: "Lucía", apellido: "Fernández" }), { id: 1 });
  const teatro = Object.assign(new Categoria({ nombre: "Teatro" }), { id: 2 });

  const datosValidos = {
    nombre: "Hamlet",
    descripcion: "Obra de Shakespeare",
    categoriaId: 2,
    fecha: "2026-12-10T20:30:00.000Z",
    multimedia: ["https://img/hamlet.jpg"],
    tiposEntrada: [
      { nombre: "Platea", precio: 22000, cupo: 100 },
      { nombre: "Pullman", precio: 16000, cupo: 50 },
    ],
  };

  let repos;
  let service;

  beforeEach(() => {
    const guardados = new Map();
    repos = {
      categoriaRepository: { buscarPorId: jest.fn(async (id) => (Number(id) === 2 ? teatro : null)) },
      eventoRepository: {
        guardar: jest.fn(async (evento) => {
          evento.id = 10;
          guardados.set(10, evento);
          return evento;
        }),
        buscarPorId: jest.fn(async (id) => guardados.get(Number(id)) ?? null),
        buscarPorOrganizador: jest.fn(),
      },
      compraRepository: { buscarReseniasDeOrganizador: jest.fn().mockResolvedValue([]) },
      usuarioRepository: { buscarPorId: jest.fn(async (id) => (Number(id) === 1 ? organizador : null)) },
    };
    service = new EventoService(repos);
  });

  describe("crearEvento", () => {
    it("guarda un Evento con el usuario como organizador y devuelve su detalle", async () => {
      const detalle = await service.crearEvento(organizador, datosValidos, ahora);

      const [eventoGuardado] = repos.eventoRepository.guardar.mock.calls[0];
      expect(eventoGuardado).toBeInstanceOf(Evento);
      expect(eventoGuardado.organizador).toBe(organizador);
      expect(eventoGuardado.categoria).toBe(teatro);
      expect(detalle).toMatchObject({ id: 10, nombre: "Hamlet", categoria: "Teatro", precioMinimo: 16000 });
      expect(detalle.tiposEntrada.map((t) => [t.id, t.nombre, t.disponibles])).toEqual([
        [1, "Platea", 100],
        [2, "Pullman", 50],
      ]);
    });

    it("error si falta la categoría o no existe, sin guardar nada", async () => {
      const sinCategoria = { ...datosValidos, categoriaId: undefined };

      await expect(service.crearEvento(organizador, sinCategoria, ahora)).rejects.toThrow(ValidationError);
      await expect(service.crearEvento(organizador, { ...datosValidos, categoriaId: 99 }, ahora)).rejects.toThrow(
        NotFoundError,
      );
      expect(repos.eventoRepository.guardar).not.toHaveBeenCalled();
    });

    it("error si la fecha ya pasó, sin guardar nada", async () => {
      const enElPasado = { ...datosValidos, fecha: "2026-10-01T20:00:00.000Z" };

      await expect(service.crearEvento(organizador, enElPasado, ahora)).rejects.toThrow(
        "La fecha del evento tiene que ser posterior a la fecha actual",
      );
      expect(repos.eventoRepository.guardar).not.toHaveBeenCalled();
    });

    it("propaga las validaciones del dominio (ej: sin tipos de entrada)", async () => {
      await expect(service.crearEvento(organizador, { ...datosValidos, tiposEntrada: [] }, ahora)).rejects.toThrow(
        UnprocessableEntityError,
      );
    });
  });

  describe("listarEventosDeOrganizador", () => {
    it("devuelve sus eventos ordenados por fecha", async () => {
      const crear = (nombre, fecha) => new Evento({ ...datosValidos, nombre, fecha, categoria: teatro, organizador });
      repos.eventoRepository.buscarPorOrganizador.mockResolvedValue([
        crear("Segundo", "2026-12-20T20:00:00.000Z"),
        crear("Primero", "2026-12-01T20:00:00.000Z"),
      ]);

      const eventos = await service.listarEventosDeOrganizador(1, ahora);

      expect(eventos.map((e) => e.nombre)).toEqual(["Primero", "Segundo"]);
      expect(repos.eventoRepository.buscarPorOrganizador).toHaveBeenCalledWith(organizador);
    });

    it("lanza NotFoundError si el usuario no existe", async () => {
      await expect(service.listarEventosDeOrganizador(99, ahora)).rejects.toThrow("El usuario con id 99 no existe");
    });
  });
});
