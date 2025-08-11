const mongoose = require('mongoose')
const Producto = require('./producto_Model.js');

const productoVinoSchema = new mongoose.Schema({
    bodega: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bodega',
            required: false
        },
    paraje: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bodega_Paraje',
            required: false
        },
    crianza: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vino_Crianza',
            required: false
        },
    tipo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vino_Tipo',
            required: false
        } ,
    uva: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vino_Uva',
            required: false
        } ,
    varietal: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vino_Varietal',
            required: false
        } ,
    volumen: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vino_Volumen',
            required: false
        },
    precioCosto: {type: Number , require:true},
    ganancia: {type: Number , require:true},
    },
    
    {
        timestamps: true
    }
)
const ProductoVino = Producto.discriminator('ProductoVino', productoVinoSchema);

module.exports = ProductoVino;