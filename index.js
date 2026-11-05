require('dotenv').config();

if (!process.env.EMPRESA_RAZON_SOCIAL) {
  console.warn('[aviso] Faltan los datos de la empresa (EMPRESA_* en el .env): los PDFs saldrán sin encabezado.');
}
const connectDB = require('./db/db.js');
const app = require('./app.js');

connectDB(app);
