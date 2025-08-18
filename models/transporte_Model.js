const mongoose = require("mongoose");

const Persona = require('./persona_Model');

const Transporte_Schema = mongoose.Schema({
    name: {type: String , require:true},name: {type: String , require:true},
    telefono: {type: String , require:true},
    email: {type: String , require:true},
    cuit: {type: String , require:true},
    pais: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Pais',
            required: true
        },
    provincia: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Provincia',
            required: true
        },
    localidad: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Localidad',
            required: true
        },
    barrio: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Barrio',
            required: true
        },
    calle: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Calle',
            required: true
        },
    condicionIva: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CondicionIva',
        required: true
    }

    },
    
    {
        timestamps: true
    }
)
const Transporte = mongoose.model('Transporte', Transporte_Schema);

module.exports = Transporte;