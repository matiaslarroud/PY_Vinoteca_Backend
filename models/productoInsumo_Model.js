const mongoose = require('mongoose')
const Producto = require('./producto_Model.js');

const productoInsumoSchema = new mongoose.Schema({
    _id: Number,
    precioCosto: {
        type: Number , 
        
        min: [0, 'El precio de costo no puede ser negativo'] ,
    },
    ganancia: {
        type: Number , 
        
        min: [0, 'La ganancia no puede ser negativa']
    },
    proveedor: {
            type: Number,
            ref: 'Proveedor',
            required: true
        },
    estado: {type: Boolean , required:true},
    },
    
    {
        timestamps: true
    }
)
const ProductoInsumo = Producto.discriminator('ProductoInsumo', productoInsumoSchema , 'ProductoInsumo');

module.exports = ProductoInsumo;