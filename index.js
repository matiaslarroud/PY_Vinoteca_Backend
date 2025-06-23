const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const { type } = require('os');
const { timeStamp } = require('console');
require('dotenv').config();

const app = express();

mongoose
    .connect(`mongodb+srv://matutedel30:${process.env.PASS_MONGODB}@vinOteca.thjyjhn.mongodb.net/Vinoteca?retryWrites=true&w=majority&appName=Vinoteca`)
    .then(() => {console.log("CONEXION EXITOSA A LA BD.")})
    .catch((error) => {console.log(`ERROR DE CONEXION A LA BD. \n ERROR: ${error}`)});

const productSchema = mongoose.Schema({
    name: {type: String , require:true},
    price: Number
    },
    {
        timestamps: true
    }
)

const Product = mongoose.model("Product", productSchema)

app.use(express.json());
    
app.post('/api/v1/products' , (req , res ) => {
    console.log('Petición recibida.');
    // const newProduct = new Product({
    //     name: req.body.nombre,
    //     price: req.body.precio
    // });
    const newProduct = new Product(req.body);

    newProduct.save()
        .then(() => { 
            console.log("PRODUCTO CREADO EXITOSAMENTE");
            res.status(201).json({ok:true});
        })
        .catch((error) => { console.log(error) })    
});

app.use(express.static(path.join(__dirname,'public')));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log("Escuchando puerto ", PORT);
});