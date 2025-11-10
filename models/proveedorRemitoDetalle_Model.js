const mongoose = require("mongoose");

const RemitoDetalle_Schema = mongoose.Schema({
    _id: Number,
        remito: {
                type: Number,
                ref: 'Proveedor_Remito',
                required: true
        },
        producto: {
                type: Number,
                ref: 'Producto',
                required: true
        },
        cantidad: {type: Number , require:true},
        estado: {type: Boolean , require:true},
    },
    
    {
        timestamps: true
    }
)
const Proveedor_RemitoDetalle = mongoose.model("Proveedor_RemitoDetalle", RemitoDetalle_Schema, "Proveedor_RemitoDetalle");

module.exports = Proveedor_RemitoDetalle;