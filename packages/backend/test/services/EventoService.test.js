import { jest } from "@jest/globals";
import { EventoService } from "../../services/Evento.service.js";
import { Evento } from "../../domain/Evento.js";
import { Usuario } from "../../domain/Usuario.js";
import { Categoria } from "../../domain/Categoria.js";
import { Resenia } from "../../domain/Resenia.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { ValidationError } from "../../errors/ValidationError.js";

describe("EventoService", () => {
  const ahora = new Date(2026, 10, 1, 12, 0);
  const enDias = (dias) => new Date(2026, 10, 1 + dias, 21, 0);

  const bienPuntuado = Object.assign(new Usuario({ nombre: "Florencia", apellido: "Acosta" }), { id: 1 });
  const malPuntuado = Object.assign(new Usuario({ nombre: "Gonzalo", apellido: "Pereyra" }), { id: 2 });
  const sinResenias = Object.assign(new Usuario({ nombre: "Nuevo", apellido: "Organizador" }), { id: 3 });
  const recitales = new Categoria({ nombre: "Recitales" });
  const teatro = new Categoria({ nombre: "Teatro" });

  const evento = (id, { nombre, categoria = recitales, dias, precio, organizador }) =>
    Object.assign(
      new Evento({
        nombre,
        descripcion: `Descripción de ${nombre}`,
        categoria,
        fecha: enDias(dias),
        organizador,
        multimedia: [`https://img/${id}.jpg`],
        tiposEntrada: [{ nombre: "General", precio, cupo: 10 }],
      }),
      { id },
    );

  const rock = evento(1, { nombre: "Rock", dias: 10, precio: 20000, organizador: bienPuntuado });
  const jazz = evento(2, { nombre: "Jazz", dias: 3, precio: 15000, organizador: malPuntuado });
  const hamlet = evento(3, {
    nombre: "Esperando la carroza",
    categoria: teatro,
    dias: 5,
    precio: 30000,
    organizador: sinResenias,
  });
  const pasado = evento(4, { nombre: "Rock viejo", dias: -5, precio: 5000, organizador: bienPuntuado });

  const resenia = (organizador, puntuacion) =>
    new Resenia({
      comprador: Object.assign(new Usuario({ nombre: "Nahuel", apellido: "Quiroga" }), { id: 9 }),
      evento: { id: 4, nombre: "Rock viejo", organizador },
      detalle: "Comentario",
      puntuacion,
      fecha: enDias(-4),
    });
  const reseniasPorOrganizador = new Map([
    [bienPuntuado, [resenia(bienPuntuado, 5), resenia(bienPuntuado, 4)]],
    [malPuntuado, [resenia(malPuntuado, 2)]],
    [sinResenias, []],
  ]);

  let eventoRepository;
  let compraRepository;
  let service;

  beforeEach(() => {
    eventoRepository = {
      buscarTodos: jest.fn().mockResolvedValue([rock, jazz, hamlet, pasado]),
      buscarPorId: jest.fn(),
    };
    compraRepository = {
      buscarReseniasDeOrganizador: jest.fn(async (organizador) => reseniasPorOrganizador.get(organizador)),
    };
    service = new EventoService({ eventoRepository, compraRepository });
  });

  const nombres = (resultado) => resultado.items.map((e) => e.nombre);

  describe("buscarEventos", () => {
    it("por defecto lista solo eventos futuros ordenados por fecha", async () => {
      const resultado = await service.buscarEventos({}, ahora);

      expect(nombres(resultado)).toEqual(["Jazz", "Esperando la carroza", "Rock"]);
      expect(resultado).toMatchObject({ page: 1, limit: 10, total: 3, totalPages: 1 });
    });

    it("incluirPasados agrega los eventos que ya se realizaron", async () => {
      const resultado = await service.buscarEventos({ incluirPasados: true }, ahora);

      expect(nombres(resultado)).toEqual(["Rock viejo", "Jazz", "Esperando la carroza", "Rock"]);
    });

    it("filtra por texto y por categoría", async () => {
      expect(nombres(await service.buscarEventos({ texto: "rock" }, ahora))).toEqual(["Rock"]);
      expect(nombres(await service.buscarEventos({ categoria: "teatro" }, ahora))).toEqual(["Esperando la carroza"]);
    });

    it("filtra por rango de precio", async () => {
      const resultado = await service.buscarEventos({ precioMinimo: 16000, precioMaximo: 25000 }, ahora);

      expect(nombres(resultado)).toEqual(["Rock"]);
    });

    it("error si el precio mínimo es mayor al máximo", async () => {
      await expect(service.buscarEventos({ precioMinimo: 10, precioMaximo: 5 }, ahora)).rejects.toThrow(
        ValidationError,
      );
    });

    it("ordena por precio ascendente o descendente", async () => {
      expect(nombres(await service.buscarEventos({ orden: "precio" }, ahora))).toEqual([
        "Jazz",
        "Rock",
        "Esperando la carroza",
      ]);
      expect(nombres(await service.buscarEventos({ orden: "precio", direccion: "desc" }, ahora))).toEqual([
        "Esperando la carroza",
        "Rock",
        "Jazz",
      ]);
    });

    it("ordena por puntaje del organizador, de mayor a menor, con los organizadores sin reseñas al final", async () => {
      const resultado = await service.buscarEventos({ orden: "puntaje" }, ahora);

      expect(nombres(resultado)).toEqual(["Rock", "Jazz", "Esperando la carroza"]);
      expect(resultado.items.map((e) => e.organizador.puntaje)).toEqual([4.5, 2, null]);
    });

    it("calcula la reputación una sola vez por organizador", async () => {
      await service.buscarEventos({ incluirPasados: true }, ahora);

      expect(compraRepository.buscarReseniasDeOrganizador).toHaveBeenCalledTimes(3);
    });

    it("pagina los resultados", async () => {
      const resultado = await service.buscarEventos({ page: 2, limit: 2 }, ahora);

      expect(nombres(resultado)).toEqual(["Rock"]);
      expect(resultado).toMatchObject({ page: 2, limit: 2, total: 3, totalPages: 2 });
    });

    it("devuelve un resumen de cada evento", async () => {
      const [primero] = (await service.buscarEventos({ texto: "jazz" }, ahora)).items;

      expect(primero).toEqual({
        id: 2,
        nombre: "Jazz",
        categoria: "Recitales",
        fecha: enDias(3),
        imagen: "https://img/2.jpg",
        precioMinimo: 15000,
        agotado: false,
        yaSeRealizo: false,
        finalizado: false,
        organizador: { id: 2, nombreCompleto: "Gonzalo Pereyra", puntaje: 2, cantidadResenias: 1 },
      });
    });
  });

  describe("obtenerEvento", () => {
    it("devuelve el detalle con tipos de entrada y las reseñas del organizador", async () => {
      eventoRepository.buscarPorId.mockResolvedValue(rock);
      rock.buscarTipoEntrada(1).reservar(4);

      const detalle = await service.obtenerEvento(1, ahora);

      expect(detalle).toMatchObject({ id: 1, nombre: "Rock", descripcion: "Descripción de Rock" });
      expect(detalle.tiposEntrada).toEqual([
        { id: 1, nombre: "General", descripcion: "", precio: 20000, cupo: 10, disponibles: 6, agotado: false },
      ]);
      expect(detalle.organizador.puntaje).toBe(4.5);
      expect(detalle.reseniasOrganizador).toHaveLength(2);
      expect(detalle.reseniasOrganizador[0]).toEqual({
        evento: { id: 4, nombre: "Rock viejo" },
        comprador: "Nahuel Quiroga",
        detalle: "Comentario",
        puntuacion: 5,
        fecha: enDias(-4),
      });
    });

    it("lanza NotFoundError si el evento no existe", async () => {
      eventoRepository.buscarPorId.mockResolvedValue(null);

      await expect(service.obtenerEvento(99)).rejects.toThrow(NotFoundError);
    });
  });
});
