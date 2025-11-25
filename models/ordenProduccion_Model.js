const mongoose = require('mongoose');

const OrdenProduccion_Schema = mongoose.Schema({
    _id: Number,
    fecha: {type: Date , require:true},
    fechaElaboracion: {type: Date , require:true},
    fechaEntrega: {type: Date , require:true},
    empleado: {
            type: Number,
            ref: 'Empleado',
            required: true
        },
    estadoProduccion: {type: Boolean , require:true},
    estado: {type: Boolean , require:true},
    },
    
    {
        timestamps: true
    }
)
const OrdenProduccion = mongoose.model("OrdenProduccion", OrdenProduccion_Schema , "OrdenProduccion");

module.exports =  OrdenProduccion;