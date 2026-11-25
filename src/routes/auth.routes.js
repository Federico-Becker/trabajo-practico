const express = require('express');
const authController = require('../controllers/auth.controller');
const { requiereInvitado } = require('../middlewares/auth');

const router = express.Router();

router.get('/login', requiereInvitado, authController.login);
router.post('/login', requiereInvitado, authController.iniciarSesion);
router.get('/registro', requiereInvitado, authController.registro);
router.post('/registro', requiereInvitado, authController.crearCuenta);
router.post('/logout', authController.cerrarSesion);

module.exports = router;
