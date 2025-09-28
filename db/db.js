const mongoose = require("mongoose");

const connectDatabase = (app) => {
  const PORT = process.env.PORT || 4000;

  // Levantar el server aunque la BD falle
  app.listen(PORT, () => {
    console.log("Servidor escuchando en puerto", PORT);
  });

  mongoose
    .connect(`mongodb+srv://matutedel30:${process.env.PASS_MONGODB}@vinOteca.thjyjhn.mongodb.net/Vinoteca?retryWrites=true&w=majority&appName=Vinoteca`)
    .then(() => {
      console.log("✅ Conexión exitosa a la BD.");
    })
    .catch((error) => {
      console.error("❌ Error al conectar a la BD:", error);
    });
};

module.exports = connectDatabase;
