const db = require('../../db/database');
const consultasModel = require('../../models/consultas.model');
const { texto } = require('../../helpers/validaciones');
const { renderConLayout } = require('../../helpers/render');
const { destinoConMensaje } = require('../../helpers/respuestas');

function index(req, res, next) {
  const estadoFiltro = texto(req.query.estado);

  return renderConLayout(res, next, 'admin/consultas/index', {
    titulo: 'Consultas recibidas',
    consultas: consultasModel.listar(estadoFiltro),
    estados: db.ESTADOS_CONSULTA,
    estadoFiltro
  });
}

function cambiarEstado(req, res) {
  const id = Number(req.params.id);
  const estado = texto(req.body.estado);

  if (!Number.isInteger(id) || !db.ESTADOS_CONSULTA.includes(estado)) {
    return res.redirect(destinoConMensaje('/admin/consultas', 'error', 'Estado de consulta no válido.'));
  }

  const resultado = consultasModel.cambiarEstado(id, estado);

  if (!resultado.changes) {
    return res.redirect(destinoConMensaje('/admin/consultas', 'error', 'Consulta no encontrada.'));
  }

  return res.redirect(destinoConMensaje('/admin/consultas', 'msg', 'Estado de la consulta actualizado.'));
}

module.exports = { index, cambiarEstado };
