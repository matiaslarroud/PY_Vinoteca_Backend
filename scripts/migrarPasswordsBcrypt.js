/**
 * Ejecutar UNA SOLA VEZ para hashear las contraseñas existentes con bcrypt.
 * Uso: node scripts/migrarPasswordsBcrypt.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuario_Model');

const SALT_ROUNDS = 10;
const BCRYPT_PREFIX = '$2a$';

async function migrar() {
  await mongoose.connect(
    `mongodb+srv://matutedel30:${process.env.PASS_MONGODB}@vinOteca.thjyjhn.mongodb.net/${process.env.MONGODB_DB}?retryWrites=true&w=majority`
  );
  console.log('Conectado a la BD.');

  const usuarios = await Usuario.find();
  let migrados = 0;

  for (const u of usuarios) {
    if (u.password.startsWith(BCRYPT_PREFIX)) {
      console.log(`  [skip] ${u.name} — ya tiene bcrypt`);
      continue;
    }
    const hash = await bcrypt.hash(u.password, SALT_ROUNDS);
    await Usuario.findByIdAndUpdate(u._id, { password: hash });
    console.log(`  [ok]   ${u.name} — contraseña hasheada`);
    migrados++;
  }

  console.log(`\nMigración completada. ${migrados} usuario(s) actualizados.`);
  await mongoose.disconnect();
}

migrar().catch(err => { console.error(err); process.exit(1); });
