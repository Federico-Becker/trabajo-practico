const db = require('../../db/database');
const vehiculosModel = require('../../models/vehiculos.model');
const ventasModel = require('../../models/ventas.model');
const { texto, entero, numero } = require('../../helpers/validaciones');
const { renderConLayout } = require('../../helpers/render');
const { destinoConMensaje } = require('../../helpers/respuestas');

function index(req, res, next) {
  return renderConLayout(res, next, 'admin/ventas/index', {
    titulo: 'Ventas',
    ventas: ventasModel.listar(),
    vehiculos: vehiculosModel.listarParaVenta(),
    metodosPago: db.METODOS_PAGO
  }, { scripts: ['/js/ventas.js'] });
}

function crear(req, res) {
  const vehiculoId = entero(req.body.vehiculo_id);
  const compradorNombre = texto(req.body.comprador_nombre);
  const compradorEmail = texto(req.body.comprador_email);
  const compradorTelefono = texto(req.body.comprador_telefono);
  const metodoPago = texto(req.body.metodo_pago);
  const monto = numero(req.body.monto);
  const observaciones = texto(req.body.observaciones);
  const errores = [];

  const vehiculo = vehiculoId ? vehiculosModel.buscarPorId(vehiculoId) : null;

  if (!vehiculo || vehiculo.estado === 'vendido') {
    errores.push('Seleccioná un vehículo disponible o reservado.');
  }
  if (!compradorNombre) {
    errores.push('El nombre del comprador es obligatorio.');
  }
  if (!db.METODOS_PAGO.includes(metodoPago)) {
    errores.push('Seleccioná un método de pago válido.');
  }
  if (monto === null || monto <= 0) {
    errores.push('El monto de la venta debe ser mayor a cero.');
  }

  if (errores.length) {
    return res.redirect(destinoConMensaje('/admin/ventas', 'error', errores.join(' ')));
  }

  try {
    ventasModel.registrar({
      vehiculoId,
      compradorNombre,
      compradorEmail,
      compradorTelefono,
      metodoPago,
      monto,
      observaciones
    });

    return res.redirect(destinoConMensaje('/admin/ventas', 'msg', 'Venta registrada correctamente.'));
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.redirect(destinoConMensaje('/admin/ventas', 'error', 'Ese vehículo ya tiene una venta registrada.'));
    }

    console.error(error);
    return res.redirect(destinoConMensaje('/admin/ventas', 'error', 'No se pudo registrar la venta.'));
  }
}

module.exports = { index, crear };
