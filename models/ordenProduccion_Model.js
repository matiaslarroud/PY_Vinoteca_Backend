const mongoose = require('mongoose');

const OrdenProduccion_Schema = mongoose.Schema({
    _id: Number,
    fecha: {type: Date , required:true},
    fechaElaboracion: {type: Date },
    fechaEntrega: {type: Date },
    empleado: {
            type: Number,
            ref: 'Empleado',
            required: true
        },
    estadoProduccion: {type: Boolean },
    estado: {type: Boolean , required:true},
    },
    
    {
        timestamps: true
    }
)
// Índices para las consultas por documento padre / estado.
OrdenProduccion_Schema.index({ estado: 1 });
const OrdenProduccion = mongoose.model("OrdenProduccion", OrdenProduccion_Schema , "OrdenProduccion");

module.exports =  OrdenProduccion;