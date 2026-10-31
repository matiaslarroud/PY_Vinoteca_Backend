const mongoose = require("mongoose");

const ProveedorOrdenCompra_Schema = mongoose.Schema({
    _id: Number,
    fecha: {type: Date , required:true},
    fechaEntrega: {type: Date },
    total: {type: Number , required:true},
    proveedor: {
            type: Number,
            ref: 'Proveedor',
            required: true
        },
    medioPago: {
            type: Number,
            ref: 'MedioPago',
            required: true
        },
    presupuesto: {
            type: Number,
            ref: 'Proveedor_Presupuesto',
            required: true
        },
    empleado: {
            type: Number,
            ref: 'Empleado',
            required: true
        },    
    completo: {type: Boolean },
    estado: {type: Boolean , required:true},
    },
    
    {
        timestamps: true
    }
)
// Índices para las consultas por documento padre / estado.
ProveedorOrdenCompra_Schema.index({ estado: 1 });
ProveedorOrdenCompra_Schema.index({ proveedor: 1, estado: 1 });
ProveedorOrdenCompra_Schema.index({ presupuesto: 1 });
const Proveedor_OrdenCompra = mongoose.model("Proveedor_OrdenCompra", ProveedorOrdenCompra_Schema , "Proveedor_OrdenCompra");

module.exports = Proveedor_OrdenCompra;