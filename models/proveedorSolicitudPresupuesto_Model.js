const mongoose = require("mongoose");

const ProveedorSolicitudPresupuesto_Schema = mongoose.Schema({
    _id: Number,
    fecha: {type: Date , require:true},
    empleado: {
            type: Number,
            ref: 'Empleado',
            required: true
        },
    proveedor: {
            type: Number,
            ref: 'Producto',
            required: true
        }
    },
    
    {
        timestamps: true
    }
)
const Proveedor_SolicitudPresupuesto = mongoose.model("Proveedor_SolicitudPresupuesto", ProveedorSolicitudPresupuesto_Schema , "Proveedor_SolicitudPresupuesto");

module.exports = Proveedor_SolicitudPresupuesto;