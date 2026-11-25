const db = require('../../db/database');
const vehiculosModel = require('../../models/vehiculos.model');
const consultasModel = require('../../models/consultas.model');
const ventasModel = require('../../models/ventas.model');
const { renderConLayout } = require('../../helpers/render');

function dashboard(req, res, next) {
  return renderConLayout(res, next, 'admin/dashboard', {
    titulo: 'Panel administrativo',
    conteo: vehiculosModel.conteoDashboard(),
    consultasNuevas: consultasModel.contarNuevas(),
    ventas: ventasModel.total(),
    ultimasConsultas: consultasModel.listarRecientes(),
    ultimosVehiculos: vehiculosModel.listarRecientes()
  });
}

module.exports = { dashboard };
