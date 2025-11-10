const mongoose = require("mongoose");

const Empleado_Schema = mongoose.Schema({
    _id: Number,
    name: {type: String , require:true},
    lastname: {type: String , require:true},
    fechaNacimiento: {type: Date , require:true},
    telefono: {type: String , require:true},
    email: {type: String , require:true},
    cuit: {type: String , require:true},
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
    altura: {type: Number , require:true},
    deptoNumero: {type: Number , require:false},
    deptoLetra: {type: String , require:false},  
    estado: {type: Boolean , require:true},
    },
    
    {
        timestamps: true
    }
)

const Empleado = mongoose.model('Empleado', Empleado_Schema , "Empleado");

module.exports = Empleado;