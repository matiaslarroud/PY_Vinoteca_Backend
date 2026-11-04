/**
 * Prepara la base de datos de un negocio (cliente del sistema). Se puede correr más de una vez:
 * solo crea lo que falta y nunca pisa datos existentes, salvo la configuración si se pasan opciones.
 *
 * Uso:
 *   node scripts/inicializarNegocio.js --desde-actual
 *       Carga los datos de "Entusiasmo por el Vino" (los que antes estaban fijos en los PDFs).
 *   node scripts/inicializarNegocio.js --razon-social "Almacén Don Pepe" --color "#1e5b7b" --apagar vinos,picadas
 *       Negocio nuevo. Otras opciones: --nombre-fantasia, --cuit, --telefono, --email, --whatsapp.
 *
 * Usuario administrador: si la base no tiene ninguno, se crea con ADMIN_USUARIO y ADMIN_PASSWORD
 * tomados del entorno (nunca por línea de comandos, para que la contraseña no quede en el historial).
 *
 * Usa MONGODB_URI del .env; para otra base: MONGODB_URI=... node scripts/inicializarNegocio.js ...
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Configuracion = require('../models/configuracion_Model');
const CondicionIva = require('../models/condicionIva_Model');
const TipoComprobante = require('../models/tipoComprobante');
const MedioPago = require('../models/medioPago_Model');
const Usuario = require('../models/usuario_Model');
const getNextSequence = require('../controllers/counter_Controller');
const { MODULOS } = require('../utils/configuracion');

const SALT_ROUNDS = 10;

// Datos reales de Entusiasmo por el Vino (cliente n.º 1), confirmados por el dueño.
const ENTUSIASMO_POR_EL_VINO = {
  empresa: {
    razonSocial: 'Entusiasmo por el Vino',
    nombreFantasia: 'Entusiasmo por el Vino',
    cuit: '20-31658542-7',
    condicionIva: 'Monotributista',
    inicioActividades: '23/03/2023',
    pais: 'Argentina',
    provincia: 'Buenos Aires',
    localidad: 'Trenque Lauquen',
    calle: 'Colón',
    altura: '435',
    telefono: '2392-463978',
    email: 'celtorino191@gmail.com',
  },
  marca: { colorPrimario: '#7b1e2b', whatsapp: '5492392463978' },
};

const OPCIONES_EMPRESA = {
  '--razon-social': 'razonSocial',
  '--nombre-fantasia': 'nombreFantasia',
  '--cuit': 'cuit',
  '--telefono': 'telefono',
  '--email': 'email',
};

const leerArgumentos = (argv) => {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue;
    const siguiente = argv[i + 1];
    if (siguiente === undefined || siguiente.startsWith('--')) args[argv[i]] = true;
    else args[argv[i]] = argv[++i];
  }
  return args;
};

// Traduce los argumentos a un $set sobre la configuración.
const cambiosDeConfiguracion = (args) => {
  const cambios = {};
  if (args['--desde-actual']) {
    Object.entries(ENTUSIASMO_POR_EL_VINO.empresa).forEach(([k, v]) => { cambios[`empresa.${k}`] = v; });
    Object.entries(ENTUSIASMO_POR_EL_VINO.marca).forEach(([k, v]) => { if (v) cambios[`marca.${k}`] = v; });
  }
  Object.entries(OPCIONES_EMPRESA).forEach(([opcion, campo]) => {
    if (typeof args[opcion] === 'string') cambios[`empresa.${campo}`] = args[opcion];
  });
  if (typeof args['--color'] === 'string') cambios['marca.colorPrimario'] = args['--color'];
  if (typeof args['--whatsapp'] === 'string') cambios['marca.whatsapp'] = args['--whatsapp'];
  if (typeof args['--apagar'] === 'string') {
    args['--apagar'].split(',').map((m) => m.trim()).filter(Boolean).forEach((modulo) => {
      if (!MODULOS.includes(modulo)) throw new Error(`Módulo desconocido: ${modulo}. Válidos: ${MODULOS.join(', ')}`);
      cambios[`modulos.${modulo}`] = false;
    });
  }
  return cambios;
};

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
  const args = leerArgumentos(process.argv.slice(2));
  const cambios = cambiosDeConfiguracion(args);

  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Conectado a la BD: ${mongoose.connection.name}\n`);

  // Configuración
  const existe = await Configuracion.exists({ _id: 1 });
  if (!existe) await Configuracion.create({ _id: 1 });
  if (Object.keys(cambios).length) {
    await Configuracion.updateOne({ _id: 1 }, { $set: cambios }, { runValidators: true });
  }
  console.log(`  [ok]   Configuración ${existe ? 'actualizada' : 'creada'} (${Object.keys(cambios).length} campo(s))`);

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
