const mongoose = require("mongoose");

const PresupuestoDetalle_Schema = mongoose.Schema({
    _id: Number,
        importe: {type: Number , required:true},
        presupuesto: {
                type: Number,
                ref: 'Cliente_Presupuesto',
                required: true
        },
        producto: {
                type: Number,
                ref: 'Producto',
                required: true
        },
        precio: {type: Number , required:true},
        // Precio de lista del día del presupuesto: permite ver cuánto se negoció.
        precioLista: {type: Number},
        cantidad: {type: Number , required:true},
        estado: {type: Boolean , required:true},
    },
    
    {
        timestamps: true
    }
)
PresupuestoDetalle_Schema.index({ presupuesto: 1 });
PresupuestoDetalle_Schema.index({ producto: 1 });
const PresupuestoDetalle = mongoose.model("Cliente_PresupuestoDetalle", PresupuestoDetalle_Schema , "Cliente_PresupuestoDetalle");

module.exports = PresupuestoDetalle;