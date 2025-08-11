const mongoose = require('mongoose')
const Producto = require('./producto_Model.js');

const productoInsumoSchema = new mongoose.Schema({
    proveedor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Proveedor',
            required: true
        },
    precioCosto: {type: Number , require:true},
    ganancia: {type: Number , require:true},
    },
    
    {
        timestamps: true
    }
)
const ProductoInsumo = Producto.discriminator('ProductoInsumo', productoInsumoSchema);

module.exports = ProductoInsumo;