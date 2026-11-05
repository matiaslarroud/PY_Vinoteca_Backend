// Datos del negocio que aparecen en los PDFs. Se leen del entorno (.env) para que cada
// instalación (cada cliente) solo tenga que cambiar sus variables, no el código.
const datosEmpresa = () => ({
  razonSocial: process.env.EMPRESA_RAZON_SOCIAL || '',
  cuit: process.env.EMPRESA_CUIT || '',
  condicionIva: process.env.EMPRESA_CONDICION_IVA || '',
  inicioActividades: process.env.EMPRESA_INICIO_ACTIVIDADES || '',
  pais: process.env.EMPRESA_PAIS || '',
  provincia: process.env.EMPRESA_PROVINCIA || '',
  localidad: process.env.EMPRESA_LOCALIDAD || '',
  barrio: process.env.EMPRESA_BARRIO || '',
  calle: process.env.EMPRESA_CALLE || '',
  altura: process.env.EMPRESA_ALTURA || '',
  telefono: process.env.EMPRESA_TELEFONO || '',
  email: process.env.EMPRESA_EMAIL || '',
});

module.exports = { datosEmpresa };
