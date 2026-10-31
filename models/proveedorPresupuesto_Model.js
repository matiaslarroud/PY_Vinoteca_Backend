const mongoose = require("mongoose");

const ProveedorPresupuesto_Schema = mongoose.Schema({
    _id: Number,
    fecha: {type: Date , required:true},
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
    solicitudPresupuesto: {
            type: Number,
            ref: 'Proveedor_SolicitudPresupuesto',
            required: false
        },
    empleado: {
            type: Number,
            ref: 'Empleado',
            required: true
        },
    estado: {type: Boolean , required:true},
    },
    
    {
        timestamps: true
    }
)
// Índices para las consultas por documento padre / estado.
ProveedorPresupuesto_Schema.index({ estado: 1 });
ProveedorPresupuesto_Schema.index({ proveedor: 1, estado: 1 });
ProveedorPresupuesto_Schema.index({ solicitudPresupuesto: 1 });
const Proveedor_Presupuesto = mongoose.model("Proveedor_Presupuesto", ProveedorPresupuesto_Schema , "Proveedor_Presupuesto");

module.exports = Proveedor_Presupuesto;