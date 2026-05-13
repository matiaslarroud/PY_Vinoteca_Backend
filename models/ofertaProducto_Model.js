const mongoose = require('mongoose');

const ProductoOfertaSchema = new mongoose.Schema({
    _id: Number,
    name: {type: String , require:true} ,
    total: {
        type: Number , 
        require:true , 
        min: [0, 'El precio de venta no puede ser negativo']
    },
    estadoPromocion: {type: Boolean , require:true},
    estado: {type: Boolean , require:true},

    },    
    {
        timestamps: true
    }
)
const ProductoOferta = mongoose.model('ProductoOferta', ProductoOfertaSchema, 'ProductoOferta');

module.exports = ProductoOferta;