const mongoose = require("mongoose");

const ProveedorComprobanteCompra_Schema = mongoose.Schema({
    _id: Number,
    fecha: {type: Date , require:true},
    total: {type: Number , require:true},
    ordenCompra: {
            type: Number,
            ref: 'Proveedor_OrdenCompra',
            required: true
        },    
    estado: {type: Boolean , require:true},
    },
    
    {
        timestamps: true
    }
)
const Proveedor_ComprobanteCompra = mongoose.model("Proveedor_ComprobanteCompra", ProveedorComprobanteCompra_Schema , "Proveedor_ComprobanteCompra");

module.exports = Proveedor_ComprobanteCompra;