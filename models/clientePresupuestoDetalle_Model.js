const mongoose = require("mongoose");

const PresupuestoDetalle_Schema = mongoose.Schema({
    _id: Number,
        importe: {type: Number , require:true},
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
        precio: {type: Number , require:true},
        cantidad: {type: Number , require:true},
        estado: {type: Boolean , require:true},
    },
    
    {
        timestamps: true
    }
)
const PresupuestoDetalle = mongoose.model("Cliente_PresupuestoDetalle", PresupuestoDetalle_Schema , "Cliente_PresupuestoDetalle");

module.exports = PresupuestoDetalle;