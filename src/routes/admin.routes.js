const express = require('express');
const uploadVehiculos = require('../middlewares/upload');
const { requiereUsuario, requiereAdmin } = require('../middlewares/auth');
const dashboardController = require('../controllers/admin/dashboard.controller');
const vehiculosController = require('../controllers/admin/vehiculos.controller');
const marcasController = require('../controllers/admin/marcas.controller');
const categoriasController = require('../controllers/admin/categorias.controller');
const consultasController = require('../controllers/admin/consultas.controller');
const ventasController = require('../controllers/admin/ventas.controller');

const router = express.Router();

router.use(requiereUsuario, requiereAdmin);

router.get('/', dashboardController.dashboard);

router.get('/vehiculos', vehiculosController.index);
router.get('/vehiculos/nuevo', vehiculosController.nuevo);
router.get('/vehiculos/:id/editar', vehiculosController.editar);
router.post('/vehiculos', uploadVehiculos, vehiculosController.crear);
router.post('/vehiculos/:id/editar', uploadVehiculos, vehiculosController.actualizar);
router.post('/vehiculos/:id/estado', vehiculosController.cambiarEstado);
router.post('/vehiculos/:id/eliminar', vehiculosController.eliminar);

router.get('/marcas', marcasController.index);
router.post('/marcas', marcasController.crear);
router.post('/marcas/:id/actualizar', marcasController.actualizar);
router.post('/marcas/:id/eliminar', marcasController.eliminar);

router.get('/categorias', categoriasController.index);
router.post('/categorias', categoriasController.crear);
router.post('/categorias/:id/actualizar', categoriasController.actualizar);
router.post('/categorias/:id/eliminar', categoriasController.eliminar);

router.get('/consultas', consultasController.index);
router.post('/consultas/:id/estado', consultasController.cambiarEstado);

router.get('/ventas', ventasController.index);
router.post('/ventas', ventasController.crear);

module.exports = router;
