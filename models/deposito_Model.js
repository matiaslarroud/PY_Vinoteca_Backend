const mongoose = require("mongoose");

const Deposito_Schema = mongoose.Schema({
    _id: Number,
    name: {type: String , require:true},
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
    altura: {type: String , require:true},
    deptoNumero: {type: String , require:false},
    deptoLetra: {type: String , require:false},
},
    {
        timestamps: true
    }  
)

const Deposito = mongoose.model("Deposito", Deposito_Schema , "Deposito");

module.exports = Deposito;