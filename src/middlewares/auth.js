const { destinoConMensaje } = require('../helpers/respuestas');

function requiereUsuario(req, res, next) {
  if (req.session && req.session.usuario) {
    return next();
  }

  return res.redirect(destinoConMensaje('/login', 'error', 'Iniciá sesión para continuar.'));
}

function requiereAdmin(req, res, next) {
  if (req.session && req.session.usuario && req.session.usuario.rol === 'admin') {
    return next();
  }

  return res.redirect('/');
}

function requiereInvitado(req, res, next) {
  if (req.session && req.session.usuario) {
    return res.redirect('/');
  }

  return next();
}

module.exports = { requiereUsuario, requiereAdmin, requiereInvitado };
