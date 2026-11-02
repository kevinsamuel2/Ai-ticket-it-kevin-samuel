import { Usuario } from "../../domain/Usuario.js";
import { UnprocessableEntityError } from "../../errors/UnprocessableEntityError.js";

describe("Dominio: Usuario", () => {
  const datosValidos = { nombre: "Ana", apellido: "García" };

  describe("Constructor", () => {
    it("crea un usuario sin favoritos", () => {
      const usuario = new Usuario(datosValidos);

      expect(usuario.nombreCompleto()).toBe("Ana García");
      expect(usuario.favoritos).toEqual([]);
    });

    it("error si falta el nombre o el apellido", () => {
      expect(() => new Usuario({ apellido: "García" })).toThrow("El usuario debe tener un nombre");
      expect(() => new Usuario({ nombre: "Ana", apellido: "   " })).toThrow("El usuario debe tener un apellido");
      expect(() => new Usuario({ apellido: "García" })).toThrow(UnprocessableEntityError);
    });
  });

  describe("Favoritos", () => {
    const evento = { nombre: "Recital" };
    const otroEvento = { nombre: "Obra de teatro" };

    it("agrega un evento a favoritos", () => {
      const usuario = new Usuario(datosValidos);

      usuario.agregarFavorito(evento);

      expect(usuario.esFavorito(evento)).toBe(true);
      expect(usuario.esFavorito(otroEvento)).toBe(false);
    });

    it("agregar dos veces el mismo evento no lo duplica", () => {
      const usuario = new Usuario(datosValidos);

      usuario.agregarFavorito(evento);
      usuario.agregarFavorito(evento);

      expect(usuario.favoritos).toHaveLength(1);
    });

    it("quita un evento de favoritos y no falla si no estaba", () => {
      const usuario = new Usuario(datosValidos);
      usuario.agregarFavorito(evento);
      usuario.agregarFavorito(otroEvento);

      usuario.quitarFavorito(evento);
      usuario.quitarFavorito(evento);

      expect(usuario.favoritos).toEqual([otroEvento]);
    });
  });

  describe("esElMismoQue", () => {
    it("compara por id cuando el usuario ya está persistido", () => {
      const usuario = Object.assign(new Usuario(datosValidos), { id: 1 });
      const mismoId = Object.assign(new Usuario({ nombre: "Otra", apellido: "Persona" }), { id: 1 });
      const otroId = Object.assign(new Usuario(datosValidos), { id: 2 });

      expect(usuario.esElMismoQue(mismoId)).toBe(true);
      expect(usuario.esElMismoQue(otroId)).toBe(false);
    });

    it("sin id solo es el mismo si es la misma instancia", () => {
      const usuario = new Usuario(datosValidos);

      expect(usuario.esElMismoQue(usuario)).toBe(true);
      expect(usuario.esElMismoQue(new Usuario(datosValidos))).toBe(false);
    });
  });
});
