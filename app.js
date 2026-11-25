const path = require('path');
const express = require('express');
const session = require('express-session');
const multer = require('multer');

require('./db/database');

const publicRoutes = require('./routes/public.routes');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const requireAdmin = require('./middlewares/auth');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'secreto-desarrollo-cambiar',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 8
  }
}));

app.use((req, res, next) => {
  res.locals.usuarioActual = req.session.usuario || null;
  res.locals.query = req.query;
  res.locals.formatearMoneda = (valor) => new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(Number(valor) || 0);
  res.locals.formatearFecha = (valor) => {
    if (!valor) return '';
    return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(new Date(valor));
  };
  next();
});

app.use('/', publicRoutes);
app.use('/', authRoutes);
app.use('/admin', requireAdmin, adminRoutes);

app.use((req, res) => {
  res.status(404).send('<h1>404 - Página no encontrada</h1><p><a href="/">Volver al catálogo</a></p>');
});

app.use((err, req, res, next) => {
  const mensajesMulter = {
    LIMIT_FILE_SIZE: 'Cada imagen debe pesar como máximo 5 MB.',
    LIMIT_FILE_COUNT: 'Máximo 8 imágenes por vehículo.',
    LIMIT_UNEXPECTED_FILE: 'El campo de imágenes no es válido.'
  };

  if (err instanceof multer.MulterError || err.fromMulter) {
    const mensaje = mensajesMulter[err.code] || err.message;
    const destino = (req.originalUrl || '/').split('?')[0];
    return res.redirect(`${destino}?error=${encodeURIComponent(mensaje)}`);
  }

  console.error(err);
  return res.status(500).send('<h1>Error interno del servidor</h1>');
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || process.env.IP || '0.0.0.0';

if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
  });
}

module.exports = app;
