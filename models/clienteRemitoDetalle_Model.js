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
        cantidad: {type: Number , required:true},
        estado: {type: Boolean , required:true},
    },
    
    {
        timestamps: true
    }
)
// Índices para las consultas por documento padre / estado.
RemitoDetalle_Schema.index({ remitoID: 1, estado: 1 });
RemitoDetalle_Schema.index({ producto: 1 });
const Cliente_RemitoDetalle = mongoose.model("Cliente_RemitoDetalle", RemitoDetalle_Schema, "Cliente_RemitoDetalle");

module.exports = Cliente_RemitoDetalle;