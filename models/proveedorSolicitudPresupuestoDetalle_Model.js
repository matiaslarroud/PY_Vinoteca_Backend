const mongoose = require("mongoose");

const ProveedorSolicitudPresupuestoDetalle_Schema = mongoose.Schema({
    _id: Number,
    cantidad: {type: Number , required:true},
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
    importe: {type:Number , required:true},
    estado: {type: Boolean , required:true},
    },
    
    {
        timestamps: true
    }
)
// Índices para las consultas por documento padre / estado.
ProveedorSolicitudPresupuestoDetalle_Schema.index({ solicitudPresupuesto: 1, estado: 1 });
ProveedorSolicitudPresupuestoDetalle_Schema.index({ producto: 1 });
const Proveedor_SolicitudPresupuestoDetalle = mongoose.model("Proveedor_SolicitudPresupuestoDetalle", ProveedorSolicitudPresupuestoDetalle_Schema , "Proveedor_SolicitudPresupuestoDetalle");

module.exports = Proveedor_SolicitudPresupuestoDetalle;