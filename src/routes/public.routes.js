const express = require('express');
const publicController = require('../controllers/public.controller');
const { requiereUsuario } = require('../middlewares/auth');

const router = express.Router();

router.get('/', publicController.index);
router.get('/vehiculos/:id', publicController.detalle);
router.post('/consultas', requiereUsuario, publicController.crearConsulta);

module.exports = router;
