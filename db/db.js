const mongoose = require('mongoose');
const PORT = process.env.PORT || 4000;

const connectDatabase = (app) => {
    mongoose
    .connect(`mongodb+srv://matutedel30:${process.env.PASS_MONGODB}@vinOteca.thjyjhn.mongodb.net/Vinoteca?retryWrites=true&w=majority&appName=Vinoteca`)
    .then(() => {
        console.log("CONEXION EXITOSA A LA BD.")
        app.listen(PORT, () => {
            console.log("Escuchando puerto ", PORT);
        });
    })
    .catch((error) => {console.log(`ERROR DE CONEXION A LA BD. \n ERROR: ${error}`)});
}

module.exports = connectDatabase;