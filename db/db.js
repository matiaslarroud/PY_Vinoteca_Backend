const mongoose = require('mongoose');

let currentDb = 'prod';

const buildUri = (dbName) =>
  `mongodb+srv://matutedel30:${process.env.PASS_MONGODB}@vinOteca.thjyjhn.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Vinoteca`;

const connectDatabase = async (app) => {
  const PORT = process.env.PORT || 4000;
  const dbName = process.env.MONGODB_DB_PROD;

  try {
    await mongoose.connect(buildUri(dbName));
    currentDb = 'prod';
    console.log(`✅ Conexión exitosa a la BD: ${dbName}`);
    app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
  } catch (error) {
    console.error('❌ No se pudo conectar a la BD:', error.message);
    process.exit(1);
  }
};

const switchDatabase = async (target) => {
  const dbName = target === 'dev' ? process.env.MONGODB_DB_DEV : process.env.MONGODB_DB_PROD;
  await mongoose.disconnect();
  await mongoose.connect(buildUri(dbName));
  currentDb = target;
  console.log(`🔄 BD activa: ${dbName}`);
};

const getCurrentDb = () => ({
  target: currentDb,
  dbName: currentDb === 'dev' ? process.env.MONGODB_DB_DEV : process.env.MONGODB_DB_PROD,
});

module.exports = connectDatabase;
module.exports.switchDatabase = switchDatabase;
module.exports.getCurrentDb = getCurrentDb;
