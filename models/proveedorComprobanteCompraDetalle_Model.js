const mongoose = require("mongoose");

const ProveedorComprobanteCompraDetalle_Schema = mongoose.Schema({
    _id: Number,
    precio: {type: Number , required:true},
    importe: {type: Number , required:true},
    cantidad: {type: Number , required:true},
    comprobanteCompra: {
            type: Number,
            ref: 'Proveedor_ComprobanteCompra',
            required: true
        },
    producto: {
            type: Number,
            ref: 'Producto',
            required: true
        },
    estado: {type: Boolean , required:true},
    },
    
    {
        timestamps: true
    }
)
const Proveedor_ComprobanteCompraDetalle = mongoose.model("Proveedor_ComprobanteCompraDetalle", ProveedorComprobanteCompraDetalle_Schema , "Proveedor_ComprobanteCompraDetalle");

module.exports = Proveedor_ComprobanteCompraDetalle;