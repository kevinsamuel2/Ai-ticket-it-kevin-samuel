// Sesiones abiertas: token -> usuario. En memoria, como el resto de la persistencia del TP
// (al reiniciar el servidor hay que volver a iniciar sesión)
export class SesionRepository {
  constructor() {
    this._sesiones = new Map();
  }

  async guardar(token, usuario) {
    this._sesiones.set(token, usuario);
  }

  async buscarUsuario(token) {
    return this._sesiones.get(token) ?? null;
  }

  async eliminar(token) {
    return this._sesiones.delete(token);
  }
}
