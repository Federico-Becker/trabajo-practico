const fs = require('fs');
const path = require('path');
const express = require('express');
const db = require('../db/database');
const uploadVehiculos = require('../middlewares/upload');

const { ESTADOS_VALIDOS, ESTADOS_CONSULTA, METODOS_PAGO } = db;
const COMBUSTIBLES = ['Nafta', 'Diésel', 'Híbrido', 'Eléctrico', 'GNC'];
const TRANSMISIONES = ['Manual', 'Automático', 'CVT', 'DCT'];
const DIRECTORIO_IMAGENES = path.join(__dirname, '..', 'public', 'uploads', 'vehiculos');

const router = express.Router();

function texto(valor) {
  return String(valor ?? '').trim();
}

function entero(valor) {
  if (valor === undefined || valor === null || valor === '') return null;
  const numero = Number(valor);
  return Number.isInteger(numero) ? numero : null;
}

function numero(valor) {
  if (valor === undefined || valor === null || valor === '') return null;
  const resultado = Number(valor);
  return Number.isFinite(resultado) ? resultado : null;
}

function listaIds(valor) {
  if (!valor) return [];
  const arreglo = Array.isArray(valor) ? valor : [valor];
  return arreglo.map(Number).filter((id) => Number.isInteger(id) && id > 0);
}

function urlDeArchivo(file) {
  return '/uploads/vehiculos/' + file.filename;
}

function eliminarArchivos(files) {
  (files || []).forEach((file) => {
    try {
      fs.unlinkSync(file.path);
    } catch (error) {
      void error;
    }
  });
}

function eliminarUrl(url) {
  if (!url || !url.startsWith('/uploads/vehiculos/')) return;
  try {
    fs.unlinkSync(path.join(DIRECTORIO_IMAGENES, path.basename(url)));
  } catch (error) {
    void error;
  }
}

function destinoConMensaje(destino, clave, mensaje) {
  return `${destino}?${clave}=${encodeURIComponent(mensaje)}`;
}

function validarVehiculo(body) {
  const marcaId = entero(body.marca_id);
  const categoriaId = entero(body.categoria_id);
  const modelo = texto(body.modelo);
  const anio = entero(body.anio);
  const precio = numero(body.precio);
  const kilometraje = body.kilometraje === undefined || body.kilometraje === '' ? 0 : numero(body.kilometraje);
  const combustible = texto(body.combustible);
  const transmision = texto(body.transmision);
  const color = texto(body.color);
  const descripcion = texto(body.descripcion);
  const estado = texto(body.estado) || 'disponible';
  const destacado = body.destacado ? 1 : 0;
  const errores = [];

  if (!marcaId || !db.prepare('SELECT id FROM marcas WHERE id = ?').get(marcaId)) {
    errores.push('Seleccioná una marca válida.');
  }
  if (!categoriaId || !db.prepare('SELECT id FROM categorias WHERE id = ?').get(categoriaId)) {
    errores.push('Seleccioná una categoría válida.');
  }
  if (!modelo) {
    errores.push('El modelo es obligatorio.');
  }
  if (!anio || anio < 1900 || anio > 2100) {
    errores.push('El año debe estar entre 1900 y 2100.');
  }
  if (precio === null || precio < 0) {
    errores.push('El precio debe ser un número mayor o igual a cero.');
  }
  if (kilometraje === null || kilometraje < 0) {
    errores.push('El kilometraje debe ser un número mayor o igual a cero.');
  }
  if (!combustible) {
    errores.push('Seleccioná el combustible.');
  }
  if (!transmision) {
    errores.push('Seleccioná la transmisión.');
  }
  if (!ESTADOS_VALIDOS.includes(estado)) {
    errores.push('El estado seleccionado no es válido.');
  }

  return {
    errores,
    datos: {
      marcaId,
      categoriaId,
      modelo,
      anio,
      precio,
      kilometraje,
      combustible,
      transmision,
      color,
      descripcion,
      estado,
      destacado
    }
  };
}

