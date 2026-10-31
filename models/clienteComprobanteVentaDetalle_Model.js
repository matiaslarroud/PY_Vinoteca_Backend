const mongoose = require("mongoose");

const ComprobanteVentaDetalle_Schema = mongoose.Schema({
    _id: Number,
        importe: {type: Number , required:true},
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
        precio: {type: Number , required:true},
        cantidad: {type: Number , required:true},
        estado: {type: Boolean , required:true},
    },
    
    {
        timestamps: true
    }
)
const ComprobanteVentaDetalle = mongoose.model("Cliente_ComprobanteVentaDetalle", ComprobanteVentaDetalle_Schema , "Cliente_ComprobanteVentaDetalle");

module.exports = ComprobanteVentaDetalle;