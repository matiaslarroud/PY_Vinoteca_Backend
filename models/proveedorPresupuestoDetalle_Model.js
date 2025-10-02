const mongoose = require("mongoose");

const ProveedorPresupuestoDetalle_Schema = mongoose.Schema({
    _id: Number,
    precio: {type: Number , require:true},
    cantidad: {type: Number , require:true},
    importe: {type: Number , require:true},
    presupuesto: {
            type: Number,
            ref: 'Proveedor_Presupuesto',
            required: true
        },
    producto: {
            type: Number,
            ref: 'Producto',
            required: true
        }
    },
    
    {
        timestamps: true
    }
)
const Proveedor_PresupuestoDetalle = mongoose.model("Proveedor_PresupuestoDetalle", ProveedorPresupuestoDetalle_Schema , "Proveedor_PresupuestoDetalle");

module.exports = Proveedor_PresupuestoDetalle;