import { jest } from "@jest/globals";
import { UsuarioService } from "../../services/Usuario.service.js";
import { Usuario } from "../../domain/Usuario.js";
import { NotFoundError } from "../../errors/NotFoundError.js";

describe("UsuarioService", () => {
  let repository;
  let service;
  const ana = Object.assign(new Usuario({ nombre: "Ana", apellido: "García" }), { id: 1 });

  beforeEach(() => {
    repository = { buscarTodos: jest.fn(), buscarPorId: jest.fn() };
    service = new UsuarioService(repository);
  });

  it("listarUsuarios devuelve los usuarios como DTO, sin los favoritos", async () => {
    repository.buscarTodos.mockResolvedValue([ana]);

    await expect(service.listarUsuarios()).resolves.toEqual([
      { id: 1, nombre: "Ana", apellido: "García", nombreCompleto: "Ana García" },
    ]);
  });

  it("obtenerUsuario busca por id en el repositorio", async () => {
    repository.buscarPorId.mockResolvedValue(ana);

    await expect(service.obtenerUsuario("1")).resolves.toMatchObject({ id: 1, nombreCompleto: "Ana García" });
    expect(repository.buscarPorId).toHaveBeenCalledWith("1");
  });

  it("obtenerUsuario lanza NotFoundError si no existe", async () => {
    repository.buscarPorId.mockResolvedValue(null);

    await expect(service.obtenerUsuario(9)).rejects.toThrow(NotFoundError);
    await expect(service.obtenerUsuario(9)).rejects.toThrow("El usuario con id 9 no existe");
  });
});
