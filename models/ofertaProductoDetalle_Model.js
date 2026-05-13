const mongoose = require("mongoose");

const ProductoOfertaDetalle_Schema = mongoose.Schema({
    _id: Number,
        oferta: {
                type: Number,
                ref: 'ProductoOferta',
                required: true
        },
        producto: {
                type: Number,
                ref: 'Producto',
                required: true
        },
        descuento: { type: Number, required: true },
        cantidad: {type: Number , require:true},
        estado: {type: Boolean , require:true},
    },
    
    {
        timestamps: true
    }
)
const ProductoOfertaDetalle = mongoose.model("ProductoOfertaDetalle", ProductoOfertaDetalle_Schema, "ProductoOfertaDetalle");

module.exports = ProductoOfertaDetalle;