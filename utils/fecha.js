const ZONA_HORARIA = 'America/Argentina/Buenos_Aires';

// Fecha de hoy (YYYY-MM-DD) según la hora de Argentina, sin importar la zona horaria del servidor.
// Antes se usaba la hora local del servidor: en un host UTC, las ventas después de las 21 h
// quedaban registradas con la fecha del día siguiente.
const obtenerFechaHoy = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA_HORARIA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

module.exports = { obtenerFechaHoy, ZONA_HORARIA };
