const mongoose = require("mongoose");

const ProveedorSolicitudPresupuestoDetalle_Schema = mongoose.Schema({
    _id: Number,
    cantidad: {type: Number , require:true},
    solicitudPresupuesto: {
            type: Number,
            ref: 'Proveedor_SolicitudPresupuesto',
            required: true
        },
    producto: {
            type: Number,
            ref: 'Producto',
            required: true
        },
    importe: {type:Number , require:true},
    estado: {type: Boolean , require:true},
    },
    
    {
        timestamps: true
    }
)
const Proveedor_SolicitudPresupuestoDetalle = mongoose.model("Proveedor_SolicitudPresupuestoDetalle", ProveedorSolicitudPresupuestoDetalle_Schema , "Proveedor_SolicitudPresupuestoDetalle");

module.exports = Proveedor_SolicitudPresupuestoDetalle;