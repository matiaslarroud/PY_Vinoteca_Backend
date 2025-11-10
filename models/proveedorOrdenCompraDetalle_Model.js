const mongoose = require("mongoose");

const ProveedorOrdenCompraDetalle_Schema = mongoose.Schema({
    _id: Number,
    precio: {type: Number , require:true},
    importe: {type: Number , require:true},
    cantidad: {type: Number , require:true},
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
    estado: {type: Boolean , require:true},
    },
    
    {
        timestamps: true
    }
)
const Proveedor_OrdenCompraDetalle = mongoose.model("Proveedor_OrdenCompraDetalle", ProveedorOrdenCompraDetalle_Schema , "Proveedor_OrdenCompraDetalle");

module.exports = Proveedor_OrdenCompraDetalle;