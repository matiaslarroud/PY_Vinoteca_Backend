const mongoose = require("mongoose");

const ProveedorSolicitudPresupuesto_Schema = mongoose.Schema({
    _id: Number,
    fecha: {type: Date , required:true},
    empleado: {
            type: Number,
            ref: 'Empleado',
            required: true
        },
    proveedor: {
            type: Number,
            ref: 'Proveedor',
            required: true
        },
    estado: {type: Boolean , required:true},
    },
    
    {
        timestamps: true
    }
)
// Índices para las consultas por documento padre / estado.
ProveedorSolicitudPresupuesto_Schema.index({ estado: 1 });
ProveedorSolicitudPresupuesto_Schema.index({ proveedor: 1, estado: 1 });
const Proveedor_SolicitudPresupuesto = mongoose.model("Proveedor_SolicitudPresupuesto", ProveedorSolicitudPresupuesto_Schema , "Proveedor_SolicitudPresupuesto");

module.exports = Proveedor_SolicitudPresupuesto;