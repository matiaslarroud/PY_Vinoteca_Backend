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
// Índices para las consultas por documento padre / estado.
ProveedorComprobanteCompraDetalle_Schema.index({ comprobanteCompra: 1, estado: 1 });
ProveedorComprobanteCompraDetalle_Schema.index({ producto: 1 });
const Proveedor_ComprobanteCompraDetalle = mongoose.model("Proveedor_ComprobanteCompraDetalle", ProveedorComprobanteCompraDetalle_Schema , "Proveedor_ComprobanteCompraDetalle");

module.exports = Proveedor_ComprobanteCompraDetalle;