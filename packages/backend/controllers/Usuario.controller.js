// Express 5 propaga solo los errores de los handlers async al middleware de errores,
// por eso los controllers no necesitan try/catch + next(error)
export class UsuarioController {
  constructor(usuarioService) {
    this.usuarioService = usuarioService;
  }

  async listarUsuarios(req, res) {
    res.status(200).json(await this.usuarioService.listarUsuarios());
  }

  async obtenerUsuario(req, res) {
    res.status(200).json(await this.usuarioService.obtenerUsuario(req.params.usuarioId));
  }
}