router.get('/', (req, res) => {
  const conteo = db.prepare(`
    SELECT COUNT(*) AS total,
           COALESCE(SUM(CASE WHEN estado = 'disponible' THEN 1 ELSE 0 END), 0) AS disponibles,
           COALESCE(SUM(CASE WHEN estado = 'reservado' THEN 1 ELSE 0 END), 0) AS reservados,
           COALESCE(SUM(CASE WHEN estado = 'vendido' THEN 1 ELSE 0 END), 0) AS vendidos
    FROM vehiculos
  `).get();

  const consultasNuevas = db.prepare("SELECT COUNT(*) AS total FROM consultas WHERE estado = 'nueva'").get().total;

  const ventas = db.prepare(`
    SELECT COUNT(*) AS total, COALESCE(SUM(monto), 0) AS monto FROM ventas
  `).get();

  const ultimasConsultas = db.prepare(`
    SELECT c.id, c.nombre, c.email, c.estado, c.created_at, v.modelo, m.nombre AS marca
    FROM consultas c
    JOIN vehiculos v ON v.id = c.vehiculo_id
    JOIN marcas m ON m.id = v.marca_id
    ORDER BY c.created_at DESC
    LIMIT 5
  `).all();

  const ultimosVehiculos = db.prepare(`
    SELECT v.id, v.modelo, v.anio, v.precio, v.estado, m.nombre AS marca
    FROM vehiculos v
    JOIN marcas m ON m.id = v.marca_id
    ORDER BY v.created_at DESC
    LIMIT 5
  `).all();

  res.render('admin/dashboard', {
    titulo: 'Panel administrativo',
    conteo,
    consultasNuevas,
    ventas,
    ultimasConsultas,
    ultimosVehiculos
  });
});

router.get('/vehiculos', (req, res) => {
  const estadoFiltro = texto(req.query.estado);
  const filtros = [];
  const parametros = [];

  if (ESTADOS_VALIDOS.includes(estadoFiltro)) {
    filtros.push('v.estado = ?');
    parametros.push(estadoFiltro);
  }

  const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';

  const vehiculos = db.prepare(`
    SELECT v.*, m.nombre AS marca, c.nombre AS categoria,
           (SELECT COUNT(*) FROM vehiculo_imagenes vi WHERE vi.vehiculo_id = v.id) AS imagenes
    FROM vehiculos v
    JOIN marcas m ON m.id = v.marca_id
    JOIN categorias c ON c.id = v.categoria_id
    ${where}
    ORDER BY v.id DESC
  `).all(...parametros);

  res.render('admin/vehiculos/index', {
    titulo: 'Administrar vehículos',
    vehiculos,
    estados: ESTADOS_VALIDOS,
    estadoFiltro
  });
});

router.get('/vehiculos/nuevo', (req, res) => {
  res.render('admin/vehiculos/form', {
    titulo: 'Nuevo vehículo',
    vehiculo: null,
    imagenes: [],
    marcas: db.prepare('SELECT id, nombre FROM marcas ORDER BY nombre').all(),
    categorias: db.prepare('SELECT id, nombre FROM categorias ORDER BY nombre').all(),
    estados: ESTADOS_VALIDOS,
    combustibles: COMBUSTIBLES,
    transmisiones: TRANSMISIONES,
    editando: false,
    action: '/admin/vehiculos'
  });
});

router.get('/vehiculos/:id/editar', (req, res) => {
  const id = Number(req.params.id);
  const vehiculo = Number.isInteger(id)
    ? db.prepare('SELECT * FROM vehiculos WHERE id = ?').get(id)
    : null;

  if (!vehiculo) {
    return res.redirect(destinoConMensaje('/admin/vehiculos', 'error', 'Vehículo no encontrado.'));
  }

  const imagenes = db.prepare(`
    SELECT id, url, orden FROM vehiculo_imagenes
    WHERE vehiculo_id = ? ORDER BY orden ASC, id ASC
  `).all(id);

  return res.render('admin/vehiculos/form', {
    titulo: 'Editar vehículo',
    vehiculo,
    imagenes,
    marcas: db.prepare('SELECT id, nombre FROM marcas ORDER BY nombre').all(),
    categorias: db.prepare('SELECT id, nombre FROM categorias ORDER BY nombre').all(),
    estados: ESTADOS_VALIDOS,
    combustibles: COMBUSTIBLES,
    transmisiones: TRANSMISIONES,
    editando: true,
    action: `/admin/vehiculos/${id}/editar`
  });
});

