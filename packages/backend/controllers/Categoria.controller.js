export class CategoriaController {
  constructor(categoriaService) {
    this.categoriaService = categoriaService;
  }

  async listarCategorias(req, res) {
    res.status(200).json(await this.categoriaService.listarCategorias());
  }
}
