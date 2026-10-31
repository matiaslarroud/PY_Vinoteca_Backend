const mongoose = require("mongoose");

const Cliente_Schema = mongoose.Schema({
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
    altura: {type: String },
    deptoNumero: {type: String , require:false},
    deptoLetra: {type: String , require:false},
    condicionIva: {
            type: Number,
            ref: 'CondicionIva',
            required: true
        },
    
    cuentaCorriente:{
            type:Boolean,
            
        },
    saldoCuentaCorriente: {
        type: Number,
        required: function () {
            return this.cuentaCorriente === true;
        }
    },
    saldoActualCuentaCorriente: {type: Number },
    estado: {type: Boolean , required:true},
    },
    
    {
        timestamps: true
    }
)
Cliente_Schema.index({ estado: 1 });
Cliente_Schema.index({ name: 1, lastname: 1 });
Cliente_Schema.index({ cuit: 1 }, { unique: true });
const Cliente = mongoose.model('Cliente', Cliente_Schema , "Cliente");

module.exports = Cliente;