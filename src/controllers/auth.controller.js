const bcrypt = require('bcryptjs');
const usuariosModel = require('../models/usuarios.model');
const { texto, emailValido } = require('../helpers/validaciones');
const { renderConLayout } = require('../helpers/render');
const { destinoConMensaje } = require('../helpers/respuestas');

function login(req, res, next) {
  return renderConLayout(res, next, 'auth/login', { titulo: 'Iniciar sesión' });
}

function iniciarSesion(req, res) {
  const email = texto(req.body.email).toLowerCase();
  const password = String(req.body.password || '');

  const usuario = usuariosModel.buscarPorEmail(email);

  if (!usuario || !bcrypt.compareSync(password, usuario.password)) {
    return res.redirect(destinoConMensaje('/login', 'error', 'Email o contraseña incorrectos.'));
  }

  req.session.usuario = {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol
  };

  if (usuario.rol === 'admin') {
    return res.redirect('/admin');
  }

  return res.redirect(destinoConMensaje('/', 'msg', 'Sesión iniciada correctamente.'));
}

function registro(req, res, next) {
  return renderConLayout(res, next, 'auth/registro', { titulo: 'Crear cuenta' });
}

function crearCuenta(req, res) {
  const nombre = texto(req.body.nombre);
  const email = texto(req.body.email).toLowerCase();
  const password = String(req.body.password || '');
  const confirmar = String(req.body.confirmar_password || '');
  const errores = [];

  if (!nombre) {
    errores.push('El nombre es obligatorio.');
  }
  if (!emailValido(email)) {
    errores.push('Ingresá un email válido.');
  } else if (usuariosModel.existeEmail(email)) {
    errores.push('Ya existe una cuenta con ese email.');
  }
  if (password.length < 8) {
    errores.push('La contraseña debe tener al menos 8 caracteres.');
  }
  if (password !== confirmar) {
    errores.push('Las contraseñas no coinciden.');
  }

  if (errores.length) {
    return res.redirect(destinoConMensaje('/registro', 'error', errores.join(' ')));
  }

  try {
    usuariosModel.crear({
      nombre,
      email,
      password: bcrypt.hashSync(password, 10),
      rol: 'usuario'
    });

    return res.redirect(destinoConMensaje('/login', 'msg', 'Cuenta creada. Ingresá con tu nuevo usuario.'));
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.redirect(destinoConMensaje('/registro', 'error', 'Ya existe una cuenta con ese email.'));
    }

    console.error(error);
    return res.redirect(destinoConMensaje('/registro', 'error', 'No se pudo crear la cuenta.'));
  }
}

function cerrarSesion(req, res) {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).send('<h1>No se pudo cerrar la sesión</h1>');
    }

    return res.redirect(destinoConMensaje('/', 'msg', 'Sesión cerrada correctamente.'));
  });
}

module.exports = { login, iniciarSesion, registro, crearCuenta, cerrarSesion };
