const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();


const app = express();

mongoose
    .connect(`mongodb+srv://matutedel30:${process.env.PASS_MONGODB}@vinoteca.thjyjhn.mongodb.net/?retryWrites=true&w=majority&appName=Vinoteca`)
    .then((exito) => {console.log("CONEXION EXITOSA A LA BD.")})
    .catch((error) => {console.log(`ERROR DE CONEXION A LA BD. \n ERROR: ${error}`)})

app.get('/' , (req , res , next) => {
    console.log('petición recibida.');
    next();
})

app.use(express.static(path.join(__dirname,'public')))

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
    console.log("Escuchando puerto ", PORT);
})