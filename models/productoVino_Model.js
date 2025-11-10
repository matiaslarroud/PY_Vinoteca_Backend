const mongoose = require('mongoose')
const Producto = require('./producto_Model.js');

const productoVinoSchema = new mongoose.Schema({
    _id: Number,
    bodega: {
            type: Number,
            ref: 'Bodega',
            required: false
        },
    paraje: {
            type: Number,
            ref: 'Bodega_Paraje',
            required: false
        },
    crianza: {
            type: Number,
            ref: 'Vino_Crianza',
            required: false
        },
    tipo: {
            type: Number,
            ref: 'Vino_Tipo',
            required: false
        } ,
    varietal: {
            type: Number,
            ref: 'Vino_Varietal',
            required: false
        } ,
    volumen: {
            type: Number,
            ref: 'Vino_Volumen',
            required: false
        },
    precioCosto: {
        type: Number , 
        require:true , 
        min: [0, 'El precio de costo no puede ser negativo']
    },
    ganancia: {type: Number , require:true},
    estado: {type: Boolean , require:true},
    },
    
    {
        timestamps: true
    }
)
const ProductoVino = Producto.discriminator('ProductoVino', productoVinoSchema, 'ProductoVino');

module.exports = ProductoVino;