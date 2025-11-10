const mongoose = require("mongoose");

const RemitoDetalle_Schema = mongoose.Schema({
    _id: Number,
        remitoID: {
                type: Number,
                ref: 'Cliente_Remito',
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
const Cliente_RemitoDetalle = mongoose.model("Cliente_RemitoDetalle", RemitoDetalle_Schema, "Cliente_RemitoDetalle");

module.exports = Cliente_RemitoDetalle;