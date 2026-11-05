import { Compra } from "../../domain/Compra.js";
import { Evento } from "../../domain/Evento.js";
import { Usuario } from "../../domain/Usuario.js";
import { Categoria } from "../../domain/Categoria.js";
import { TipoEntrada } from "../../domain/TipoEntrada.js";
import { EstadoCompra } from "../../domain/EstadoCompra.js";
import { CambioEstadoCompra } from "../../domain/CambioEstadoCompra.js";
import { ConflictError } from "../../errors/ConflictError.js";

describe("Dominio: Compra", () => {
  const ahora = new Date(2026, 11, 1, 12, 0);
  const antesDelEvento = new Date(2026, 11, 3, 12, 0);
  const diaDelEvento = new Date(2026, 11, 5, 18, 0);
  const despuesDelEvento = new Date(2026, 11, 6, 12, 0);

  let organizador;
  let comprador;
  let evento;
  let platea;

  beforeEach(() => {
    organizador = Object.assign(new Usuario({ nombre: "Lucía", apellido: "Pérez" }), { id: 1 });
    comprador = Object.assign(new Usuario({ nombre: "Juan", apellido: "Gómez" }), { id: 2 });
    evento = new Evento({
      nombre: "Hamlet",
      descripcion: "Obra de teatro clásica",
      categoria: new Categoria({ nombre: "Teatro" }),
      fecha: new Date(2026, 11, 5, 20, 0),
      organizador,
      tiposEntrada: [
        { nombre: "General", precio: 10000, cupo: 50 },
        { nombre: "Platea", precio: 18000, cupo: 4 },
      ],
    });
    platea = evento.buscarTipoEntrada(2);
  });

  const comprar = (cantidad = 2) => new Compra({ comprador, evento, tipoEntrada: platea, cantidad }, ahora);

  describe("Constructor", () => {
    it("queda PENDIENTE, calcula el total y reserva el cupo", () => {
      const compra = comprar(3);

      expect(compra.estado).toBe(EstadoCompra.PENDIENTE);
      expect(compra.total).toBe(54000);
      expect(compra.fechaCompra).toBe(ahora);
      expect(platea.disponibles()).toBe(1);
    });

    it("registra el estado inicial en el historial", () => {
      const compra = comprar();

      expect(compra.historialEstados).toHaveLength(1);
      expect(compra.historialEstados[0]).toBeInstanceOf(CambioEstadoCompra);
      expect(compra.historialEstados[0]).toMatchObject({ compra, estado: EstadoCompra.PENDIENTE, quien: comprador });
    });

    it("no permite superar el cupo disponible", () => {
      comprar(3);

      expect(() => comprar(2)).toThrow(ConflictError);
      expect(platea.disponibles()).toBe(1);
    });

    it("error si la cantidad no es un entero positivo", () => {
      expect(() => comprar(0)).toThrow("La cantidad de entradas debe ser un número entero mayor a 0");
      expect(() => comprar(1.5)).toThrow("La cantidad de entradas debe ser un número entero mayor a 0");
    });

    it("error si el tipo de entrada es de otro evento", () => {
      const ajeno = new TipoEntrada({ nombre: "VIP", precio: 1, cupo: 1 });

      expect(() => new Compra({ comprador, evento, tipoEntrada: ajeno, cantidad: 1 }, ahora)).toThrow(
        'El tipo de entrada "VIP" no pertenece al evento',
      );
    });

    it("error si el evento ya se realizó", () => {
      expect(() => new Compra({ comprador, evento, tipoEntrada: platea, cantidad: 1 }, despuesDelEvento)).toThrow(
        "No se pueden comprar entradas para un evento que ya se realizó",
      );
    });

    it("el organizador no puede comprar entradas de su propio evento", () => {
      expect(() => new Compra({ comprador: organizador, evento, tipoEntrada: platea, cantidad: 1 }, ahora)).toThrow(
        "No podés comprar entradas de un evento que organizás vos",
      );
      expect(platea.disponibles()).toBe(4);
    });

    it("error si falta el comprador", () => {
      expect(() => new Compra({ evento, tipoEntrada: platea, cantidad: 1 }, ahora)).toThrow(
        "La compra debe tener un comprador",
      );
    });
  });

  describe("actualizarEstado", () => {
    it("confirmar el pago y usar la entrada registra cada cambio en el historial", () => {
      const compra = comprar();

      compra.confirmarPago(comprador, ahora);
      compra.marcarComoUtilizada(organizador, diaDelEvento);

      expect(compra.estado).toBe(EstadoCompra.UTILIZADA);
      expect(compra.historialEstados.map((c) => c.estado)).toEqual([
        EstadoCompra.PENDIENTE,
        EstadoCompra.CONFIRMADA,
        EstadoCompra.UTILIZADA,
      ]);
      expect(compra.historialEstados[2]).toMatchObject({ quien: organizador, fechaHora: diaDelEvento });
    });

    it("la entrada se puede marcar como utilizada recién el día del evento", () => {
      const compra = comprar();
      compra.confirmarPago(comprador, ahora);

      expect(compra.puedeMarcarseComoUtilizada(antesDelEvento)).toBe(false);
      expect(() => compra.marcarComoUtilizada(organizador, antesDelEvento)).toThrow(
        "La entrada se puede marcar como utilizada recién el día del evento",
      );
      expect(compra.estado).toBe(EstadoCompra.CONFIRMADA);
      expect(compra.puedeCancelarse(antesDelEvento)).toBe(true);

      expect(compra.puedeMarcarseComoUtilizada(new Date(2026, 11, 5, 0, 0))).toBe(true);
    });

    it("rechaza transiciones inválidas sin modificar la compra", () => {
      const compra = comprar();

      expect(() => compra.marcarComoUtilizada(organizador)).toThrow("Una compra PENDIENTE no puede pasar a UTILIZADA");
      expect(compra.estado).toBe(EstadoCompra.PENDIENTE);
      expect(compra.historialEstados).toHaveLength(1);
    });
  });

  describe("Cancelación", () => {
    it("cancelar una compra pendiente la deja CANCELADA y devuelve el cupo", () => {
      const compra = comprar(3);

      compra.cancelar(comprador, antesDelEvento);

      expect(compra.estado).toBe(EstadoCompra.CANCELADA);
      expect(platea.disponibles()).toBe(4);
    });

    it("cancelar una compra confirmada la deja REEMBOLSADA y devuelve el cupo", () => {
      const compra = comprar(3);
      compra.confirmarPago(comprador, ahora);

      compra.cancelar(comprador, antesDelEvento);

      expect(compra.estado).toBe(EstadoCompra.REEMBOLSADA);
      expect(platea.disponibles()).toBe(4);
    });

    it("no se puede cancelar una compra utilizada", () => {
      const compra = comprar();
      compra.confirmarPago(comprador, ahora);
      compra.marcarComoUtilizada(organizador, diaDelEvento);

      expect(compra.puedeCancelarse(antesDelEvento)).toBe(false);
      expect(() => compra.cancelar(comprador, antesDelEvento)).toThrow(
        "No se puede cancelar una compra en estado UTILIZADA",
      );
    });

    it("no se puede cancelar si el evento ya se realizó", () => {
      const compra = comprar();
      compra.confirmarPago(comprador, ahora);

      expect(compra.puedeCancelarse(antesDelEvento)).toBe(true);
      expect(compra.puedeCancelarse(despuesDelEvento)).toBe(false);
      expect(() => compra.cancelar(comprador, despuesDelEvento)).toThrow(
        "No se puede cancelar una compra de un evento que ya se realizó",
      );
      expect(compra.estado).toBe(EstadoCompra.CONFIRMADA);
    });

    it("no se puede cancelar dos veces", () => {
      const compra = comprar();
      compra.cancelar(comprador, antesDelEvento);

      expect(() => compra.cancelar(comprador, antesDelEvento)).toThrow(
        "No se puede cancelar una compra en estado CANCELADA",
      );
    });
  });

  describe("Vencimiento por falta de pago", () => {
    const minutosDespues = (minutos) => new Date(ahora.getTime() + minutos * 60 * 1000);

    it("una compra pendiente vence cuando pasa el plazo para pagar", () => {
      const compra = comprar();

      expect(compra.estaVencida(30, minutosDespues(29))).toBe(false);
      expect(compra.estaVencida(30, minutosDespues(30))).toBe(true);
    });

    it("una compra pagada nunca vence", () => {
      const compra = comprar();
      compra.confirmarPago(comprador, ahora);

      expect(compra.estaVencida(30, minutosDespues(600))).toBe(false);
    });

    it("al vencer queda CANCELADA por el sistema y devuelve el cupo", () => {
      const compra = comprar(3);

      compra.vencerPorFaltaDePago(minutosDespues(30));

      expect(compra.estado).toBe(EstadoCompra.CANCELADA);
      expect(compra.historialEstados.at(-1).quien).toBeNull();
      expect(platea.disponibles()).toBe(4);
    });
  });

  describe("diasParaElEvento", () => {
    it("devuelve los días que faltan solo si la compra está confirmada", () => {
      const compra = comprar();
      expect(compra.diasParaElEvento(ahora)).toBeNull();

      compra.confirmarPago(comprador, ahora);
      expect(compra.diasParaElEvento(ahora)).toBe(4);
    });
  });

  describe("Chat", () => {
    it("comprador y organizador pueden intercambiar mensajes en cualquier estado", () => {
      const compra = comprar();
      compra.enviarMensaje(comprador, "¿Se puede entrar con cámara?", ahora);
      compra.cancelar(comprador, antesDelEvento);

      compra.enviarMensaje(organizador, "Sí, sin flash", antesDelEvento);

      expect(compra.mensajes.map((m) => [m.usuario, m.mensaje])).toEqual([
        [comprador, "¿Se puede entrar con cámara?"],
        [organizador, "Sí, sin flash"],
      ]);
    });

    it("un mensaje inválido no se agrega al chat", () => {
      const compra = comprar();

      expect(() => compra.enviarMensaje(comprador, "  ")).toThrow("El mensaje no puede estar vacío");
      expect(compra.mensajes).toHaveLength(0);
    });
  });

  describe("Reseña", () => {
    const compraUtilizada = () => {
      const compra = comprar();
      compra.confirmarPago(comprador, ahora);
      compra.marcarComoUtilizada(organizador, diaDelEvento);
      return compra;
    };

    it("después de usar la entrada el comprador puede reseñar el evento", () => {
      const compra = compraUtilizada();
      expect(compra.puedeReseniarse()).toBe(true);

      const resenia = compra.reseniar({ detalle: "Muy buena puesta", puntuacion: 4 }, despuesDelEvento);

      expect(resenia).toMatchObject({ comprador, evento, detalle: "Muy buena puesta", puntuacion: 4 });
      expect(compra.resenia).toBe(resenia);
      expect(compra.puedeReseniarse()).toBe(false);
    });

    it("no se puede reseñar si la entrada no se utilizó", () => {
      const compra = comprar();
      compra.confirmarPago(comprador, ahora);

      expect(compra.puedeReseniarse()).toBe(false);
      expect(() => compra.reseniar({ detalle: "Bien", puntuacion: 3 })).toThrow(
        "Solo se puede reseñar un evento después de haber utilizado la entrada",
      );
    });

    it("no se puede reseñar dos veces la misma compra", () => {
      const compra = compraUtilizada();
      compra.reseniar({ detalle: "Bien", puntuacion: 3 });

      expect(() => compra.reseniar({ detalle: "Otra", puntuacion: 5 })).toThrow("Esta compra ya tiene una reseña");
    });
  });

  describe("Participantes", () => {
    it("el comprador y el organizador participan de la compra, otro usuario no", () => {
      const compra = comprar();
      const otro = Object.assign(new Usuario({ nombre: "Otro", apellido: "Usuario" }), { id: 3 });

      expect(compra.esDe(comprador)).toBe(true);
      expect(compra.esDe(organizador)).toBe(false);
      expect(compra.participa(comprador)).toBe(true);
      expect(compra.participa(organizador)).toBe(true);
      expect(compra.participa(otro)).toBe(false);
    });
  });
});
