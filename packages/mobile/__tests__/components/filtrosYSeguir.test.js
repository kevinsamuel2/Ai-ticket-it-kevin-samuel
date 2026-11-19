import { render, screen, userEvent } from "@testing-library/react-native";
import { BotonSeguir } from "../../src/components/BotonSeguir";
import { FiltroDesplegable } from "../../src/components/FiltroDesplegable";
import { dejarDeSeguirOrganizador, seguirOrganizador } from "../../src/services/seguidos.service";
import { Proveedores } from "../../test-utils/Proveedores";

jest.mock("../../src/services/seguidos.service");
jest.useFakeTimers();

describe("FiltroDesplegable", () => {
  const opciones = [
    { valor: null, etiqueta: "Todas las ubicaciones" },
    { valor: "Córdoba", etiqueta: "Córdoba" },
    { valor: "San Isidro", etiqueta: "San Isidro" },
  ];

  it("muestra el nombre del filtro cuando no hay nada elegido", async () => {
    await render(
      <Proveedores>
        <FiltroDesplegable
          icono="location-outline"
          nombre="Ubicación"
          opciones={opciones}
          valor={null}
          onSeleccionar={jest.fn()}
        />
      </Proveedores>,
    );

    expect(screen.getByRole("button", { name: "Ubicación: sin filtro" })).toBeOnTheScreen();
  });

  it("muestra la opción elegida", async () => {
    await render(
      <Proveedores>
        <FiltroDesplegable
          icono="location-outline"
          nombre="Ubicación"
          opciones={opciones}
          valor="Córdoba"
          onSeleccionar={jest.fn()}
        />
      </Proveedores>,
    );

    expect(screen.getByRole("button", { name: "Ubicación: Córdoba" })).toBeOnTheScreen();
  });

  it("al tocarlo abre la lista y al elegir una opción avisa cuál y se cierra", async () => {
    const user = userEvent.setup();
    const onSeleccionar = jest.fn();
    await render(
      <Proveedores>
        <FiltroDesplegable
          icono="location-outline"
          nombre="Ubicación"
          titulo="Elegí una ubicación"
          opciones={opciones}
          valor={null}
          onSeleccionar={onSeleccionar}
        />
      </Proveedores>,
    );
    expect(screen.queryByText("Elegí una ubicación")).not.toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Ubicación: sin filtro" }));
    expect(screen.getByText("Elegí una ubicación")).toBeOnTheScreen();

    await user.press(screen.getByRole("radio", { name: "San Isidro" }));
    expect(onSeleccionar).toHaveBeenCalledWith("San Isidro");
  });

  it("elegir 'sin filtro' manda null", async () => {
    const user = userEvent.setup();
    const onSeleccionar = jest.fn();
    await render(
      <Proveedores>
        <FiltroDesplegable
          icono="location-outline"
          nombre="Ubicación"
          opciones={opciones}
          valor="Córdoba"
          onSeleccionar={onSeleccionar}
        />
      </Proveedores>,
    );

    await user.press(screen.getByRole("button", { name: "Ubicación: Córdoba" }));
    await user.press(screen.getByRole("radio", { name: "Todas las ubicaciones" }));

    expect(onSeleccionar).toHaveBeenCalledWith(null);
  });
});

describe("BotonSeguir", () => {
  beforeEach(() => {
    seguirOrganizador.mockResolvedValue();
    dejarDeSeguirOrganizador.mockResolvedValue();
  });

  it("sigue al organizador y cambia a 'Siguiendo'", async () => {
    const user = userEvent.setup();
    const onCambio = jest.fn();
    await render(
      <Proveedores>
        <BotonSeguir organizadorId={7} nombre="Florencia Acosta" loSigo={false} onCambio={onCambio} />
      </Proveedores>,
    );

    await user.press(screen.getByRole("button", { name: "Seguir a Florencia Acosta" }));

    expect(seguirOrganizador).toHaveBeenCalledWith(7);
    expect(await screen.findByRole("button", { name: "Dejar de seguir a Florencia Acosta" })).toBeOnTheScreen();
    expect(onCambio).toHaveBeenCalledWith(true);
  });

  it("deja de seguir si ya lo seguía", async () => {
    const user = userEvent.setup();
    await render(
      <Proveedores>
        <BotonSeguir organizadorId={7} nombre="Florencia Acosta" loSigo />
      </Proveedores>,
    );

    await user.press(screen.getByRole("button", { name: "Dejar de seguir a Florencia Acosta" }));

    expect(dejarDeSeguirOrganizador).toHaveBeenCalledWith(7);
    expect(await screen.findByRole("button", { name: "Seguir a Florencia Acosta" })).toBeOnTheScreen();
  });

  it("si el backend falla vuelve al estado anterior y avisa", async () => {
    seguirOrganizador.mockRejectedValue({ response: { data: { message: "No podés seguirte a vos mismo" } } });
    const user = userEvent.setup();
    await render(
      <Proveedores>
        <BotonSeguir organizadorId={7} nombre="Florencia Acosta" loSigo={false} />
      </Proveedores>,
    );

    await user.press(screen.getByRole("button", { name: "Seguir a Florencia Acosta" }));

    expect(await screen.findByText("No podés seguirte a vos mismo")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Seguir a Florencia Acosta" })).toBeOnTheScreen();
  });
});
