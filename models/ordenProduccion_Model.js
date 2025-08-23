const mongoose = require('mongoose');

const OrdenProduccion_Schema = mongoose.Schema({
    fecha: {type: Date , require:true},
    fechaElaboracion: {type: Date , require:true},
    fechaEntrega: {type: Date , require:true},
    empleado: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Empleado',
            required: true
        },
    picada: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProductoPicada',
            required: true
        },
    },
    
    {
        timestamps: true
    }
)
const OrdenProduccion = mongoose.model("OrdenProduccion", OrdenProduccion_Schema)

module.exports =  OrdenProduccion;