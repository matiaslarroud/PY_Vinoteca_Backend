const mongoose = require('mongoose');

const connectDatabase = async (app) => {
  const PORT = process.env.PORT || 4000;

  try {
    await mongoose.connect(
      `mongodb+srv://matutedel30:${process.env.PASS_MONGODB}@vinOteca.thjyjhn.mongodb.net/${process.env.MONGODB_DB}?retryWrites=true&w=majority&appName=Vinoteca`
    );
    console.log('✅ Conexión exitosa a la BD.');
    app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
  } catch (error) {
    console.error('❌ No se pudo conectar a la BD:', error.message);
    process.exit(1);
  }
};

module.exports = connectDatabase;
