const mongoose = require('mongoose');

const OrdenProduccionDetalle_Schema = mongoose.Schema({
    insumo: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'ProductoInsumo',
                required: true
            },
    cantidad: {type:Number , require:true},
    ordenProduccion: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProducOrdenProducciontoPicada',
            required: true
        },
    },
    
    {
        timestamps: true
    }
)
const OrdenProduccionDetalle = mongoose.model("OrdenProduccionDetalle", OrdenProduccionDetalle_Schema)

module.exports =  OrdenProduccionDetalle;