const Configuracion = require('../models/configuracion_Model');

const MODULOS = ['vinos', 'picadas', 'produccion', 'ofertas', 'tienda'];

// La configuración se lee en cada PDF y en cada request de un módulo opcional:
// se guarda en memoria y se invalida al modificarla.
let cache = null;

// Devuelve la configuración con todos los valores por defecto completos,
// aunque todavía no exista el documento (base recién creada).
const obtenerConfiguracion = async () => {
  if (cache) return cache;
  const doc = await Configuracion.findById(1).lean();
  cache = doc || new Configuracion({ _id: 1 }).toObject();
  return cache;
};

const invalidarConfiguracion = () => {
  cache = null;
};

const moduloActivo = async (modulo) => (await obtenerConfiguracion()).modulos?.[modulo] !== false;

// Datos que se pueden mostrar sin sesión (pantalla de login, menú, tienda).
const configuracionPublica = (config) => ({
  nombre: config.empresa.nombreFantasia || config.empresa.razonSocial || 'Mi negocio',
  logoUrl: config.marca.logoUrl,
  colorPrimario: config.marca.colorPrimario,
  whatsapp: config.marca.whatsapp,
  // Se imprime en las facturas; el frontend lo usa para fijar la Factura C del monotributo.
  condicionIva: config.empresa.condicionIva,
  modulos: config.modulos,
});

module.exports = { MODULOS, obtenerConfiguracion, invalidarConfiguracion, moduloActivo, configuracionPublica };
