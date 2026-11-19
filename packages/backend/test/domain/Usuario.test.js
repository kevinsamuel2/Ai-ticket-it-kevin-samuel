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

  describe("Organizadores seguidos", () => {
    const organizador = Object.assign(new Usuario({ nombre: "Florencia", apellido: "Acosta" }), { id: 1 });
    const otroOrganizador = Object.assign(new Usuario({ nombre: "Gonzalo", apellido: "Pereyra" }), { id: 2 });
    const nuevoSeguidor = () => Object.assign(new Usuario(datosValidos), { id: 10 });

    it("empieza sin seguir a nadie", () => {
      expect(nuevoSeguidor().seguidos).toEqual([]);
    });

    it("sigue a un organizador y repetirlo no lo duplica", () => {
      const usuario = nuevoSeguidor();

      usuario.seguir(organizador);
      usuario.seguir(organizador);

      expect(usuario.seguidos).toEqual([organizador]);
      expect(usuario.sigueA(organizador)).toBe(true);
      expect(usuario.sigueA(otroOrganizador)).toBe(false);
    });

    it("deja de seguir a un organizador y no falla si no lo seguía", () => {
      const usuario = nuevoSeguidor();
      usuario.seguir(organizador);
      usuario.seguir(otroOrganizador);

      usuario.dejarDeSeguir(organizador);
      usuario.dejarDeSeguir(organizador);

      expect(usuario.seguidos).toEqual([otroOrganizador]);
    });

    it("nadie puede seguirse a sí mismo", () => {
      expect(() => organizador.seguir(organizador)).toThrow(UnprocessableEntityError);
      expect(() => organizador.seguir(organizador)).toThrow("No podés seguirte a vos mismo");
      expect(organizador.seguidos).toEqual([]);
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
