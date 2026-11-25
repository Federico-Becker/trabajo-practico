function requireAdmin(req, res, next) {
  if (req.session && req.session.usuario && req.session.usuario.rol === 'admin') {
    return next();
  }

  req.session.returnTo = req.originalUrl;
  return res.redirect('/login?error=' + encodeURIComponent('Iniciá sesión como administrador para acceder.'));
}

module.exports = requireAdmin;
