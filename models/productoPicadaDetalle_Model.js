const mongoose = require("mongoose");

const PicadaDetalle_Schema = mongoose.Schema({
        picada: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'ProductoPicada',
                required: true
        },
        insumo: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'ProductoInsumo',
                required: true
        },
        cantidad: {type: Number , require:true},
    },
    
    {
        timestamps: true
    }
)
const PicadaDetalle = mongoose.model("PicadaDetalle", PicadaDetalle_Schema);

module.exports = PicadaDetalle;