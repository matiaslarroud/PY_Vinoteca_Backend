const mongoose = require("mongoose");

const Cliente_Schema = mongoose.Schema({
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
    altura: {type: String , require:true},
    deptoNumero: {type: String , require:false},
    deptoLetra: {type: String , require:false},
    condicionIva: {
            type: Number,
            ref: 'CondicionIva',
            required: true
        },
    
    cuentaCorriente:{
            type:Boolean,
            require:true
        },
    saldoCuentaCorriente: {
        type: Number,
        required: function () {
            return this.cuentaCorriente === true;
        }
    },
    saldoActualCuentaCorriente: {type: Number , require:true},
    estado: {type: Boolean , require:true},
    },
    
    {
        timestamps: true
    }
)
const Cliente = mongoose.model('Cliente', Cliente_Schema , "Cliente");

module.exports = Cliente;