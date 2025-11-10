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
        cantidad: {type: Number , require:true},
        estado: {type: Boolean , require:true},
    },
    
    {
        timestamps: true
    }
)
const PicadaDetalle = mongoose.model("ProductoPicadaDetalle", PicadaDetalle_Schema, "ProductoPicadaDetalle");

module.exports = PicadaDetalle;