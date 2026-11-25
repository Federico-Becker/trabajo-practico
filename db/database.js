const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const ESTADOS_VALIDOS = ['disponible', 'reservado', 'vendido'];
const ESTADOS_CONSULTA = ['nueva', 'en_gestion', 'cerrada'];
const METODOS_PAGO = ['Efectivo', 'Transferencia', 'Financiación', 'Permuta + Efectivo', 'Crédito prendario'];

fs.mkdirSync(__dirname, { recursive: true });

const db = new Database(path.join(__dirname, 'concesionaria.sqlite'));

db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    rol TEXT NOT NULL DEFAULT 'admin' CHECK (rol IN ('admin', 'usuario')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS marcas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS vehiculos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    marca_id INTEGER NOT NULL,
    categoria_id INTEGER NOT NULL,
    modelo TEXT NOT NULL,
    anio INTEGER NOT NULL,
    precio REAL NOT NULL,
    kilometraje INTEGER NOT NULL DEFAULT 0,
    combustible TEXT NOT NULL,
    transmision TEXT NOT NULL,
    color TEXT,
    descripcion TEXT,
    estado TEXT NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible', 'reservado', 'vendido')),
    destacado INTEGER NOT NULL DEFAULT 0 CHECK (destacado IN (0, 1)),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (marca_id) REFERENCES marcas(id) ON DELETE RESTRICT,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT
  );

  CREATE TABLE IF NOT EXISTS vehiculo_imagenes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehiculo_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    orden INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS consultas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehiculo_id INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    telefono TEXT,
    mensaje TEXT,
    estado TEXT NOT NULL DEFAULT 'nueva' CHECK (estado IN ('nueva', 'en_gestion', 'cerrada')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS ventas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehiculo_id INTEGER NOT NULL UNIQUE,
    comprador_nombre TEXT NOT NULL,
    comprador_email TEXT,
    comprador_telefono TEXT,
    metodo_pago TEXT NOT NULL,
    monto REAL NOT NULL,
    fecha_venta DATE NOT NULL DEFAULT CURRENT_DATE,
    observaciones TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE RESTRICT,
    CHECK (metodo_pago IN ('Efectivo', 'Transferencia', 'Financiación', 'Permuta + Efectivo', 'Crédito prendario'))
  );

  CREATE INDEX IF NOT EXISTS idx_vehiculos_estado ON vehiculos(estado);
  CREATE INDEX IF NOT EXISTS idx_vehiculos_marca ON vehiculos(marca_id);
  CREATE INDEX IF NOT EXISTS idx_vehiculos_categoria ON vehiculos(categoria_id);
  CREATE INDEX IF NOT EXISTS idx_imagenes_vehiculo ON vehiculo_imagenes(vehiculo_id, orden);
  CREATE INDEX IF NOT EXISTS idx_consultas_estado ON consultas(estado);
`);

const adminExiste = db.prepare('SELECT id FROM usuarios WHERE email = ?').get('admin@concesionaria.com');

if (!adminExiste) {
  db.prepare('INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)').run(
    'Administrador',
    'admin@concesionaria.com',
    bcrypt.hashSync('admin123', 10),
    'admin'
  );
}

module.exports = db;
module.exports.ESTADOS_VALIDOS = ESTADOS_VALIDOS;
module.exports.ESTADOS_CONSULTA = ESTADOS_CONSULTA;
module.exports.METODOS_PAGO = METODOS_PAGO;
