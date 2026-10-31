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
        cantidad: {type: Number , required:true},
        estado: {type: Boolean , required:true},
    },
    
    {
        timestamps: true
    }
)
// Índices para las consultas por documento padre / estado.
RemitoDetalle_Schema.index({ remito: 1, estado: 1 });
RemitoDetalle_Schema.index({ producto: 1 });
const Proveedor_RemitoDetalle = mongoose.model("Proveedor_RemitoDetalle", RemitoDetalle_Schema, "Proveedor_RemitoDetalle");

module.exports = Proveedor_RemitoDetalle;