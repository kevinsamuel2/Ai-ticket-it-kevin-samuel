import { act, render, screen, userEvent } from "@testing-library/react-native";
import { Pressable, Text } from "react-native";
import { useAvisos } from "../../src/context/AvisosContext";
import { PantallaDeCarga } from "../../src/components/PantallaDeCarga";
import { Proveedores } from "../../test-utils/Proveedores";

jest.useFakeTimers();

function BotonQueAvisa({ tipo, mensaje }) {
  const avisos = useAvisos();
  const mostrar = { error: avisos.mostrarError, exito: avisos.mostrarExito }[tipo];
  return (
    <Pressable accessibilityRole="button" onPress={() => mostrar(mensaje)}>
      <Text>Avisar</Text>
    </Pressable>
  );
}

describe("Avisos", () => {
  it("muestra el aviso como alerta y lo oculta solo después de unos segundos", async () => {
    const user = userEvent.setup();
    await render(<BotonQueAvisa tipo="error" mensaje="No hay cupo suficiente" />, { wrapper: Proveedores });

    await user.press(screen.getByRole("button", { name: "Avisar" }));
    expect(screen.getByRole("alert", { name: "No hay cupo suficiente" })).toBeOnTheScreen();

    await act(() => jest.advanceTimersByTime(4000));
    expect(screen.queryByText("No hay cupo suficiente")).not.toBeOnTheScreen();
  });

  it("se cierra al tocarlo", async () => {
    const user = userEvent.setup();
    await render(<BotonQueAvisa tipo="exito" mensaje="¡Pago confirmado!" />, { wrapper: Proveedores });

    await user.press(screen.getByRole("button", { name: "Avisar" }));
    await user.press(screen.getByRole("alert", { name: "¡Pago confirmado!" }));

    expect(screen.queryByText("¡Pago confirmado!")).not.toBeOnTheScreen();
  });
});

describe("PantallaDeCarga", () => {
  it("muestra la ruedita con el mensaje mientras carga", async () => {
    await render(<PantallaDeCarga mensaje="Conectando con el servidor..." />, { wrapper: Proveedores });

    expect(screen.getByLabelText("Conectando con el servidor...")).toBeOnTheScreen();
  });

  it("si hay un error lo informa y permite reintentar", async () => {
    const user = userEvent.setup();
    const onReintentar = jest.fn();
    await render(<PantallaDeCarga error="No pudimos conectarnos con el servidor" onReintentar={onReintentar} />, {
      wrapper: Proveedores,
    });

    expect(screen.getByText("No pudimos conectarnos con el servidor")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Reintentar" }));
    expect(onReintentar).toHaveBeenCalled();
  });
});
