const obtenerFechaHoy = () => new Date().toISOString().split('T')[0];

module.exports = { obtenerFechaHoy };
