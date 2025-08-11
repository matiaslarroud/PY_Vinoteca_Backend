const mongoose = require("mongoose");

const PresupuestoDetalle_Schema = mongoose.Schema({
        subtotal: {type: Number , require:true},
        presupuesto: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Cliente_Presupuesto',
                required: true
        },
        producto: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Producto',
                required: true
        },
        precio: {type: Number , require:true},
        cantidad: {type: Number , require:true},
    },
    
    {
        timestamps: true
    }
)
const PresupuestoDetalle = mongoose.model("PresupuestoDetalle", PresupuestoDetalle_Schema);

module.exports = PresupuestoDetalle;