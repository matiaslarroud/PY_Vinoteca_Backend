// Datos de la empresa y logo para el encabezado de los PDFs, tomados de la configuración del negocio.
const path = require('path');
const axios = require('axios');
const { obtenerConfiguracion } = require('../utils/configuracion');

const LOGO_POR_DEFECTO = path.resolve(__dirname, '../public/logo.jpg');

// El logo se descarga una vez por URL; si cambia la URL (logo nuevo) se vuelve a descargar.
let logoCache = { url: null, buffer: null };

const obtenerLogo = async (url) => {
  if (!url) return LOGO_POR_DEFECTO;
  if (logoCache.url === url) return logoCache.buffer;
  try {
    const { data } = await axios.get(url, { responseType: 'arraybuffer', timeout: 5000 });
    logoCache = { url, buffer: Buffer.from(data) };
    return logoCache.buffer;
  } catch {
    return LOGO_POR_DEFECTO;
  }
};

// Devuelve { empresa, logoPath, alicuotaIva }. logoPath es una ruta o un Buffer: pdfkit acepta ambos.
const encabezadoEmpresa = async () => {
  const config = await obtenerConfiguracion();
  return {
    empresa: config.empresa,
    logoPath: await obtenerLogo(config.marca.logoUrl),
    alicuotaIva: config.fiscal.alicuotaIva,
  };
};

module.exports = encabezadoEmpresa;
