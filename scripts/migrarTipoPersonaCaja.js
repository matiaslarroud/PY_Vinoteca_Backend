/**
 * Ejecutar UNA SOLA VEZ para asignar tipoPersona a los movimientos de Caja existentes.
 * Uso: node scripts/migrarTipoPersonaCaja.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Caja = require('../models/caja_Model');

async function migrar() {
  await mongoose.connect(
    `mongodb+srv://matutedel30:${process.env.PASS_MONGODB}@vinOteca.thjyjhn.mongodb.net/${process.env.MONGODB_DB_PROD}?retryWrites=true&w=majority`
  );
  console.log('Conectado a la BD.');

  const sinTipo = await Caja.find({ tipoPersona: { $exists: false } });
  console.log(`Documentos sin tipoPersona: ${sinTipo.length}`);

  let clientes = 0;
  let proveedores = 0;
  let sinClasificar = 0;

  for (const mov of sinTipo) {
    const ref = (mov.referencia || '').toLowerCase();

    if (ref.includes('cliente')) {
      await Caja.findByIdAndUpdate(mov._id, { tipoPersona: 'CLIENTE' });
      clientes++;
    } else if (ref.includes('proveedor')) {
      await Caja.findByIdAndUpdate(mov._id, { tipoPersona: 'PROVEEDOR' });
      proveedores++;
    } else {
      console.log(`  [sin clasificar] _id: ${mov._id} — referencia: "${mov.referencia}"`);
      sinClasificar++;
    }
  }

  console.log(`\nMigración completada:`);
  console.log(`  CLIENTE:          ${clientes}`);
  console.log(`  PROVEEDOR:        ${proveedores}`);
  console.log(`  Sin clasificar:   ${sinClasificar}`);

  await mongoose.disconnect();
}

migrar().catch(err => { console.error(err); process.exit(1); });
