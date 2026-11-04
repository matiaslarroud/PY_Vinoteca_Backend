const TipoComprobante = require('../models/tipoComprobante');
const CondicionIva = require('../models/condicionIva_Model');
const getNextSequence = require('../controllers/counter_Controller');
const { obtenerConfiguracion } = require('./configuracion');

const normalizar = (texto) =>
  String(texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();

// Monotributistas y exentos emiten siempre Factura C, sea cual sea el cliente.
// Un responsable inscripto elige A o B según la condición de IVA del cliente.
const emiteFacturaC = (condicionIvaEmisor) => /monotribut|exento/.test(normalizar(condicionIvaEmisor));

// Devuelve el tipo de comprobante C y lo crea si la base todavía no lo tiene.
// El modelo exige una condición de IVA: se asocia a "Monotributista" (la del emisor).
const obtenerTipoC = async () => {
  const existente = await TipoComprobante.findOne({ name: 'C', estado: true }).lean();
  if (existente) return existente;

  const condicion =
    (await CondicionIva.findOne({ name: /monotribut/i, estado: true }).lean()) ||
    (await CondicionIva.findOne({ estado: true }).sort({ _id: 1 }).lean());
  if (!condicion) {
    throw new Error('No hay condiciones de IVA cargadas para crear el tipo de comprobante C.');
  }
  const _id = await getNextSequence('TipoComprobante');
  return (await TipoComprobante.create({ _id, name: 'C', condicionIva: condicion._id, estado: true })).toObject();
};

// Tipo de comprobante con el que se emite una venta. Si el negocio emite Factura C, se usa siempre C
// (lo que mande el formulario se ignora); si no, se respeta el tipo elegido.
const resolverTipoComprobante = async (tipoElegido) => {
  const config = await obtenerConfiguracion();
  if (emiteFacturaC(config.empresa?.condicionIva)) {
    return (await obtenerTipoC())._id;
  }
  return tipoElegido;
};

module.exports = { emiteFacturaC, obtenerTipoC, resolverTipoComprobante };
