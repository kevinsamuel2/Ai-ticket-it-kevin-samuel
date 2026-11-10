import { render, screen, userEvent } from "@testing-library/react-native";
import Login from "../../src/app/login";
import { Proveedores } from "../../test-utils/Proveedores";
import { iniciarSesion } from "../../src/services/sesiones.service";

jest.mock("../../src/services/sesiones.service", () => ({ iniciarSesion: jest.fn(), cerrarSesion: jest.fn() }));

jest.useFakeTimers();

const renderizarLogin = () => render(<Login />, { wrapper: Proveedores });

describe("Pantalla de login", () => {
  beforeEach(() => iniciarSesion.mockReset());

  it("valida los campos antes de llamar al backend", async () => {
    const user = userEvent.setup();
    await renderizarLogin();

    await user.press(screen.getByRole("button", { name: "Ingresar" }));

    expect(screen.getByText("Ingresá tu email")).toBeOnTheScreen();
    expect(screen.getByText("Ingresá tu contraseña")).toBeOnTheScreen();
    expect(iniciarSesion).not.toHaveBeenCalled();
  });

  it("inicia sesión con el email y la contraseña ingresados", async () => {
    const user = userEvent.setup();
    iniciarSesion.mockResolvedValue({ token: "abc", usuario: { id: 3, nombreCompleto: "Nahuel Quiroga" } });
    await renderizarLogin();

    await user.type(screen.getByLabelText("Email"), "nahuel@aiticketit.com");
    await user.type(screen.getByLabelText("Contraseña"), "ticket123");
    await user.press(screen.getByRole("button", { name: "Ingresar" }));

    expect(iniciarSesion).toHaveBeenCalledWith("nahuel@aiticketit.com", "ticket123");
  });

  it("muestra el error del servidor si las credenciales son incorrectas", async () => {
    const user = userEvent.setup();
    iniciarSesion.mockRejectedValue({ response: { data: { message: "Email o contraseña incorrectos" } } });
    await renderizarLogin();

    await user.type(screen.getByLabelText("Email"), "nahuel@aiticketit.com");
    await user.type(screen.getByLabelText("Contraseña"), "otra");
    await user.press(screen.getByRole("button", { name: "Ingresar" }));

    expect(await screen.findByText("Email o contraseña incorrectos")).toBeOnTheScreen();
  });
});
