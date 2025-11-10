const mongoose = require("mongoose");

const ProveedorComprobantePago_Schema = mongoose.Schema({
    _id: Number,
    fecha: {type: Date , require:true},
    total: {type: Number , require:true},
    comprobanteCompra: {
            type: Number,
            ref: 'Proveedor_ComprobanteCompra',
            required: true
        },
    medioPago: {
            type: Number,
            ref: 'MedioPago',
            required: true
        },
    estado: {type: Boolean , require:true},
    },
    
    {
        timestamps: true
    }
)
const Proveedor_ComprobantePago = mongoose.model("Proveedor_ComprobantePago", ProveedorComprobantePago_Schema , "Proveedor_ComprobantePago");

module.exports = Proveedor_ComprobantePago;