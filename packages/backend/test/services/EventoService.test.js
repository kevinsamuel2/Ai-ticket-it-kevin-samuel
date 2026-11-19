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

  const evento = (id, { nombre, categoria = recitales, dias, precio, organizador, lugar, ciudad }) =>
    Object.assign(
      new Evento({
        nombre,
        descripcion: `Descripción de ${nombre}`,
        categoria,
        fecha: enDias(dias),
        organizador,
        lugar,
        ciudad,
        multimedia: [`https://img/${id}.jpg`],
        tiposEntrada: [{ nombre: "General", precio, cupo: 10 }],
      }),
      { id },
    );

  const rock = evento(1, {
    nombre: "Rock",
    dias: 10,
    precio: 20000,
    organizador: bienPuntuado,
    lugar: "Estadio Obras",
    ciudad: "Buenos Aires",
  });
  const jazz = evento(2, {
    nombre: "Jazz",
    dias: 3,
    precio: 15000,
    organizador: malPuntuado,
    lugar: "Café Cultural",
    ciudad: "Córdoba",
  });
  const hamlet = evento(3, {
    nombre: "Esperando la carroza",
    categoria: teatro,
    dias: 5,
    precio: 30000,
    organizador: sinResenias,
    ciudad: "Buenos Aires",
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
  let usuarioRepository;
  let service;

  beforeEach(() => {
    eventoRepository = {
      buscarTodos: jest.fn().mockResolvedValue([rock, jazz, hamlet, pasado]),
      buscarPorId: jest.fn(),
    };
    compraRepository = {
      buscarReseniasDeOrganizador: jest.fn(async (organizador) => reseniasPorOrganizador.get(organizador)),
    };
    const usuarios = [bienPuntuado, malPuntuado, sinResenias];
    usuarioRepository = {
      buscarTodos: jest.fn().mockResolvedValue(usuarios),
      buscarPorId: jest.fn(async (id) => usuarios.find((u) => u.id === Number(id)) ?? null),
      guardar: jest.fn(async (usuario) => usuario),
    };
    service = new EventoService({ eventoRepository, compraRepository, usuarioRepository });
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

    it("filtra por ciudad sin distinguir mayúsculas ni tildes", async () => {
      expect(nombres(await service.buscarEventos({ ciudad: "cordoba" }, ahora))).toEqual(["Jazz"]);
      expect(nombres(await service.buscarEventos({ ciudad: "BUENOS AIRES" }, ahora))).toEqual([
        "Esperando la carroza",
        "Rock",
      ]);
      expect(nombres(await service.buscarEventos({ ciudad: "Rosario" }, ahora))).toEqual([]);
    });

    it("la búsqueda por texto también mira el lugar y la ciudad", async () => {
      expect(nombres(await service.buscarEventos({ texto: "estadio obras" }, ahora))).toEqual(["Rock"]);
      expect(nombres(await service.buscarEventos({ texto: "córdoba" }, ahora))).toEqual(["Jazz"]);
    });

    it("filtra por rango de fechas, con los dos extremos incluidos", async () => {
      const entre = (desde, hasta) => service.buscarEventos({ fechaDesde: desde, fechaHasta: hasta }, ahora);

      expect(nombres(await entre(enDias(4), enDias(10)))).toEqual(["Esperando la carroza", "Rock"]);
      expect(nombres(await entre(enDias(5), enDias(5)))).toEqual(["Esperando la carroza"]);
      expect(nombres(await entre(enDias(6), undefined))).toEqual(["Rock"]);
      expect(nombres(await entre(undefined, enDias(3)))).toEqual(["Jazz"]);
    });

    it("error si la fecha desde es posterior a la fecha hasta", async () => {
      await expect(service.buscarEventos({ fechaDesde: enDias(5), fechaHasta: enDias(1) }, ahora)).rejects.toThrow(
        ValidationError,
      );
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
        lugar: "Café Cultural",
        ciudad: "Córdoba",
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

  describe("listarCiudades", () => {
    it("devuelve las ciudades de los eventos próximos, sin repetir y en orden alfabético", async () => {
      expect(await service.listarCiudades(ahora)).toEqual(["Buenos Aires", "Córdoba"]);
    });

    it("ignora los eventos que ya se realizaron y los que no tienen ciudad", async () => {
      const sinCiudad = evento(5, { nombre: "Sin ciudad", dias: 2, precio: 1000, organizador: bienPuntuado });
      const viejo = evento(6, {
        nombre: "Viejo",
        dias: -2,
        precio: 1000,
        organizador: bienPuntuado,
        ciudad: "Rosario",
      });
      eventoRepository.buscarTodos.mockResolvedValue([rock, sinCiudad, viejo]);

      expect(await service.listarCiudades(ahora)).toEqual(["Buenos Aires"]);
    });
  });

  describe("organizadores seguidos", () => {
    const nuevoUsuario = (id, nombre) => Object.assign(new Usuario({ nombre, apellido: "Prueba" }), { id });

    it("seguir a un organizador lo guarda entre los seguidos del usuario", async () => {
      const seguidor = nuevoUsuario(9, "Nahuel");

      await service.seguirOrganizador(seguidor, 1);

      expect(seguidor.sigueA(bienPuntuado)).toBe(true);
      expect(usuarioRepository.guardar).toHaveBeenCalledWith(seguidor);
    });

    it("seguir y dejar de seguir son idempotentes", async () => {
      const seguidor = nuevoUsuario(10, "Otro");
      await service.seguirOrganizador(seguidor, 1);
      await service.seguirOrganizador(seguidor, 1);
      expect(seguidor.seguidos).toEqual([bienPuntuado]);

      await service.dejarDeSeguirOrganizador(seguidor, 1);
      await service.dejarDeSeguirOrganizador(seguidor, 1);
      expect(seguidor.seguidos).toEqual([]);
    });

    it("lanza NotFoundError si el organizador no existe", async () => {
      const seguidor = nuevoUsuario(9, "Nahuel");

      await expect(service.seguirOrganizador(seguidor, 99)).rejects.toThrow(NotFoundError);
      await expect(service.dejarDeSeguirOrganizador(seguidor, 99)).rejects.toThrow(NotFoundError);
    });

    it("nadie puede seguirse a sí mismo", async () => {
      await expect(service.seguirOrganizador(bienPuntuado, 1)).rejects.toThrow("No podés seguirte a vos mismo");
    });

    it("el detalle del evento cuenta los seguidores del organizador e indica si lo sigue quien lo mira", async () => {
      eventoRepository.buscarPorId.mockResolvedValue(rock);
      const lector = nuevoUsuario(11, "Lector");
      const otroSeguidor = nuevoUsuario(12, "Otro");
      lector.seguir(bienPuntuado);
      otroSeguidor.seguir(bienPuntuado);
      usuarioRepository.buscarTodos.mockResolvedValue([bienPuntuado, lector, otroSeguidor]);

      const comoLector = await service.obtenerEvento(1, ahora, lector);
      const sinSesion = await service.obtenerEvento(1, ahora);

      expect(comoLector.organizador).toMatchObject({ seguidores: 2, loSigo: true });
      expect(sinSesion.organizador).toMatchObject({ seguidores: 2, loSigo: false });
    });

    it("listarSeguidos devuelve los organizadores con su reputación y su cantidad de seguidores", async () => {
      const lector = nuevoUsuario(13, "Lector");
      lector.seguir(malPuntuado);
      usuarioRepository.buscarTodos.mockResolvedValue([lector, malPuntuado]);

      expect(await service.listarSeguidos(lector)).toEqual([
        { id: 2, nombreCompleto: "Gonzalo Pereyra", puntaje: 2, cantidadResenias: 1, seguidores: 1, loSigo: true },
      ]);
    });
  });
});
