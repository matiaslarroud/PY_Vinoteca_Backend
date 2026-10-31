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
        cantidad: {type: Number , required:true},
        estado: {type: Boolean , required:true},
    },
    
    {
        timestamps: true
    }
)
// Índices para las consultas por documento padre / estado.
ProductoOfertaDetalle_Schema.index({ oferta: 1, estado: 1 });
ProductoOfertaDetalle_Schema.index({ producto: 1 });
const ProductoOfertaDetalle = mongoose.model("ProductoOfertaDetalle", ProductoOfertaDetalle_Schema, "ProductoOfertaDetalle");

module.exports = ProductoOfertaDetalle;