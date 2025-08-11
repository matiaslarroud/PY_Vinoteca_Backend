const mongoose = require("mongoose");

const ComprobanteVentaDetalle_Schema = mongoose.Schema({
        subtotal: {type: Number , require:true},
        comprobanteVenta: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Cliente_ComprobanteVenta',
                required: true
        },
        producto: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Producto',
                required: true
        },
        precio: {type: Number , require:true},
        cantidad: {type: Number , require:true},
    },
    
    {
        timestamps: true
    }
)
const ComprobanteVentaDetalle = mongoose.model("ComprobanteVentaDetalle", ComprobanteVentaDetalle_Schema);

module.exports = ComprobanteVentaDetalle;