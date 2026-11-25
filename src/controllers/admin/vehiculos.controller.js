const path = require('path');
const db = require('../../db/database');
const vehiculosModel = require('../../models/vehiculos.model');
const imagenesModel = require('../../models/imagenes.model');
const marcasModel = require('../../models/marcas.model');
const categoriasModel = require('../../models/categorias.model');
const { texto, listaIds, tipoImagen, validarVehiculo, COMBUSTIBLES, TRANSMISIONES } = require('../../helpers/validaciones');
const { urlDeArchivo, eliminarArchivos, eliminarUrl } = require('../../helpers/archivos');
const { renderConLayout } = require('../../helpers/render');
const { destinoConMensaje } = require('../../helpers/respuestas');

const DIRECTORIO_IMAGENES = path.join(__dirname, '..', '..', 'public', 'uploads', 'vehiculos');

function index(req, res, next) {
  const estadoFiltro = texto(req.query.estado);

  return renderConLayout(res, next, 'admin/vehiculos/index', {
    titulo: 'Administrar vehículos',
    vehiculos: vehiculosModel.listarAdmin(estadoFiltro),
    estados: db.ESTADOS_VALIDOS,
    estadoFiltro,
    tiposImagen: db.TIPOS_IMAGEN
  });
}

function nuevo(req, res, next) {
  return renderConLayout(res, next, 'admin/vehiculos/form', {
    titulo: 'Nuevo vehículo',
    vehiculo: null,
    imagenes: [],
    marcas: marcasModel.listar(),
    categorias: categoriasModel.listar(),
    estados: db.ESTADOS_VALIDOS,
    combustibles: COMBUSTIBLES,
    transmisiones: TRANSMISIONES,
    tiposImagen: db.TIPOS_IMAGEN,
    editando: false,
    action: '/admin/vehiculos'
  });
}

function editar(req, res, next) {
  const id = Number(req.params.id);
  const vehiculo = Number.isInteger(id) ? vehiculosModel.buscarPorId(id) : null;

  if (!vehiculo) {
    return res.redirect(destinoConMensaje('/admin/vehiculos', 'error', 'Vehículo no encontrado.'));
  }

  return renderConLayout(res, next, 'admin/vehiculos/form', {
    titulo: 'Editar vehículo',
    vehiculo,
    imagenes: imagenesModel.listarPorVehiculo(id),
    marcas: marcasModel.listar(),
    categorias: categoriasModel.listar(),
    estados: db.ESTADOS_VALIDOS,
    combustibles: COMBUSTIBLES,
    transmisiones: TRANSMISIONES,
    tiposImagen: db.TIPOS_IMAGEN,
    editando: true,
    action: `/admin/vehiculos/${id}/editar`
  });
}

function crear(req, res) {
  const { errores, datos } = validarVehiculo(req.body);

  if (errores.length) {
    eliminarArchivos(req.files);
    return res.redirect(destinoConMensaje('/admin/vehiculos/nuevo', 'error', errores.join(' ')));
  }

  try {
    db.transaction(() => {
      const resultado = vehiculosModel.crear(datos);
      const vehiculoId = Number(resultado.lastInsertRowid);
      const tipo = tipoImagen(req.body.tipo_imagen);

      (req.files || []).forEach((file, indice) => {
        imagenesModel.insertar(vehiculoId, urlDeArchivo(file), indice, tipo);
      });
    })();

    return res.redirect(destinoConMensaje('/admin/vehiculos', 'msg', 'Vehículo creado correctamente.'));
  } catch (error) {
    console.error(error);
    eliminarArchivos(req.files);
    return res.redirect(destinoConMensaje('/admin/vehiculos/nuevo', 'error', 'No se pudo crear el vehículo.'));
  }
}

function actualizar(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || !vehiculosModel.buscarPorId(id)) {
    eliminarArchivos(req.files);
    return res.redirect(destinoConMensaje('/admin/vehiculos', 'error', 'Vehículo no encontrado.'));
  }

  const { errores, datos } = validarVehiculo(req.body);

  if (errores.length) {
    eliminarArchivos(req.files);
    return res.redirect(destinoConMensaje(`/admin/vehiculos/${id}/editar`, 'error', errores.join(' ')));
  }

  try {
    db.transaction(() => {
      vehiculosModel.actualizar(id, datos);

      const idsEliminar = listaIds(req.body.imagenes_eliminar);

      if (idsEliminar.length) {
        const imagenes = imagenesModel.buscarParaEliminar(id, idsEliminar);
        imagenesModel.eliminarPorIds(id, idsEliminar);
        imagenes.forEach((imagen) => eliminarUrl(imagen.url, DIRECTORIO_IMAGENES));
      }

      const maxOrden = imagenesModel.maxOrden(id);
      const tipo = tipoImagen(req.body.tipo_imagen);

      (req.files || []).forEach((file, indice) => {
        imagenesModel.insertar(id, urlDeArchivo(file), maxOrden + 1 + indice, tipo);
      });
    })();

    return res.redirect(destinoConMensaje('/admin/vehiculos', 'msg', 'Vehículo actualizado correctamente.'));
  } catch (error) {
    console.error(error);
    eliminarArchivos(req.files);
    return res.redirect(destinoConMensaje(`/admin/vehiculos/${id}/editar`, 'error', 'No se pudo actualizar el vehículo.'));
  }
}

function cambiarEstado(req, res) {
  const id = Number(req.params.id);
  const estado = texto(req.body.estado);

  if (!Number.isInteger(id) || !db.ESTADOS_VALIDOS.includes(estado)) {
    return res.redirect(destinoConMensaje('/admin/vehiculos', 'error', 'Estado no válido.'));
  }

  const resultado = vehiculosModel.cambiarEstado(id, estado);

  if (!resultado.changes) {
    return res.redirect(destinoConMensaje('/admin/vehiculos', 'error', 'Vehículo no encontrado.'));
  }

  return res.redirect(destinoConMensaje('/admin/vehiculos', 'msg', 'Estado actualizado correctamente.'));
}

function eliminar(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.redirect(destinoConMensaje('/admin/vehiculos', 'error', 'Vehículo no válido.'));
  }

  try {
    const imagenes = imagenesModel.listarUrlsPorVehiculo(id);
    const resultado = vehiculosModel.eliminar(id);

    if (!resultado.changes) {
      return res.redirect(destinoConMensaje('/admin/vehiculos', 'error', 'Vehículo no encontrado.'));
    }

    imagenes.forEach((imagen) => eliminarUrl(imagen.url, DIRECTORIO_IMAGENES));
    return res.redirect(destinoConMensaje('/admin/vehiculos', 'msg', 'Vehículo eliminado correctamente.'));
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return res.redirect(destinoConMensaje('/admin/vehiculos', 'error', 'No se puede eliminar un vehículo con consultas o ventas asociadas.'));
    }

    console.error(error);
    return res.redirect(destinoConMensaje('/admin/vehiculos', 'error', 'No se pudo eliminar el vehículo.'));
  }
}

module.exports = { index, nuevo, editar, crear, actualizar, cambiarEstado, eliminar };