router.post('/vehiculos', uploadVehiculos, (req, res) => {
  const { errores, datos } = validarVehiculo(req.body);

  if (errores.length) {
    eliminarArchivos(req.files);
    return res.redirect(destinoConMensaje('/admin/vehiculos/nuevo', 'error', errores.join(' ')));
  }

  try {
    db.transaction(() => {
      const resultado = db.prepare(`
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

      const vehiculoId = Number(resultado.lastInsertRowid);
      const insertarImagen = db.prepare(`
        INSERT INTO vehiculo_imagenes (vehiculo_id, url, orden) VALUES (?, ?, ?)
      `);

      (req.files || []).forEach((file, indice) => {
        insertarImagen.run(vehiculoId, urlDeArchivo(file), indice);
      });
    })();

    return res.redirect(destinoConMensaje('/admin/vehiculos', 'msg', 'Vehículo creado correctamente.'));
  } catch (error) {
    console.error(error);
    eliminarArchivos(req.files);
    return res.redirect(destinoConMensaje('/admin/vehiculos/nuevo', 'error', 'No se pudo crear el vehículo.'));
  }
});

router.post('/vehiculos/:id/editar', uploadVehiculos, (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || !db.prepare('SELECT id FROM vehiculos WHERE id = ?').get(id)) {
    eliminarArchivos(req.files);
    return res.redirect(destinoConMensaje('/admin/vehiculos', 'error', 'Vehículo no encontrado.'));
  }

  const { errores, datos } = validarVehiculo(req.body);

  if (errores.length) {
    eliminarArchivos(req.files);
    return res.redirect(destinoConMensaje(`/admin/vehiculos/${id}/editar`, 'error', errores.join(' ')));
  }

  try {
    db.transaction(() => {
      db.prepare(`
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

      const idsEliminar = listaIds(req.body.imagenes_eliminar);

      if (idsEliminar.length) {
        const marcadores = idsEliminar.map(() => '?').join(', ');
        const imagenes = db.prepare(`
          SELECT id, url FROM vehiculo_imagenes
          WHERE vehiculo_id = ? AND id IN (${marcadores})
        `).all(id, ...idsEliminar);

        db.prepare(`
          DELETE FROM vehiculo_imagenes
          WHERE vehiculo_id = ? AND id IN (${marcadores})
        `).run(id, ...idsEliminar);

        imagenes.forEach((imagen) => eliminarUrl(imagen.url));
      }

      const maxOrden = db.prepare(`
        SELECT COALESCE(MAX(orden), -1) AS maximo FROM vehiculo_imagenes WHERE vehiculo_id = ?
      `).get(id).maximo;

      const insertarImagen = db.prepare(`
        INSERT INTO vehiculo_imagenes (vehiculo_id, url, orden) VALUES (?, ?, ?)
      `);

      (req.files || []).forEach((file, indice) => {
        insertarImagen.run(id, urlDeArchivo(file), maxOrden + 1 + indice);
      });
    })();

    return res.redirect(destinoConMensaje('/admin/vehiculos', 'msg', 'Vehículo actualizado correctamente.'));
  } catch (error) {
    console.error(error);
    eliminarArchivos(req.files);
    return res.redirect(destinoConMensaje(`/admin/vehiculos/${id}/editar`, 'error', 'No se pudo actualizar el vehículo.'));
  }
});

router.post('/vehiculos/:id/estado', (req, res) => {
  const id = Number(req.params.id);
  const estado = texto(req.body.estado);

  if (!Number.isInteger(id) || !ESTADOS_VALIDOS.includes(estado)) {
    return res.redirect(destinoConMensaje('/admin/vehiculos', 'error', 'Estado no válido.'));
  }

  const resultado = db.prepare(`
    UPDATE vehiculos SET estado = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).run(estado, id);

  if (!resultado.changes) {
    return res.redirect(destinoConMensaje('/admin/vehiculos', 'error', 'Vehículo no encontrado.'));
  }

  return res.redirect(destinoConMensaje('/admin/vehiculos', 'msg', 'Estado actualizado correctamente.'));
});

router.post('/vehiculos/:id/eliminar', (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.redirect(destinoConMensaje('/admin/vehiculos', 'error', 'Vehículo no válido.'));
  }

  try {
    const imagenes = db.prepare('SELECT url FROM vehiculo_imagenes WHERE vehiculo_id = ?').all(id);
    const resultado = db.prepare('DELETE FROM vehiculos WHERE id = ?').run(id);

    if (!resultado.changes) {
      return res.redirect(destinoConMensaje('/admin/vehiculos', 'error', 'Vehículo no encontrado.'));
    }

    imagenes.forEach((imagen) => eliminarUrl(imagen.url));
    return res.redirect(destinoConMensaje('/admin/vehiculos', 'msg', 'Vehículo eliminado correctamente.'));
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return res.redirect(destinoConMensaje('/admin/vehiculos', 'error', 'No se puede eliminar un vehículo con consultas o ventas asociadas.'));
    }

    console.error(error);
    return res.redirect(destinoConMensaje('/admin/vehiculos', 'error', 'No se pudo eliminar el vehículo.'));
  }
});

router.get('/marcas', (req, res) => {
  const marcas = db.prepare(`
    SELECT m.id, m.nombre, m.created_at, COUNT(v.id) AS total_vehiculos
    FROM marcas m
    LEFT JOIN vehiculos v ON v.marca_id = m.id
    GROUP BY m.id
    ORDER BY m.nombre
  `).all();

  res.render('admin/marcas/index', { titulo: 'Administrar marcas', marcas });
});

router.post('/marcas', (req, res) => {
  const nombre = texto(req.body.nombre);

  if (!nombre) {
    return res.redirect(destinoConMensaje('/admin/marcas', 'error', 'El nombre de la marca es obligatorio.'));
  }

  try {
    db.prepare('INSERT INTO marcas (nombre) VALUES (?)').run(nombre);
    return res.redirect(destinoConMensaje('/admin/marcas', 'msg', 'Marca creada correctamente.'));
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.redirect(destinoConMensaje('/admin/marcas', 'error', 'Ya existe una marca con ese nombre.'));
    }

    console.error(error);
    return res.redirect(destinoConMensaje('/admin/marcas', 'error', 'No se pudo crear la marca.'));
  }
});

router.post('/marcas/:id/actualizar', (req, res) => {
  const id = Number(req.params.id);
  const nombre = texto(req.body.nombre);

  if (!Number.isInteger(id) || !nombre) {
    return res.redirect(destinoConMensaje('/admin/marcas', 'error', 'Datos de marca no válidos.'));
  }

  try {
    const resultado = db.prepare('UPDATE marcas SET nombre = ? WHERE id = ?').run(nombre, id);

    if (!resultado.changes) {
      return res.redirect(destinoConMensaje('/admin/marcas', 'error', 'Marca no encontrada.'));
    }

    return res.redirect(destinoConMensaje('/admin/marcas', 'msg', 'Marca actualizada correctamente.'));
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.redirect(destinoConMensaje('/admin/marcas', 'error', 'Ya existe una marca con ese nombre.'));
    }

    console.error(error);
    return res.redirect(destinoConMensaje('/admin/marcas', 'error', 'No se pudo actualizar la marca.'));
  }
});

router.post('/marcas/:id/eliminar', (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.redirect(destinoConMensaje('/admin/marcas', 'error', 'Marca no válida.'));
  }

  try {
    const resultado = db.prepare('DELETE FROM marcas WHERE id = ?').run(id);

    if (!resultado.changes) {
      return res.redirect(destinoConMensaje('/admin/marcas', 'error', 'Marca no encontrada.'));
    }

    return res.redirect(destinoConMensaje('/admin/marcas', 'msg', 'Marca eliminada correctamente.'));
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return res.redirect(destinoConMensaje('/admin/marcas', 'error', 'No se puede eliminar una marca con vehículos asociados.'));
    }

    console.error(error);
    return res.redirect(destinoConMensaje('/admin/marcas', 'error', 'No se pudo eliminar la marca.'));
  }
});

router.get('/categorias', (req, res) => {
  const categorias = db.prepare(`
    SELECT c.id, c.nombre, c.created_at, COUNT(v.id) AS total_vehiculos
    FROM categorias c
    LEFT JOIN vehiculos v ON v.categoria_id = c.id
    GROUP BY c.id
    ORDER BY c.nombre
  `).all();

  res.render('admin/categorias/index', { titulo: 'Administrar categorías', categorias });
});

router.post('/categorias', (req, res) => {
  const nombre = texto(req.body.nombre);

  if (!nombre) {
    return res.redirect(destinoConMensaje('/admin/categorias', 'error', 'El nombre de la categoría es obligatorio.'));
  }

  try {
    db.prepare('INSERT INTO categorias (nombre) VALUES (?)').run(nombre);
    return res.redirect(destinoConMensaje('/admin/categorias', 'msg', 'Categoría creada correctamente.'));
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.redirect(destinoConMensaje('/admin/categorias', 'error', 'Ya existe una categoría con ese nombre.'));
    }

    console.error(error);
    return res.redirect(destinoConMensaje('/admin/categorias', 'error', 'No se pudo crear la categoría.'));
  }
});

router.post('/categorias/:id/actualizar', (req, res) => {
  const id = Number(req.params.id);
  const nombre = texto(req.body.nombre);

  if (!Number.isInteger(id) || !nombre) {
    return res.redirect(destinoConMensaje('/admin/categorias', 'error', 'Datos de categoría no válidos.'));
  }

  try {
    const resultado = db.prepare('UPDATE categorias SET nombre = ? WHERE id = ?').run(nombre, id);

    if (!resultado.changes) {
      return res.redirect(destinoConMensaje('/admin/categorias', 'error', 'Categoría no encontrada.'));
    }

    return res.redirect(destinoConMensaje('/admin/categorias', 'msg', 'Categoría actualizada correctamente.'));
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.redirect(destinoConMensaje('/admin/categorias', 'error', 'Ya existe una categoría con ese nombre.'));
    }

    console.error(error);
    return res.redirect(destinoConMensaje('/admin/categorias', 'error', 'No se pudo actualizar la categoría.'));
  }
});

router.post('/categorias/:id/eliminar', (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.redirect(destinoConMensaje('/admin/categorias', 'error', 'Categoría no válida.'));
  }

  try {
    const resultado = db.prepare('DELETE FROM categorias WHERE id = ?').run(id);

    if (!resultado.changes) {
      return res.redirect(destinoConMensaje('/admin/categorias', 'error', 'Categoría no encontrada.'));
    }

    return res.redirect(destinoConMensaje('/admin/categorias', 'msg', 'Categoría eliminada correctamente.'));
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return res.redirect(destinoConMensaje('/admin/categorias', 'error', 'No se puede eliminar una categoría con vehículos asociados.'));
    }

    console.error(error);
    return res.redirect(destinoConMensaje('/admin/categorias', 'error', 'No se pudo eliminar la categoría.'));
  }
});

router.get('/consultas', (req, res) => {
  const estadoFiltro = texto(req.query.estado);
  const filtros = [];
  const parametros = [];

  if (ESTADOS_CONSULTA.includes(estadoFiltro)) {
    filtros.push('c.estado = ?');
    parametros.push(estadoFiltro);
  }

  const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';

  const consultas = db.prepare(`
    SELECT c.*, v.modelo, m.nombre AS marca
    FROM consultas c
    JOIN vehiculos v ON v.id = c.vehiculo_id
    JOIN marcas m ON m.id = v.marca_id
    ${where}
    ORDER BY c.created_at DESC
  `).all(...parametros);

  res.render('admin/consultas/index', {
    titulo: 'Consultas recibidas',
    consultas,
    estados: ESTADOS_CONSULTA,
    estadoFiltro
  });
});

router.post('/consultas/:id/estado', (req, res) => {
  const id = Number(req.params.id);
  const estado = texto(req.body.estado);

  if (!Number.isInteger(id) || !ESTADOS_CONSULTA.includes(estado)) {
    return res.redirect(destinoConMensaje('/admin/consultas', 'error', 'Estado de consulta no válido.'));
  }

  const resultado = db.prepare('UPDATE consultas SET estado = ? WHERE id = ?').run(estado, id);

  if (!resultado.changes) {
    return res.redirect(destinoConMensaje('/admin/consultas', 'error', 'Consulta no encontrada.'));
  }

  return res.redirect(destinoConMensaje('/admin/consultas', 'msg', 'Estado de la consulta actualizado.'));
});

router.get('/ventas', (req, res) => {
  const ventas = db.prepare(`
    SELECT vta.*, v.modelo, v.anio, m.nombre AS marca
    FROM ventas vta
    JOIN vehiculos v ON v.id = vta.vehiculo_id
    JOIN marcas m ON m.id = v.marca_id
    ORDER BY vta.fecha_venta DESC, vta.id DESC
  `).all();

  const vehiculos = db.prepare(`
    SELECT v.id, v.modelo, v.anio, v.precio, v.estado, m.nombre AS marca
    FROM vehiculos v
    JOIN marcas m ON m.id = v.marca_id
    WHERE v.estado IN ('disponible', 'reservado')
    ORDER BY m.nombre, v.modelo
  `).all();

  res.render('admin/ventas/index', {
    titulo: 'Ventas',
    ventas,
    vehiculos,
    metodosPago: METODOS_PAGO
  });
});

router.post('/ventas', (req, res) => {
  const vehiculoId = entero(req.body.vehiculo_id);
  const compradorNombre = texto(req.body.comprador_nombre);
  const compradorEmail = texto(req.body.comprador_email);
  const compradorTelefono = texto(req.body.comprador_telefono);
  const metodoPago = texto(req.body.metodo_pago);
  const monto = numero(req.body.monto);
  const observaciones = texto(req.body.observaciones);
  const errores = [];

  const vehiculo = vehiculoId ? db.prepare('SELECT id, estado, precio FROM vehiculos WHERE id = ?').get(vehiculoId) : null;

  if (!vehiculo || vehiculo.estado === 'vendido') {
    errores.push('Seleccioná un vehículo disponible o reservado.');
  }
  if (!compradorNombre) {
    errores.push('El nombre del comprador es obligatorio.');
  }
  if (!METODOS_PAGO.includes(metodoPago)) {
    errores.push('Seleccioná un método de pago válido.');
  }
  if (monto === null || monto <= 0) {
    errores.push('El monto de la venta debe ser mayor a cero.');
  }

  if (errores.length) {
    return res.redirect(destinoConMensaje('/admin/ventas', 'error', errores.join(' ')));
  }

  try {
    db.transaction(() => {
      db.prepare(`
        INSERT INTO ventas
          (vehiculo_id, comprador_nombre, comprador_email, comprador_telefono, metodo_pago, monto, observaciones)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        vehiculoId,
        compradorNombre,
        compradorEmail || null,
        compradorTelefono || null,
        metodoPago,
        monto,
        observaciones || null
      );

      db.prepare("UPDATE vehiculos SET estado = 'vendido', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(vehiculoId);
    })();

    return res.redirect(destinoConMensaje('/admin/ventas', 'msg', 'Venta registrada correctamente.'));
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.redirect(destinoConMensaje('/admin/ventas', 'error', 'Ese vehículo ya tiene una venta registrada.'));
    }

    console.error(error);
    return res.redirect(destinoConMensaje('/admin/ventas', 'error', 'No se pudo registrar la venta.'));
  }
});

module.exports = router;
