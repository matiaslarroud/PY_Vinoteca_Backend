const mongoose = require("mongoose");

const Empleado_Schema = mongoose.Schema({
    _id: Number,
    name: {type: String , required:true},
    lastname: {type: String },
    fechaNacimiento: {type: Date },
    telefono: {type: String },
    email: {type: String },
    cuit: {type: String },
    pais: {
            type: Number,
            ref: 'Pais',
            required: true
        },
    provincia: {
            type: Number,
            ref: 'Provincia',
            required: true
        },
    localidad: {
            type: Number,
            ref: 'Localidad',
            required: true
        },
    barrio: {
            type: Number,
            ref: 'Barrio',
            required: true
        },
    calle: {
            type: Number,
            ref: 'Calle',
            required: true
        },      
    altura: {type: Number },
    deptoNumero: {type: Number , require:false},
    deptoLetra: {type: String , require:false},  
    estado: {type: Boolean , required:true},
    },
    
    {
        timestamps: true
    }
)

const Empleado = mongoose.model('Empleado', Empleado_Schema , "Empleado");

module.exports = Empleado;