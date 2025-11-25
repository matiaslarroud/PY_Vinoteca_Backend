const mongoose = require('mongoose')
const Producto = require('./producto_Model.js');

const productoPicadaSchema = new mongoose.Schema({
    _id: Number,
    precioVenta: {
        type: Number , 
        require:true , 
        min: [0, 'El precio de venta no puede ser negativo']
    },
    estadoProduccion: {type: Boolean , require:true},
    estado: {type: Boolean , require:true},

    },    
    {
        timestamps: true
    }
)
const ProductoPicada = Producto.discriminator('ProductoPicada', productoPicadaSchema, 'ProductoPicada');

module.exports = ProductoPicada;