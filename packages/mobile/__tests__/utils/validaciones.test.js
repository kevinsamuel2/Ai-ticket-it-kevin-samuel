import { armarFecha, hayErrores, validarEvento, validarLogin } from "../../src/utils/validaciones";

describe("validaciones", () => {
  describe("validarLogin", () => {
    it("exige email con formato válido y contraseña", () => {
      expect(validarLogin({ email: "", contrasenia: "" })).toEqual({
        email: "Ingresá tu email",
        contrasenia: "Ingresá tu contraseña",
      });
      expect(validarLogin({ email: "juan@", contrasenia: "x" }).email).toBe("El email no tiene un formato válido");
      expect(hayErrores(validarLogin({ email: "juan@aiticketit.com", contrasenia: "ticket123" }))).toBe(false);
    });
  });

  describe("armarFecha", () => {
    it("combina fecha DD/MM/AAAA y hora HH:MM", () => {
      expect(armarFecha("25/12/2026", "21:30")).toEqual(new Date(2026, 11, 25, 21, 30));
    });

    it("rechaza formatos inválidos y fechas que no existen", () => {
      expect(armarFecha("2026-12-25", "21:30")).toBeNull();
      expect(armarFecha("31/02/2026", "21:30")).toBeNull();
      expect(armarFecha("25/12/2026", "25:00")).toBeNull();
    });
  });

  describe("validarEvento", () => {
    const ahora = new Date(2026, 10, 1);
    const eventoValido = {
      nombre: "Hamlet",
      descripcion: "Obra de teatro",
      categoria: 2,
      fecha: "10/12/2026",
      hora: "20:30",
      tiposEntrada: [{ nombre: "Platea", descripcion: "", precio: "22000", cupo: "100" }],
    };

    it("acepta un evento válido", () => {
      expect(validarEvento(eventoValido, ahora)).toEqual({});
    });

    it("exige una fecha futura", () => {
      expect(validarEvento({ ...eventoValido, fecha: "10/10/2026" }, ahora).fecha).toBe(
        "La fecha tiene que ser futura",
      );
    });

    it("valida precio y cupo de cada tipo de entrada", () => {
      const errores = validarEvento(
        { ...eventoValido, tiposEntrada: [{ nombre: "Platea", descripcion: "", precio: "-5", cupo: "0" }] },
        ahora,
      );

      expect(errores.tiposEntrada).toEqual([{ precio: "Precio inválido", cupo: "Cupo inválido" }]);
    });

    it("no permite dos tipos de entrada con el mismo nombre", () => {
      const tipo = { nombre: "General", descripcion: "", precio: "100", cupo: "10" };
      const errores = validarEvento({ ...eventoValido, tiposEntrada: [tipo, { ...tipo, nombre: "general" }] }, ahora);

      expect(errores.tiposRepetidos).toBe("No puede haber dos tipos con el mismo nombre");
    });
  });
});
