const mongoose = require('mongoose');

const OrdenProduccionDetalle_Schema = mongoose.Schema({
    _id: Number,
    picada: {
                type: Number,
                ref: 'ProductoPicada',
                required: true
            },
    cantidad: {type:Number , required:true},
    ordenProduccion: {
            type: Number,
            ref: 'OrdenProduccion',
            required: true
        },
    estado: {type: Boolean , required:true},
    },
    
    {
        timestamps: true
    }
)
const OrdenProduccionDetalle = mongoose.model("OrdenProduccionDetalle", OrdenProduccionDetalle_Schema, "OrdenProduccionDetalle");

module.exports =  OrdenProduccionDetalle;