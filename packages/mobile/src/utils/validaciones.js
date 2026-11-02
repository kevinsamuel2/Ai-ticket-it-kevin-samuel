// Validaciones de formularios del lado de la app. El backend vuelve a validar todo: estas son para
// darle feedback inmediato al usuario sin esperar la respuesta del servidor.

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarLogin({ email, contrasenia }) {
  const errores = {};
  if (!email.trim()) errores.email = "Ingresá tu email";
  else if (!FORMATO_EMAIL.test(email.trim())) errores.email = "El email no tiene un formato válido";
  if (!contrasenia) errores.contrasenia = "Ingresá tu contraseña";
  return errores;
}

export const hayErrores = (errores) => Object.keys(errores).length > 0;

const esEnteroPositivo = (texto) => /^\d+$/.test(texto) && Number(texto) > 0;
const esPrecioValido = (texto) => /^\d+(\.\d{1,2})?$/.test(texto);

// "25/12/2026" + "21:30" -> Date (o null si no es una fecha real)
export function armarFecha(fecha, hora) {
  const partesFecha = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(fecha.trim());
  const partesHora = /^(\d{1,2}):(\d{2})$/.exec(hora.trim());
  if (!partesFecha || !partesHora) return null;
  const [, dia, mes, anio] = partesFecha.map(Number);
  const [, horas, minutos] = partesHora.map(Number);
  const resultado = new Date(anio, mes - 1, dia, horas, minutos);
  // Descarta fechas que no existen (ej: 31/02), que Date "corre" al mes siguiente
  const esLaMisma = resultado.getDate() === dia && resultado.getMonth() === mes - 1 && resultado.getHours() === horas;
  return esLaMisma && minutos < 60 ? resultado : null;
}

// Devuelve { campo: mensaje } para los datos generales y { tiposEntrada: [{ campo: mensaje }] } por cada tipo
export function validarEvento({ nombre, descripcion, categoria, fecha, hora, tiposEntrada }, ahora = new Date()) {
  const errores = {};
  if (!nombre.trim()) errores.nombre = "Ingresá el nombre del evento";
  if (!descripcion.trim()) errores.descripcion = "Ingresá una descripción";
  if (!categoria) errores.categoria = "Elegí una categoría";

  const fechaDelEvento = armarFecha(fecha, hora);
  if (!fechaDelEvento) errores.fecha = "Ingresá una fecha (DD/MM/AAAA) y hora (HH:MM) válidas";
  else if (fechaDelEvento <= ahora) errores.fecha = "La fecha tiene que ser futura";

  const erroresDeTipos = tiposEntrada.map((tipo) => {
    const erroresDelTipo = {};
    if (!tipo.nombre.trim()) erroresDelTipo.nombre = "Falta el nombre";
    if (!esPrecioValido(tipo.precio.trim())) erroresDelTipo.precio = "Precio inválido";
    if (!esEnteroPositivo(tipo.cupo.trim())) erroresDelTipo.cupo = "Cupo inválido";
    return erroresDelTipo;
  });
  const nombres = tiposEntrada.map((tipo) => tipo.nombre.trim().toLowerCase()).filter(Boolean);
  if (new Set(nombres).size !== nombres.length) errores.tiposRepetidos = "No puede haber dos tipos con el mismo nombre";
  if (erroresDeTipos.some(hayErrores)) errores.tiposEntrada = erroresDeTipos;

  return errores;
}
