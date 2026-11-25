const db = require('../db/database');
const marcasModel = require('../models/marcas.model');
const categoriasModel = require('../models/categorias.model');

const { ESTADOS_VALIDOS, TIPOS_IMAGEN } = db;
const COMBUSTIBLES = ['Nafta', 'Diésel', 'Híbrido', 'Eléctrico', 'GNC'];
const TRANSMISIONES = ['Manual', 'Automático', 'CVT', 'DCT'];

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

function tipoImagen(valor) {
  const tipo = texto(valor);
  return TIPOS_IMAGEN.includes(tipo) ? tipo : 'exterior';
}

function emailValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
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

  if (!marcaId || !marcasModel.buscarPorId(marcaId)) {
    errores.push('Seleccioná una marca válida.');
  }
  if (!categoriaId || !categoriasModel.buscarPorId(categoriaId)) {
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

module.exports = {
  texto,
  entero,
  numero,
  listaIds,
  tipoImagen,
  emailValido,
  validarVehiculo,
  COMBUSTIBLES,
  TRANSMISIONES
};
