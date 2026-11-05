/**
 * Prepara una base de datos nueva: tablas base y usuario administrador. Se puede correr más de una
 * vez: solo crea lo que falta y nunca pisa datos existentes.
 *
 * Uso:
 *   ADMIN_USUARIO=admin ADMIN_PASSWORD=... node scripts/inicializarNegocio.js
 *
 * - La base es la de MONGODB_URI (.env). Para otra: MONGODB_URI=... node scripts/inicializarNegocio.js
 * - La contraseña del administrador va por entorno, nunca por línea de comandos.
 * - Si EMPRESA_CONDICION_IVA es Monotributista o Exento, se asegura el tipo de comprobante C.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const CondicionIva = require('../models/condicionIva_Model');
const TipoComprobante = require('../models/tipoComprobante');
const MedioPago = require('../models/medioPago_Model');
const Usuario = require('../models/usuario_Model');
const getNextSequence = require('../controllers/counter_Controller');
const { datosEmpresa } = require('../utils/empresa');
const { emiteFacturaC, obtenerTipoC } = require('../utils/tipoComprobante');

const SALT_ROUNDS = 10;

// Crea los registros de una tabla solo si está vacía.
const sembrarSiVacia = async (Modelo, nombre, registros) => {
  if (await Modelo.countDocuments()) {
    console.log(`  [skip] ${nombre}: ya tiene datos`);
    return [];
  }
  const creados = [];
  for (const registro of registros) {
    const _id = await getNextSequence(Modelo.modelName);
    creados.push(await Modelo.create({ _id, estado: true, ...registro }));
  }
  console.log(`  [ok]   ${nombre}: ${creados.length} registro(s)`);
  return creados;
};

async function inicializar() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Conectado a la BD: ${mongoose.connection.name}\n`);

  // Tablas base. Los nombres "Cuenta Corriente" y "A coordinar" los usa el código: no cambiarlos.
  const condiciones = await sembrarSiVacia(CondicionIva, 'Condiciones de IVA', [
    { name: 'Responsable inscripto' },
    { name: 'Consumidor final' },
    { name: 'Monotributista' },
    { name: 'Exento' },
  ]);
  if (condiciones.length) {
    await sembrarSiVacia(TipoComprobante, 'Tipos de comprobante', [
      { name: 'A', condicionIva: condiciones[0]._id },
      { name: 'B', condicionIva: condiciones[1]._id },
    ]);
  } else {
    console.log('  [skip] Tipos de comprobante: las condiciones de IVA ya existían');
  }
  // Un negocio monotributista o exento factura siempre con C: se asegura que exista.
  if (emiteFacturaC(datosEmpresa().condicionIva)) {
    const tipoC = await obtenerTipoC();
    console.log(`  [ok]   Factura C disponible (tipo de comprobante N° ${tipoC._id})`);
  }
  await sembrarSiVacia(MedioPago, 'Medios de pago', [
    { name: 'Efectivo', interes: 0 },
    { name: 'Cuenta Corriente', interes: 0 },
    { name: 'A coordinar', interes: 0 },
  ]);

  // Usuario administrador
  if (await Usuario.exists({ rol: 'administrador', estado: true })) {
    console.log('  [skip] Administrador: ya existe');
  } else if (process.env.ADMIN_USUARIO && process.env.ADMIN_PASSWORD) {
    const _id = await getNextSequence('Usuario');
    const password = await bcrypt.hash(process.env.ADMIN_PASSWORD, SALT_ROUNDS);
    await Usuario.create({ _id, name: process.env.ADMIN_USUARIO, password, rol: 'administrador', estado: true });
    console.log(`  [ok]   Administrador "${process.env.ADMIN_USUARIO}" creado`);
  } else {
    console.log('  [!]    No hay administrador: definí ADMIN_USUARIO y ADMIN_PASSWORD y volvé a correr el script');
  }

  await mongoose.disconnect();
  console.log('\nListo.');
}

inicializar().catch((err) => { console.error(err.message); process.exit(1); });
