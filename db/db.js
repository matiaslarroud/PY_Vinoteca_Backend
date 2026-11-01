const mongoose = require('mongoose');

// Cada entorno (producción / prueba) es un despliegue separado con su propia MONGODB_URI.
const getUri = () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Falta la variable de entorno MONGODB_URI.');
  }
  return uri;
};

// Mongoose crea los índices en segundo plano y, si fallan (por ejemplo, un índice único con
// datos duplicados), no avisa. Se informa en el log para que no pase desapercibido.
// Ver scripts/chequeoPreDespliegue.js para listar los duplicados.
const avisarIndicesFallidos = () => {
  Object.values(mongoose.models).forEach((modelo) => {
    modelo.init().catch((err) => {
      console.error(`⚠️ No se pudo crear un índice de ${modelo.modelName}: ${err.message}`);
    });
  });
};

const connectDatabase = async (app) => {
  const PORT = process.env.PORT || 4000;

  try {
    await mongoose.connect(getUri());
    console.log(`✅ Conexión exitosa a la BD: ${mongoose.connection.name}`);
    app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
    avisarIndicesFallidos();
  } catch (error) {
    console.error('❌ No se pudo conectar a la BD:', error.message);
    process.exit(1);
  }
};

module.exports = connectDatabase;
module.exports.getUri = getUri;
