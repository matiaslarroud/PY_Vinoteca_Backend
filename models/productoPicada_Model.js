const mongoose = require('mongoose')
const Producto = require('./producto_Model.js');

const productoPicadaSchema = new mongoose.Schema({
    tipoVino: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Vino_Tipo',
                required: false
            },
    precioVenta: {type: Number , require:true},

    },    
    {
        timestamps: true
    }
)
const ProductoPicada = Producto.discriminator('ProductoPicada', productoPicadaSchema);

module.exports = ProductoPicada;