const mongoose = require('mongoose')
const Producto = require('./producto_Model.js');

const productoPicadaSchema = new mongoose.Schema({
    _id: Number,
    precioVenta: {
        type: Number , 
        require:true , 
        min: [0, 'El precio de venta no puede ser negativo']
    },

    },    
    {
        timestamps: true
    }
)
const ProductoPicada = Producto.discriminator('ProductoPicada', productoPicadaSchema, 'ProductoPicada');

module.exports = ProductoPicada;