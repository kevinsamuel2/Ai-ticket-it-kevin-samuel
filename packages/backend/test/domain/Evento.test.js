import { Evento } from "../../domain/Evento.js";
import { Usuario } from "../../domain/Usuario.js";
import { Categoria } from "../../domain/Categoria.js";
import { TipoEntrada } from "../../domain/TipoEntrada.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { ConflictError } from "../../errors/ConflictError.js";

describe("Dominio: Evento", () => {
  const organizador = Object.assign(new Usuario({ nombre: "Florencia", apellido: "Acosta" }), { id: 1 });
  const recitales = new Categoria({ nombre: "Recitales" });

  const crearEvento = (cambios = {}) =>
    new Evento({
      nombre: "Noche de Rock",
      descripcion: "Bandas en vivo en el Teatro Gran Rex",
      categoria: recitales,
      fecha: "2026-12-05T21:00:00.000Z",
      organizador,
      tiposEntrada: [
        { nombre: "General", precio: 20000, cupo: 100 },
        { nombre: "VIP", precio: 60000, cupo: 10 },
      ],
      ...cambios,
    });

  describe("Constructor", () => {
    it("crea el evento con sus tipos de entrada numerados", () => {
      const evento = crearEvento();

      expect(evento.fecha).toBeInstanceOf(Date);
      expect(evento.tiposEntrada).toHaveLength(2);
      expect(evento.tiposEntrada[0]).toBeInstanceOf(TipoEntrada);
      expect(evento.tiposEntrada.map((t) => t.id)).toEqual([1, 2]);
      expect(evento.multimedia).toEqual([]);
    });

    it("error si faltan nombre, descripción, categoría u organizador", () => {
      expect(() => crearEvento({ nombre: "" })).toThrow("El evento debe tener un nombre");
      expect(() => crearEvento({ descripcion: undefined })).toThrow("El evento debe tener una descripción");
      expect(() => crearEvento({ categoria: null })).toThrow("El evento debe tener una categoría");
      expect(() => crearEvento({ organizador: undefined })).toThrow("El evento debe tener un organizador");
    });

    it("error si la fecha no es válida", () => {
      expect(() => crearEvento({ fecha: "mañana" })).toThrow("La fecha del evento no es válida");
    });

    it("error si no ofrece tipos de entrada", () => {
      expect(() => crearEvento({ tiposEntrada: [] })).toThrow("El evento debe ofrecer al menos un tipo de entrada");
      expect(() => crearEvento({ tiposEntrada: undefined })).toThrow(
        "El evento debe ofrecer al menos un tipo de entrada",
      );
    });

    it("error si dos tipos de entrada tienen el mismo nombre", () => {
      const tiposEntrada = [
        { nombre: "General", precio: 100, cupo: 1 },
        { nombre: "general", precio: 200, cupo: 1 },
      ];

      expect(() => crearEvento({ tiposEntrada })).toThrow("No puede haber dos tipos de entrada con el mismo nombre");
    });

    it("propaga el error de un tipo de entrada inválido", () => {
      expect(() => crearEvento({ tiposEntrada: [{ nombre: "General", precio: 100, cupo: 0 }] })).toThrow(
        'El cupo de "General" debe ser un número entero mayor a 0',
      );
    });

    it("error si el multimedia no es una lista de URLs", () => {
      expect(() => crearEvento({ multimedia: "foto.jpg" })).toThrow(
        "El material multimedia debe ser una lista de URLs",
      );
      expect(() => crearEvento({ multimedia: ["ok.jpg", ""] })).toThrow(
        "El material multimedia debe ser una lista de URLs",
      );
    });
  });

  describe("Fechas", () => {
    const ahora = new Date("2026-12-01T12:00:00.000Z");

    it("validarQueLaFechaSeaFutura falla si el evento ya pasó", () => {
      expect(() => crearEvento().validarQueLaFechaSeaFutura(ahora)).not.toThrow();
      expect(() => crearEvento({ fecha: "2026-11-30T21:00:00.000Z" }).validarQueLaFechaSeaFutura(ahora)).toThrow(
        "La fecha del evento tiene que ser posterior a la fecha actual",
      );
    });

    it("yaSeRealizo compara la fecha del evento con la actual", () => {
      expect(crearEvento().yaSeRealizo(ahora)).toBe(false);
      expect(crearEvento().yaSeRealizo(new Date("2026-12-06T00:00:00.000Z"))).toBe(true);
    });

    it("diasRestantes cuenta días calendario y no baja de cero", () => {
      const evento = crearEvento({ fecha: new Date(2026, 11, 5, 21, 0) });

      expect(evento.diasRestantes(new Date(2026, 11, 1, 23, 59))).toBe(4);
      expect(evento.diasRestantes(new Date(2026, 11, 5, 8, 0))).toBe(0);
      expect(evento.diasRestantes(new Date(2026, 11, 10))).toBe(0);
    });
  });

  describe("Tipos de entrada y precios", () => {
    it("buscarTipoEntrada encuentra por id (también si llega como texto)", () => {
      const evento = crearEvento();

      expect(evento.buscarTipoEntrada(2).nombre).toBe("VIP");
      expect(evento.buscarTipoEntrada("1").nombre).toBe("General");
    });

    it("buscarTipoEntrada lanza NotFoundError si no existe", () => {
      expect(() => crearEvento().buscarTipoEntrada(9)).toThrow(NotFoundError);
    });

    it("precioMinimo devuelve la entrada más barata", () => {
      expect(crearEvento().precioMinimo()).toBe(20000);
    });

    it("tuPrecioEstaEntre es true si algún tipo de entrada está en el rango", () => {
      const evento = crearEvento();

      expect(evento.tuPrecioEstaEntre(50000, 70000)).toBe(true);
      expect(evento.tuPrecioEstaEntre(0, 20000)).toBe(true);
      expect(evento.tuPrecioEstaEntre(25000, 50000)).toBe(false);
    });

    it("estaAgotado solo si se agotaron todos los tipos de entrada", () => {
      const evento = crearEvento();
      evento.buscarTipoEntrada(2).reservar(10);
      expect(evento.estaAgotado()).toBe(false);

      evento.buscarTipoEntrada(1).reservar(100);
      expect(evento.estaAgotado()).toBe(true);
    });
  });

  describe("Búsqueda y pertenencia", () => {
    it("coincideCon busca en nombre, descripción y categoría sin importar mayúsculas ni tildes", () => {
      const evento = crearEvento();

      expect(evento.coincideCon("rock")).toBe(true);
      expect(evento.coincideCon("gran rex")).toBe(true);
      expect(evento.coincideCon("RECITALES")).toBe(true);
      expect(crearEvento({ nombre: "Música clásica" }).coincideCon("musica")).toBe(true);
      expect(evento.coincideCon("teatro colón")).toBe(false);
    });

    it("esDeCategoria compara por nombre de categoría", () => {
      expect(crearEvento().esDeCategoria(new Categoria({ nombre: "recitales" }))).toBe(true);
      expect(crearEvento().esDeCategoria(new Categoria({ nombre: "Teatro" }))).toBe(false);
    });

    it("estaOrganizadoPor reconoce al organizador", () => {
      const otro = Object.assign(new Usuario({ nombre: "Nahuel", apellido: "Quiroga" }), { id: 2 });

      expect(crearEvento().estaOrganizadoPor(organizador)).toBe(true);
      expect(crearEvento().estaOrganizadoPor(otro)).toBe(false);
    });
  });

  describe("Finalización", () => {
    const antesDelEvento = new Date("2026-12-01T12:00:00.000Z");

    it("empieza sin finalizar y todavía no se realizó si falta para su fecha", () => {
      const evento = crearEvento();

      expect(evento.estaFinalizado()).toBe(false);
      expect(evento.yaSeRealizo(antesDelEvento)).toBe(false);
    });

    it("al finalizarlo cuenta como realizado aunque no haya llegado su fecha", () => {
      const evento = crearEvento();

      evento.finalizar(antesDelEvento);

      expect(evento.estaFinalizado()).toBe(true);
      expect(evento.finalizadoEn).toBe(antesDelEvento);
      expect(evento.yaSeRealizo(antesDelEvento)).toBe(true);
    });

    it("no se puede finalizar dos veces", () => {
      const evento = crearEvento();
      evento.finalizar(antesDelEvento);

      expect(() => evento.finalizar(antesDelEvento)).toThrow(ConflictError);
      expect(() => evento.finalizar(antesDelEvento)).toThrow("El evento ya fue finalizado");
    });
  });
});
