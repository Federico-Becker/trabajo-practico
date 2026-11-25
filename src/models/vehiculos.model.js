const db = require('../db/database');

const { ESTADOS_VALIDOS } = db;

const ORDENES = {
  precio_asc: 'v.precio ASC',
  precio_desc: 'v.precio DESC',
  anio_desc: 'v.anio DESC',
  anio_asc: 'v.anio ASC',
  mas_recientes: 'v.created_at DESC',
  destacados: 'v.destacado DESC, v.created_at DESC'
};

function listarDisponibles(filtros) {
  const condiciones = ["v.estado = 'disponible'"];
  const parametros = [];

  if (filtros.marcaId !== null) {
    condiciones.push('v.marca_id = ?');
    parametros.push(filtros.marcaId);
  }
  if (filtros.categoriaId !== null) {
    condiciones.push('v.categoria_id = ?');
    parametros.push(filtros.categoriaId);
  }
  if (filtros.busqueda) {
    condiciones.push('(v.modelo LIKE ? OR m.nombre LIKE ? OR c.nombre LIKE ?)');
    const like = `%${filtros.busqueda}%`;
    parametros.push(like, like, like);
  }
  if (filtros.precioMinimo !== null) {
    condiciones.push('v.precio >= ?');
    parametros.push(filtros.precioMinimo);
  }
  if (filtros.precioMaximo !== null) {
    condiciones.push('v.precio <= ?');
    parametros.push(filtros.precioMaximo);
  }
  if (filtros.anioMinimo !== null) {
    condiciones.push('v.anio >= ?');
    parametros.push(filtros.anioMinimo);
  }
  if (filtros.anioMaximo !== null) {
    condiciones.push('v.anio <= ?');
    parametros.push(filtros.anioMaximo);
  }

  const orden = ORDENES[filtros.orden] || ORDENES.destacados;

  return db.prepare(`
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
    ORDER BY ${orden}
  `).all(...parametros);
}

function buscarDisponiblePorId(id) {
  return db.prepare(`
    SELECT v.*, m.nombre AS marca, c.nombre AS categoria
    FROM vehiculos v
    JOIN marcas m ON m.id = v.marca_id
    JOIN categorias c ON c.id = v.categoria_id
    WHERE v.id = ? AND v.estado = 'disponible'
  `).get(id);
}

function listarAdmin(estado) {
  const filtros = [];
  const parametros = [];

  if (ESTADOS_VALIDOS.includes(estado)) {
    filtros.push('v.estado = ?');
    parametros.push(estado);
  }

  const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';

  return db.prepare(`
    SELECT v.*, m.nombre AS marca, c.nombre AS categoria,
           (SELECT COUNT(*) FROM vehiculo_imagenes vi WHERE vi.vehiculo_id = v.id) AS imagenes,
           (SELECT vi.url FROM vehiculo_imagenes vi
            WHERE vi.vehiculo_id = v.id
            ORDER BY CASE WHEN vi.tipo = 'exterior' THEN 0 ELSE 1 END, vi.orden ASC, vi.id ASC
            LIMIT 1) AS imagen_principal
    FROM vehiculos v
    JOIN marcas m ON m.id = v.marca_id
    JOIN categorias c ON c.id = v.categoria_id
    ${where}
    ORDER BY v.id DESC
  `).all(...parametros);
}

function buscarPorId(id) {
  return db.prepare('SELECT * FROM vehiculos WHERE id = ?').get(id);
}

function crear(datos) {
  return db.prepare(`
    INSERT INTO vehiculos
      (marca_id, categoria_id, modelo, anio, precio, kilometraje, combustible, transmision, color, descripcion, estado, destacado)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    datos.marcaId,
    datos.categoriaId,
    datos.modelo,
    datos.anio,
    datos.precio,
    datos.kilometraje,
    datos.combustible,
    datos.transmision,
    datos.color,
    datos.descripcion,
    datos.estado,
    datos.destacado
  );
}

function actualizar(id, datos) {
  return db.prepare(`
    UPDATE vehiculos
    SET marca_id = ?, categoria_id = ?, modelo = ?, anio = ?, precio = ?, kilometraje = ?,
        combustible = ?, transmision = ?, color = ?, descripcion = ?, estado = ?, destacado = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    datos.marcaId,
    datos.categoriaId,
    datos.modelo,
    datos.anio,
    datos.precio,
    datos.kilometraje,
    datos.combustible,
    datos.transmision,
    datos.color,
    datos.descripcion,
    datos.estado,
    datos.destacado,
    id
  );
}

function cambiarEstado(id, estado) {
  return db.prepare(`
    UPDATE vehiculos SET estado = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).run(estado, id);
}

function eliminar(id) {
  return db.prepare('DELETE FROM vehiculos WHERE id = ?').run(id);
}

function conteoDashboard() {
  return db.prepare(`
    SELECT COUNT(*) AS total,
           COALESCE(SUM(CASE WHEN estado = 'disponible' THEN 1 ELSE 0 END), 0) AS disponibles,
           COALESCE(SUM(CASE WHEN estado = 'reservado' THEN 1 ELSE 0 END), 0) AS reservados,
           COALESCE(SUM(CASE WHEN estado = 'vendido' THEN 1 ELSE 0 END), 0) AS vendidos
    FROM vehiculos
  `).get();
}

function listarRecientes() {
  return db.prepare(`
    SELECT v.id, v.modelo, v.anio, v.precio, v.estado, m.nombre AS marca
    FROM vehiculos v
    JOIN marcas m ON m.id = v.marca_id
    ORDER BY v.created_at DESC
    LIMIT 5
  `).all();
}

function listarParaVenta() {
  return db.prepare(`
    SELECT v.id, v.modelo, v.anio, v.precio, v.estado, m.nombre AS marca
    FROM vehiculos v
    JOIN marcas m ON m.id = v.marca_id
    WHERE v.estado IN ('disponible', 'reservado')
    ORDER BY m.nombre, v.modelo
  `).all();
}

module.exports = {
  listarDisponibles,
  buscarDisponiblePorId,
  listarAdmin,
  buscarPorId,
  crear,
  actualizar,
  cambiarEstado,
  eliminar,
  conteoDashboard,
  listarRecientes,
  listarParaVenta
};
