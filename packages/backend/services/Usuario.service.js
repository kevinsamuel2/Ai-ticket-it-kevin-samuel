import { NotFoundError } from "../errors/NotFoundError.js";

export class UsuarioService {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  toDTO(usuario) {
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      nombreCompleto: usuario.nombreCompleto(),
    };
  }

  async listarUsuarios() {
    const usuarios = await this.usuarioRepository.buscarTodos();
    return usuarios.map((usuario) => this.toDTO(usuario));
  }

  async obtenerUsuario(usuarioId) {
    const usuario = await this.usuarioRepository.buscarPorId(usuarioId);
    if (!usuario) {
      throw new NotFoundError(`El usuario con id ${usuarioId} no existe`);
    }
    return this.toDTO(usuario);
  }
}
