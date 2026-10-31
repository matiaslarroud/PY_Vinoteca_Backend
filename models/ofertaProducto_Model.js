const mongoose = require('mongoose');

const ProductoOfertaSchema = new mongoose.Schema({
    _id: Number,
    name: {type: String , required:true} ,
    total: {
        type: Number , 
        required:true , 
        min: [0, 'El precio de venta no puede ser negativo']
    },
    estadoPromocion: {type: Boolean },
    estado: {type: Boolean , required:true},

    },    
    {
        timestamps: true
    }
)
const ProductoOferta = mongoose.model('ProductoOferta', ProductoOfertaSchema, 'ProductoOferta');

module.exports = ProductoOferta;