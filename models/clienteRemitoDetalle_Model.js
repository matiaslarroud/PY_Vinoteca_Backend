const mongoose = require("mongoose");

const RemitoDetalle_Schema = mongoose.Schema({
        remitoID: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Cliente_Remito',
                required: true
        },
        producto: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Producto',
                required: true
        },
        cantidad: {type: Number , require:true},
    },
    
    {
        timestamps: true
    }
)
const Cliente_RemitoDetalle = mongoose.model("Cliente_RemitoDetalle", RemitoDetalle_Schema);

module.exports = Cliente_RemitoDetalle;