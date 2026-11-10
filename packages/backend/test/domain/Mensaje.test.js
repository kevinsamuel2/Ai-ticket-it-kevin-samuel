import { Mensaje, LARGO_MAXIMO_MENSAJE } from "../../domain/Mensaje.js";

describe("Dominio: Mensaje", () => {
  const usuario = { nombre: "Nahuel" };

  it("crea un mensaje con su autor, texto y fecha de envío", () => {
    const enviado = new Date(2026, 10, 2, 18, 30);

    const mensaje = new Mensaje({ usuario, mensaje: "  ¿A qué hora abren las puertas?  ", enviado });

    expect(mensaje).toMatchObject({ usuario, mensaje: "¿A qué hora abren las puertas?", enviado });
  });

  it("error si el mensaje está vacío o no tiene autor", () => {
    expect(() => new Mensaje({ usuario, mensaje: "   " })).toThrow("El mensaje no puede estar vacío");
    expect(() => new Mensaje({ mensaje: "Hola" })).toThrow("El mensaje debe tener un autor");
  });

  it("error si el mensaje supera el largo máximo", () => {
    expect(() => new Mensaje({ usuario, mensaje: "a".repeat(LARGO_MAXIMO_MENSAJE + 1) })).toThrow(
      `El mensaje no puede superar los ${LARGO_MAXIMO_MENSAJE} caracteres`,
    );
    expect(() => new Mensaje({ usuario, mensaje: "a".repeat(LARGO_MAXIMO_MENSAJE) })).not.toThrow();
  });
});
