import { TipoEntrada } from "../../domain/TipoEntrada.js";
import { ConflictError } from "../../errors/ConflictError.js";

describe("Dominio: TipoEntrada", () => {
  const datosValidos = { nombre: "Platea", descripcion: "Sector central", precio: 25000, cupo: 10 };

  describe("Constructor", () => {
    it("crea un tipo de entrada sin entradas vendidas", () => {
      const tipo = new TipoEntrada(datosValidos);

      expect(tipo.disponibles()).toBe(10);
      expect(tipo.estaAgotado()).toBe(false);
    });

    it("permite entradas gratuitas (precio 0)", () => {
      expect(new TipoEntrada({ ...datosValidos, precio: 0 }).precio).toBe(0);
    });

    it("error si falta el nombre, el precio es negativo o el cupo no es un entero positivo", () => {
      expect(() => new TipoEntrada({ ...datosValidos, nombre: "" })).toThrow("El tipo de entrada debe tener un nombre");
      expect(() => new TipoEntrada({ ...datosValidos, precio: -1 })).toThrow(
        'El precio de "Platea" debe ser un número mayor o igual a 0',
      );
      expect(() => new TipoEntrada({ ...datosValidos, cupo: 0 })).toThrow(
        'El cupo de "Platea" debe ser un número entero mayor a 0',
      );
      expect(() => new TipoEntrada({ ...datosValidos, cupo: 2.5 })).toThrow(
        'El cupo de "Platea" debe ser un número entero mayor a 0',
      );
    });
  });

  describe("hayCupoPara", () => {
    it("es true mientras la cantidad no supere las disponibles", () => {
      const tipo = new TipoEntrada(datosValidos);

      expect(tipo.hayCupoPara(1)).toBe(true);
      expect(tipo.hayCupoPara(10)).toBe(true);
      expect(tipo.hayCupoPara(11)).toBe(false);
    });

    it("es false para cantidades que no son enteros positivos", () => {
      const tipo = new TipoEntrada(datosValidos);

      expect(tipo.hayCupoPara(0)).toBe(false);
      expect(tipo.hayCupoPara(-2)).toBe(false);
      expect(tipo.hayCupoPara(1.5)).toBe(false);
    });
  });

  describe("reservar y liberar", () => {
    it("reservar descuenta del cupo disponible", () => {
      const tipo = new TipoEntrada(datosValidos);

      tipo.reservar(4);

      expect(tipo.disponibles()).toBe(6);
      expect(tipo.hayCupoPara(7)).toBe(false);
    });

    it("reservar más de lo disponible lanza ConflictError y no modifica el cupo", () => {
      const tipo = new TipoEntrada(datosValidos);
      tipo.reservar(8);

      expect(() => tipo.reservar(3)).toThrow(ConflictError);
      expect(() => tipo.reservar(3)).toThrow('No hay cupo suficiente para "Platea": se pidieron 3 y quedan 2');
      expect(tipo.disponibles()).toBe(2);
    });

    it("queda agotado al vender todo el cupo", () => {
      const tipo = new TipoEntrada(datosValidos);

      tipo.reservar(10);

      expect(tipo.estaAgotado()).toBe(true);
    });

    it("liberar devuelve entradas al cupo sin bajar de cero vendidas", () => {
      const tipo = new TipoEntrada(datosValidos);
      tipo.reservar(5);

      tipo.liberar(2);
      expect(tipo.disponibles()).toBe(7);

      tipo.liberar(100);
      expect(tipo.disponibles()).toBe(10);
    });
  });

  describe("precios", () => {
    it("calcula el precio para una cantidad de entradas", () => {
      expect(new TipoEntrada(datosValidos).precioPara(3)).toBe(75000);
    });

    it("precioEstaEntre incluye los extremos del rango", () => {
      const tipo = new TipoEntrada(datosValidos);

      expect(tipo.precioEstaEntre(25000, 30000)).toBe(true);
      expect(tipo.precioEstaEntre(10000, 25000)).toBe(true);
      expect(tipo.precioEstaEntre(26000, 30000)).toBe(false);
    });
  });
});
