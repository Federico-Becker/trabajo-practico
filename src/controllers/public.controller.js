const vehiculosModel = require('../models/vehiculos.model');
const marcasModel = require('../models/marcas.model');
const categoriasModel = require('../models/categorias.model');
const consultasModel = require('../models/consultas.model');
const imagenesModel = require('../models/imagenes.model');
const { entero, numero, texto, emailValido } = require('../helpers/validaciones');
const { renderConLayout } = require('../helpers/render');
const { destinoConMensaje } = require('../helpers/respuestas');

function index(req, res, next) {
  const filtros = {
    marcaId: entero(req.query.marca),
    categoriaId: entero(req.query.categoria),
    busqueda: texto(req.query.q),
    precioMinimo: numero(req.query.precio_min),
    precioMaximo: numero(req.query.precio_max),
    anioMinimo: entero(req.query.anio_min),
    anioMaximo: entero(req.query.anio_max),
    orden: texto(req.query.orden)
  };

  const vehiculos = vehiculosModel.listarDisponibles(filtros);
  const marcas = marcasModel.listar();
  const categorias = categoriasModel.listar();

  return renderConLayout(res, next, 'public/index', {
    titulo: 'Vehículos disponibles',
    vehiculos,
    marcas,
    categorias,
    filtros: req.query
  });
}

function detalle(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(404).send('<h1>404 - Vehículo no encontrado</h1><p><a href="/">Volver al catálogo</a></p>');
  }

  const vehiculo = vehiculosModel.buscarDisponiblePorId(id);

  if (!vehiculo) {
    return res.status(404).send('<h1>404 - Vehículo no encontrado</h1><p><a href="/">Volver al catálogo</a></p>');
  }

  const imagenes = imagenesModel.listarPorVehiculo(id);

  return renderConLayout(res, next, 'public/detalle', {
    titulo: `${vehiculo.marca} ${vehiculo.modelo}`,
    vehiculo,
    imagenes
  }, { scripts: ['/js/gallery.js'] });
}

function crearConsulta(req, res) {
  const vehiculoId = Number(req.body.vehiculo_id);
  const nombre = texto(req.body.nombre);
  const email = texto(req.body.email);
  const telefono = texto(req.body.telefono);
  const mensaje = texto(req.body.mensaje);

  const vehiculo = vehiculosModel.buscarDisponiblePorId(vehiculoId);

  if (!vehiculo) {
    return res.redirect(destinoConMensaje('/', 'error', 'El vehículo consultado no está disponible.'));
  }

  if (!nombre || !email || !mensaje || !emailValido(email)) {
    return res.redirect(`/vehiculos/${vehiculoId}?error=${encodeURIComponent('Completá nombre, email y mensaje con un email válido.')}`);
  }

  consultasModel.crear({ vehiculoId, nombre, email, telefono, mensaje });

  return res.redirect(`/vehiculos/${vehiculoId}?consulta_enviada=1`);
}

module.exports = { index, detalle, crearConsulta };
