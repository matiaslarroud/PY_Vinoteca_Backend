const mongoose = require("mongoose");

const ComprobanteVentaDetalle_Schema = mongoose.Schema({
    _id: Number,
        subtotal: {type: Number , require:true},
        comprobanteVenta: {
                type: Number,
                ref: 'Cliente_ComprobanteVenta',
                required: true
        },
        producto: {
                type: Number,
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
const ComprobanteVentaDetalle = mongoose.model("Cliente_ComprobanteVentaDetalle", ComprobanteVentaDetalle_Schema , "Cliente_ComprobanteVentaDetalle");

module.exports = ComprobanteVentaDetalle;