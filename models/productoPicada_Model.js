const mongoose = require('mongoose')
const Producto = require('./producto_Model.js');

const productoPicadaSchema = new mongoose.Schema({
    _id: Number,
    precioVenta: {
        type: Number , 
        
        min: [0, 'El precio de venta no puede ser negativo']
    },
    estadoProduccion: {type: Boolean },
    estado: {type: Boolean , required:true},

    },    
    {
        timestamps: true
    }
)
const ProductoPicada = Producto.discriminator('ProductoPicada', productoPicadaSchema, 'ProductoPicada');

module.exports = ProductoPicada;