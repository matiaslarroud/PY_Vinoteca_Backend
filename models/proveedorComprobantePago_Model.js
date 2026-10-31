const mongoose = require("mongoose");

const ProveedorComprobantePago_Schema = mongoose.Schema({
    _id: Number,
    fecha: {type: Date , required:true},
    total: {type: Number , required:true},
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
    estado: {type: Boolean , required:true},
    },
    
    {
        timestamps: true
    }
)
// Índices para las consultas por documento padre / estado.
ProveedorComprobantePago_Schema.index({ estado: 1 });
ProveedorComprobantePago_Schema.index({ comprobanteCompra: 1, estado: 1 });
const Proveedor_ComprobantePago = mongoose.model("Proveedor_ComprobantePago", ProveedorComprobantePago_Schema , "Proveedor_ComprobantePago");

module.exports = Proveedor_ComprobantePago;