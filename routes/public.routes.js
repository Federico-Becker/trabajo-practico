const express = require('express');
const db = require('../db/database');

const router = express.Router();

function comoNumero(valor) {
  if (valor === undefined || valor === null || valor === '') return null;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
}

router.get('/', (req, res) => {
  const { marca, categoria, q, precio_min, precio_max, anio_min, anio_max, orden } = req.query;

  const condiciones = ["v.estado = 'disponible'"];
  const parametros = [];

  const marcaId = comoNumero(marca);
  if (marcaId !== null) {
    condiciones.push('v.marca_id = ?');
    parametros.push(marcaId);
  }

  const categoriaId = comoNumero(categoria);
  if (categoriaId !== null) {
    condiciones.push('v.categoria_id = ?');
    parametros.push(categoriaId);
  }

  const busqueda = String(q || '').trim();
  if (busqueda) {
    condiciones.push('(v.modelo LIKE ? OR m.nombre LIKE ? OR c.nombre LIKE ?)');
    const like = `%${busqueda}%`;
    parametros.push(like, like, like);
  }

  const precioMinimo = comoNumero(precio_min);
  if (precioMinimo !== null) {
    condiciones.push('v.precio >= ?');
    parametros.push(precioMinimo);
  }

  const precioMaximo = comoNumero(precio_max);
  if (precioMaximo !== null) {
    condiciones.push('v.precio <= ?');
    parametros.push(precioMaximo);
  }

  const anioMinimo = comoNumero(anio_min);
  if (anioMinimo !== null) {
    condiciones.push('v.anio >= ?');
    parametros.push(anioMinimo);
  }

  const anioMaximo = comoNumero(anio_max);
  if (anioMaximo !== null) {
    condiciones.push('v.anio <= ?');
    parametros.push(anioMaximo);
  }

  const hayFiltros = Boolean(
    busqueda ||
    marcaId !== null ||
    categoriaId !== null ||
    precioMinimo !== null ||
    precioMaximo !== null ||
    anioMinimo !== null ||
    anioMaximo !== null ||
    (orden && String(orden) !== 'mas_recientes')
  );

  const ordenes = {
    precio_asc: 'v.precio ASC',
    precio_desc: 'v.precio DESC',
    anio_desc: 'v.anio DESC',
    anio_asc: 'v.anio ASC',
    mas_recientes: 'v.created_at DESC'
  };
  const ordenSql = ordenes[orden] || 'v.destacado DESC, v.created_at DESC';

  const vehiculos = db.prepare(`
    SELECT v.*,
           m.nombre AS marca,
           c.nombre AS categoria,
            (SELECT vi.url FROM vehiculo_imagenes vi
             WHERE vi.vehiculo_id = v.id
             ORDER BY CASE WHEN vi.tipo = 'exterior' THEN 0 ELSE 1 END, vi.orden ASC, vi.id ASC
             LIMIT 1) AS imagen_principal
    FROM vehiculos v
    JOIN marcas m ON m.id = v.marca_id
    JOIN categorias c ON c.id = v.categoria_id
    WHERE ${condiciones.join(' AND ')}
    ORDER BY ${ordenSql}
  `).all(...parametros);

  const marcas = db.prepare('SELECT id, nombre FROM marcas ORDER BY nombre').all();
  const categorias = db.prepare('SELECT id, nombre FROM categorias ORDER BY nombre').all();

  res.render('public/index', {
    titulo: 'Vehículos disponibles',
    vehiculos,
    marcas,
    categorias,
    filtros: req.query,
    hayFiltros
  });
});

router.get('/vehiculos/:id', (req, res) => {
  const id = Number(req.params.id);

  const vehiculo = db.prepare(`
    SELECT v.*, m.nombre AS marca, c.nombre AS categoria
    FROM vehiculos v
    JOIN marcas m ON m.id = v.marca_id
    JOIN categorias c ON c.id = v.categoria_id
    WHERE v.id = ? AND v.estado = 'disponible'
  `).get(id);

  if (!vehiculo) {
    return res.status(404).send('<h1>404 - Vehículo no encontrado</h1><p><a href="/">Volver al catálogo</a></p>');
  }

  const imagenes = db.prepare(`
    SELECT id, url, orden, tipo FROM vehiculo_imagenes
    WHERE vehiculo_id = ?
    ORDER BY orden ASC, id ASC
  `).all(id);

  return res.render('public/detalle', {
    titulo: `${vehiculo.marca} ${vehiculo.modelo}`,
    vehiculo,
    imagenes
  });
});

router.post('/consultas', (req, res) => {
  const vehiculoId = Number(req.body.vehiculo_id);
  const nombre = String(req.body.nombre || '').trim();
  const email = String(req.body.email || '').trim();
  const telefono = String(req.body.telefono || '').trim();
  const mensaje = String(req.body.mensaje || '').trim();

  const vehiculo = db.prepare("SELECT id FROM vehiculos WHERE id = ? AND estado = 'disponible'").get(vehiculoId);

  if (!vehiculo) {
    return res.redirect('/?error=' + encodeURIComponent('El vehículo consultado no está disponible.'));
  }

  if (!nombre || !email || !mensaje || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.redirect(`/vehiculos/${vehiculoId}?error=${encodeURIComponent('Completá nombre, email y mensaje con un email válido.')}`);
  }

  db.prepare(`
    INSERT INTO consultas (vehiculo_id, nombre, email, telefono, mensaje, estado)
    VALUES (?, ?, ?, ?, ?, 'nueva')
  `).run(vehiculoId, nombre, email, telefono || null, mensaje);

  return res.redirect(`/vehiculos/${vehiculoId}?consulta_enviada=1`);
});

module.exports = router;
