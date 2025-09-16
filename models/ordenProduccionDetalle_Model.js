const mongoose = require('mongoose');

const OrdenProduccionDetalle_Schema = mongoose.Schema({
    _id: Number,
    picada: {
                type: Number,
                ref: 'ProductoPicada',
                required: true
            },
    cantidad: {type:Number , require:true},
    ordenProduccion: {
            type: Number,
            ref: 'OrdenProduccion',
            required: true
        },
    },
    
    {
        timestamps: true
    }
)
const OrdenProduccionDetalle = mongoose.model("OrdenProduccionDetalle", OrdenProduccionDetalle_Schema, "OrdenProduccionDetalle");

module.exports =  OrdenProduccionDetalle;