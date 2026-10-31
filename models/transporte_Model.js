const mongoose = require("mongoose");

const Transporte_Schema = mongoose.Schema({
    _id: Number,
    name: {type: String , required:true},
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
    altura: {type: String },
    condicionIva: {
        type: Number,
        ref: 'CondicionIva',
        required: true
    },
    estado: {type: Boolean , required:true},

    },
    
    {
        timestamps: true
    }
)
const Transporte = mongoose.model('Transporte', Transporte_Schema , "Transporte");

module.exports = Transporte;