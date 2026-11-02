import { Cuenta } from "../../domain/Cuenta.js";

describe("Dominio: Cuenta", () => {
  const usuario = { id: 1, nombre: "Ana" };
  const datosValidos = { email: " Ana@Mail.com ", contrasenia: "secreta123", usuario };

  it("normaliza el email y no guarda la contraseña en texto plano", () => {
    const cuenta = new Cuenta(datosValidos);

    expect(cuenta.email).toBe("ana@mail.com");
    expect(cuenta.hashContrasenia).not.toContain("secreta123");
    expect(JSON.stringify(cuenta)).not.toContain("secreta123");
  });

  it("dos cuentas con la misma contraseña tienen hashes distintos (sal aleatoria)", () => {
    expect(new Cuenta(datosValidos).hashContrasenia).not.toBe(new Cuenta(datosValidos).hashContrasenia);
  });

  it("verifica la contraseña", () => {
    const cuenta = new Cuenta(datosValidos);

    expect(cuenta.contraseniaEsCorrecta("secreta123")).toBe(true);
    expect(cuenta.contraseniaEsCorrecta("Secreta123")).toBe(false);
    expect(cuenta.contraseniaEsCorrecta(undefined)).toBe(false);
  });

  it("compara el email sin distinguir mayúsculas ni espacios", () => {
    const cuenta = new Cuenta(datosValidos);

    expect(cuenta.tieneEmail("ANA@mail.com ")).toBe(true);
    expect(cuenta.tieneEmail("otra@mail.com")).toBe(false);
  });

  it("valida email, largo de la contraseña y usuario", () => {
    expect(() => new Cuenta({ ...datosValidos, email: "no-es-un-email" })).toThrow(
      "El email no tiene un formato válido",
    );
    expect(() => new Cuenta({ ...datosValidos, contrasenia: "123" })).toThrow(
      "La contraseña debe tener al menos 6 caracteres",
    );
    expect(() => new Cuenta({ ...datosValidos, usuario: null })).toThrow("La cuenta debe pertenecer a un usuario");
  });
});
