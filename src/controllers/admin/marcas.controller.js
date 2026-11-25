const marcasModel = require('../../models/marcas.model');
const { texto } = require('../../helpers/validaciones');
const { renderConLayout } = require('../../helpers/render');
const { destinoConMensaje } = require('../../helpers/respuestas');

function index(req, res, next) {
  return renderConLayout(res, next, 'admin/marcas/index', {
    titulo: 'Administrar marcas',
    marcas: marcasModel.listarConConteo()
  });
}

function crear(req, res) {
  const nombre = texto(req.body.nombre);

  if (!nombre) {
    return res.redirect(destinoConMensaje('/admin/marcas', 'error', 'El nombre de la marca es obligatorio.'));
  }

  try {
    marcasModel.crear(nombre);
    return res.redirect(destinoConMensaje('/admin/marcas', 'msg', 'Marca creada correctamente.'));
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.redirect(destinoConMensaje('/admin/marcas', 'error', 'Ya existe una marca con ese nombre.'));
    }

    console.error(error);
    return res.redirect(destinoConMensaje('/admin/marcas', 'error', 'No se pudo crear la marca.'));
  }
}

function actualizar(req, res) {
  const id = Number(req.params.id);
  const nombre = texto(req.body.nombre);

  if (!Number.isInteger(id) || !nombre) {
    return res.redirect(destinoConMensaje('/admin/marcas', 'error', 'Datos de marca no válidos.'));
  }

  try {
    const resultado = marcasModel.actualizar(id, nombre);

    if (!resultado.changes) {
      return res.redirect(destinoConMensaje('/admin/marcas', 'error', 'Marca no encontrada.'));
    }

    return res.redirect(destinoConMensaje('/admin/marcas', 'msg', 'Marca actualizada correctamente.'));
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.redirect(destinoConMensaje('/admin/marcas', 'error', 'Ya existe una marca con ese nombre.'));
    }

    console.error(error);
    return res.redirect(destinoConMensaje('/admin/marcas', 'error', 'No se pudo actualizar la marca.'));
  }
}

function eliminar(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.redirect(destinoConMensaje('/admin/marcas', 'error', 'Marca no válida.'));
  }

  try {
    const resultado = marcasModel.eliminar(id);

    if (!resultado.changes) {
      return res.redirect(destinoConMensaje('/admin/marcas', 'error', 'Marca no encontrada.'));
    }

    return res.redirect(destinoConMensaje('/admin/marcas', 'msg', 'Marca eliminada correctamente.'));
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return res.redirect(destinoConMensaje('/admin/marcas', 'error', 'No se puede eliminar una marca con vehículos asociados.'));
    }

    console.error(error);
    return res.redirect(destinoConMensaje('/admin/marcas', 'error', 'No se pudo eliminar la marca.'));
  }
}

module.exports = { index, crear, actualizar, eliminar };
