const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db/database');

const router = express.Router();

router.get('/login', (req, res) => {
  if (req.session.usuario && req.session.usuario.rol === 'admin') {
    return res.redirect('/admin');
  }

  return res.render('auth/login', { titulo: 'Iniciar sesión' });
});

router.post('/login', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  const usuario = db.prepare('SELECT id, nombre, email, password, rol FROM usuarios WHERE lower(email) = ?').get(email);

  if (!usuario || !bcrypt.compareSync(password, usuario.password)) {
    return res.redirect('/login?error=' + encodeURIComponent('Email o contraseña incorrectos.'));
  }

  req.session.usuario = {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol
  };

  const destino = req.session.returnTo || '/admin';
  delete req.session.returnTo;

  return res.redirect(destino);
});

router.post('/logout', (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).send('<h1>No se pudo cerrar la sesión</h1>');
    }

    return res.redirect('/?msg=' + encodeURIComponent('Sesión cerrada correctamente.'));
  });
});

module.exports = router;
