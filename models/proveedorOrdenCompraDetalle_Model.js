const mongoose = require("mongoose");

const ProveedorOrdenCompraDetalle_Schema = mongoose.Schema({
    _id: Number,
    precio: {type: Number , required:true},
    importe: {type: Number , required:true},
    cantidad: {type: Number , required:true},
    ordenCompra: {
            type: Number,
            ref: 'Proveedor_OrdenCompra',
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
const Proveedor_OrdenCompraDetalle = mongoose.model("Proveedor_OrdenCompraDetalle", ProveedorOrdenCompraDetalle_Schema , "Proveedor_OrdenCompraDetalle");

module.exports = Proveedor_OrdenCompraDetalle;