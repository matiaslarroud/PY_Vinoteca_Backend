const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const { ok } = require('assert');
require('dotenv').config();


const app = express();

mongoose
    .connect(`mongodb+srv://matutedel30:${process.env.PASS_MONGODB}@vinoteca.thjyjhn.mongodb.net/?retryWrites=true&w=majority&appName=Vinoteca`)
    .then((exito) => {console.log("CONEXION EXITOSA A LA BD.")})
    .catch((error) => {console.log(`ERROR DE CONEXION A LA BD. \n ERROR: ${error}`)})

app.use(express.json())
    
app.post('/api/v1/products' , (req , res) => {
    console.log('petición recibida.');
    console.log({body: req.body})
    res.status(201).json({ok:true})
})

app.use(express.static(path.join(__dirname,'public')))

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
    console.log("Escuchando puerto ", PORT);
})