import { render, screen, userEvent } from "@testing-library/react-native";
import { Boton } from "../../src/components/Boton";
import { EstadoBadge } from "../../src/components/EstadoBadge";
import { SelectorCantidad } from "../../src/components/SelectorCantidad";

jest.useFakeTimers();

describe("Boton", () => {
  it("llama a onPress al presionarlo", async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await render(<Boton titulo="Comprar" onPress={onPress} />);

    await user.press(screen.getByRole("button", { name: "Comprar" }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("queda deshabilitado mientras carga", async () => {
    await render(<Boton titulo="Comprar" onPress={jest.fn()} cargando />);

    expect(screen.getByRole("button", { name: "Comprar" })).toBeDisabled();
  });
});

describe("EstadoBadge", () => {
  it("muestra la etiqueta legible de cada estado", async () => {
    await render(<EstadoBadge estado="PENDIENTE" />);

    expect(screen.getByText("Pendiente de pago")).toBeOnTheScreen();
    expect(screen.getByLabelText("Estado: Pendiente de pago")).toBeOnTheScreen();
  });
});

describe("SelectorCantidad", () => {
  it("no deja superar el cupo disponible ni bajar del mínimo", async () => {
    const user = userEvent.setup();
    const onCambiar = jest.fn();
    await render(<SelectorCantidad valor={3} maximo={3} onCambiar={onCambiar} />);

    await user.press(screen.getByLabelText("Sumar una entrada"));

    expect(onCambiar).not.toHaveBeenCalled();
    expect(screen.getByText("3")).toBeOnTheScreen();
  });

  it("suma y resta dentro del rango", async () => {
    const user = userEvent.setup();
    const onCambiar = jest.fn();
    await render(<SelectorCantidad valor={2} maximo={5} onCambiar={onCambiar} />);

    await user.press(screen.getByLabelText("Sumar una entrada"));
    await user.press(screen.getByLabelText("Restar una entrada"));

    expect(onCambiar.mock.calls).toEqual([[3], [1]]);
  });
});
