const mongoose = require("mongoose");

const ProveedorComprobanteCompra_Schema = mongoose.Schema({
    _id: Number,
    fecha: {type: Date , required:true},
    total: {type: Number , required:true},
    ordenCompra: {
            type: Number,
            ref: 'Proveedor_OrdenCompra',
            required: true
        },    
    estado: {type: Boolean , required:true},
    },
    
    {
        timestamps: true
    }
)
// Índices para las consultas por documento padre / estado.
ProveedorComprobanteCompra_Schema.index({ estado: 1 });
ProveedorComprobanteCompra_Schema.index({ ordenCompra: 1, estado: 1 });
const Proveedor_ComprobanteCompra = mongoose.model("Proveedor_ComprobanteCompra", ProveedorComprobanteCompra_Schema , "Proveedor_ComprobanteCompra");

module.exports = Proveedor_ComprobanteCompra;