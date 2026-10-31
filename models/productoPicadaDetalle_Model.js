const mongoose = require("mongoose");

const PicadaDetalle_Schema = mongoose.Schema({
    _id: Number,
        picada: {
                type: Number,
                ref: 'ProductoPicada',
                required: true
        },
        insumo: {
                type: Number,
                ref: 'ProductoInsumo',
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
PicadaDetalle_Schema.index({ picada: 1, estado: 1 });
PicadaDetalle_Schema.index({ insumo: 1 });
const PicadaDetalle = mongoose.model("ProductoPicadaDetalle", PicadaDetalle_Schema, "ProductoPicadaDetalle");

module.exports = PicadaDetalle;