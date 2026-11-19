import { render, screen, userEvent } from "@testing-library/react-native";
import { CompraCard } from "../../src/components/CompraCard";
import { EntradaConQR, contenidoDelQR } from "../../src/components/EntradaConQR";
import { matrizDeQR } from "../../src/components/CodigoQR";

jest.useFakeTimers();

const compra = {
  id: 12,
  estado: "CONFIRMADA",
  cantidad: 3,
  total: 36000,
  evento: { id: 7, nombre: "Stand-up en Belushi", fecha: "2026-11-22T23:00:00.000Z", imagen: null },
  tipoEntrada: { id: 1, nombre: "General", precio: 12000 },
  comprador: { id: 2, nombreCompleto: "Nahuel Quiroga" },
  diasParaElEvento: 3,
  pagarAntesDe: null,
  cantidadMensajes: 0,
  puedeReseniar: false,
  entradas: [
    { numero: 1, codigo: "AT-00012-1" },
    { numero: 2, codigo: "AT-00012-2" },
    { numero: 3, codigo: "AT-00012-3" },
  ],
};

describe("QR de una entrada", () => {
  it("el contenido del QR identifica esa entrada puntual entre las de la compra", () => {
    expect(contenidoDelQR(compra, compra.entradas[1])).toBe(
      "aiticketit://entrada/AT-00012-2?compra=12&evento=7&entrada=2&de=3",
    );
  });

  it("cada entrada genera un QR distinto", () => {
    const [primero, segundo] = compra.entradas.map((entrada) => matrizDeQR(contenidoDelQR(compra, entrada)));

    expect(primero.filas).not.toEqual(segundo.filas);
  });

  it("genera una matriz cuadrada de módulos agrupados en tramos", () => {
    const { cantidad, filas } = matrizDeQR("hola");
    expect(filas).toHaveLength(cantidad);
    // Cada tramo entra dentro de la fila y hay módulos oscuros (los patrones de las esquinas)
    filas.forEach((tramos) =>
      tramos.forEach(({ inicio, largo }) => expect(inicio + largo).toBeLessThanOrEqual(cantidad)),
    );
    expect(filas.some((tramos) => tramos.length > 0)).toBe(true);
  });
});

describe("EntradaConQR", () => {
  it("muestra qué entrada es, su código y su QR", async () => {
    await render(<EntradaConQR compra={compra} entrada={compra.entradas[1]} />);

    expect(screen.getByText("Entrada 2 de 3")).toBeTruthy();
    expect(screen.getByText("AT-00012-2")).toBeTruthy();
    expect(screen.getByLabelText("Código QR de la entrada AT-00012-2")).toBeTruthy();
  });

  it("avisa que la entrada ya se usó cuando la compra está utilizada", async () => {
    await render(<EntradaConQR compra={{ ...compra, estado: "UTILIZADA" }} entrada={compra.entradas[0]} />);

    expect(screen.getByText("Entrada utilizada")).toBeTruthy();
    expect(screen.getByText("Esta entrada ya se usó para ingresar.")).toBeTruthy();
  });
});

describe("CompraCard y el acceso a los QR", () => {
  it("muestra cuántos QR tiene la compra y abre las entradas desde el botón del QR", async () => {
    const user = userEvent.setup();
    const onVerEntradas = jest.fn();
    const onPress = jest.fn();
    await render(<CompraCard compra={compra} onPress={onPress} onVerEntradas={onVerEntradas} />);

    expect(screen.getByText("3 códigos QR")).toBeTruthy();
    await user.press(screen.getByRole("button", { name: "Ver los 3 QR de Stand-up en Belushi" }));

    expect(onVerEntradas).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();
  });

  it("tocar el resto de la tarjeta abre el detalle de la compra", async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await render(<CompraCard compra={compra} onPress={onPress} onVerEntradas={jest.fn()} />);

    await user.press(screen.getByRole("button", { name: "Compra de Stand-up en Belushi" }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("una compra sin pagar no tiene botón de QR", async () => {
    await render(
      <CompraCard
        compra={{ ...compra, estado: "PENDIENTE", entradas: [] }}
        onPress={jest.fn()}
        onVerEntradas={jest.fn()}
      />,
    );

    expect(screen.queryByText("TAP PARA")).toBeNull();
    expect(screen.getByText("#12")).toBeTruthy();
  });

  it("para el organizador muestra quién compró y no ofrece el QR", async () => {
    await render(<CompraCard compra={compra} onPress={jest.fn()} onVerEntradas={jest.fn()} mostrarComprador />);

    expect(screen.getByText("Nahuel Quiroga")).toBeTruthy();
    expect(screen.queryByText("TAP PARA")).toBeNull();
  });
});
