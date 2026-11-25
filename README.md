# Beckars Concecionaria

Aplicación web de concesionaria con catálogo público, consultas de clientes y panel administrativo para gestión de vehículos, marcas, categorías, consultas y ventas.

## Stack

- Node.js + Express
- EJS para vistas
- SQLite con `better-sqlite3`
- `express-session` para autenticación
- `multer` para subida de imágenes
- `bcryptjs` para contraseñas

## Estructura

El código de la app vive en `src/`: `app.js`, `db/`, `models/` (SQL), `controllers/`, `routes/`, `middlewares/`, `helpers/`, `views/` y `public/`.

## Instalación

```bash
npm install
npm run seed
npm run dev
```

También podés iniciar sin watch con:

```bash
npm start
```

## URLs

- Catálogo público: http://localhost:3000
- Login: http://localhost:3000/login
- Registro de clientes: http://localhost:3000/registro
- Panel admin: http://localhost:3000/admin

## Usuarios por defecto

- Administrador: `admin@concesionaria.com` / `admin123`.
- Cliente de prueba: `vendedor@concesionaria.com` / `admin123`.

Las consultas requieren sesión iniciada; si no tenés cuenta, registrate en `/registro`. El panel admin requiere rol `admin`.

## Base de datos

La base se crea automáticamente en `src/db/concesionaria.sqlite`.

Tablas: `usuarios`, `marcas`, `categorias`, `vehiculos`, `vehiculo_imagenes`, `consultas`, `ventas`.

El seed carga datos de prueba y usa `INSERT OR IGNORE`, por lo que no sobrescribe registros existentes.

## Imágenes

Las imágenes de vehículos se guardan en `src/public/uploads/vehiculos/` y se sirven desde `/uploads/vehiculos/`.

Formatos permitidos: JPG, JPEG, PNG y WEBP. Máximo 5 MB por imagen y hasta 8 imágenes por vehículo.

## Variables de entorno

- `PORT`: puerto del servidor, por defecto `3000`.
- `HOST` o `IP`: interfaz de escucha, por defecto `0.0.0.0`.
- `SESSION_SECRET`: secreto de sesión, por defecto `'secreto-desarrollo-cambiar'`.
