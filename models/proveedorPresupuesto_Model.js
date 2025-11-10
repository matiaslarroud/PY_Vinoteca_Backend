const mongoose = require("mongoose");

const ProveedorPresupuesto_Schema = mongoose.Schema({
    _id: Number,
    fecha: {type: Date , require:true},
    total: {type: Number , require:true},
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
    estado: {type: Boolean , require:true},
    },
    
    {
        timestamps: true
    }
)
const Proveedor_Presupuesto = mongoose.model("Proveedor_Presupuesto", ProveedorPresupuesto_Schema , "Proveedor_Presupuesto");

module.exports = Proveedor_Presupuesto;