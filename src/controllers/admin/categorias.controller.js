const categoriasModel = require('../../models/categorias.model');
const { texto } = require('../../helpers/validaciones');
const { renderConLayout } = require('../../helpers/render');
const { destinoConMensaje } = require('../../helpers/respuestas');

function index(req, res, next) {
  return renderConLayout(res, next, 'admin/categorias/index', {
    titulo: 'Administrar categorías',
    categorias: categoriasModel.listarConConteo()
  });
}

function crear(req, res) {
  const nombre = texto(req.body.nombre);

  if (!nombre) {
    return res.redirect(destinoConMensaje('/admin/categorias', 'error', 'El nombre de la categoría es obligatorio.'));
  }

  try {
    categoriasModel.crear(nombre);
    return res.redirect(destinoConMensaje('/admin/categorias', 'msg', 'Categoría creada correctamente.'));
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.redirect(destinoConMensaje('/admin/categorias', 'error', 'Ya existe una categoría con ese nombre.'));
    }

    console.error(error);
    return res.redirect(destinoConMensaje('/admin/categorias', 'error', 'No se pudo crear la categoría.'));
  }
}

function actualizar(req, res) {
  const id = Number(req.params.id);
  const nombre = texto(req.body.nombre);

  if (!Number.isInteger(id) || !nombre) {
    return res.redirect(destinoConMensaje('/admin/categorias', 'error', 'Datos de categoría no válidos.'));
  }

  try {
    const resultado = categoriasModel.actualizar(id, nombre);

    if (!resultado.changes) {
      return res.redirect(destinoConMensaje('/admin/categorias', 'error', 'Categoría no encontrada.'));
    }

    return res.redirect(destinoConMensaje('/admin/categorias', 'msg', 'Categoría actualizada correctamente.'));
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.redirect(destinoConMensaje('/admin/categorias', 'error', 'Ya existe una categoría con ese nombre.'));
    }

    console.error(error);
    return res.redirect(destinoConMensaje('/admin/categorias', 'error', 'No se pudo actualizar la categoría.'));
  }
}

function eliminar(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.redirect(destinoConMensaje('/admin/categorias', 'error', 'Categoría no válida.'));
  }

  try {
    const resultado = categoriasModel.eliminar(id);

    if (!resultado.changes) {
      return res.redirect(destinoConMensaje('/admin/categorias', 'error', 'Categoría no encontrada.'));
    }

    return res.redirect(destinoConMensaje('/admin/categorias', 'msg', 'Categoría eliminada correctamente.'));
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return res.redirect(destinoConMensaje('/admin/categorias', 'error', 'No se puede eliminar una categoría con vehículos asociados.'));
    }

    console.error(error);
    return res.redirect(destinoConMensaje('/admin/categorias', 'error', 'No se pudo eliminar la categoría.'));
  }
}

module.exports = { index, crear, actualizar, eliminar };
