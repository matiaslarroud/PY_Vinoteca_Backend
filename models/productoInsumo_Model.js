const mongoose = require('mongoose')
const Producto = require('./producto_Model.js');

const productoInsumoSchema = new mongoose.Schema({
    proveedor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Proveedor',
            required: true
        },
    precioCosto: {
        type: Number , 
        require:true , 
        min: [0, 'El precio de costo no puede ser negativo'] ,
    },
    ganancia: {
        type: Number , 
        require:true , 
        min: [0, 'La ganancia no puede ser negativa']
    },
    },
    
    {
        timestamps: true
    }
)
const ProductoInsumo = Producto.discriminator('ProductoInsumo', productoInsumoSchema);

module.exports = ProductoInsumo;