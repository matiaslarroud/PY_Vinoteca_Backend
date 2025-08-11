const mongoose = require("mongoose");

const Persona = require('./persona_Model');

const Cliente_Schema = mongoose.Schema({
    condicionIva: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CondicionIva',
            required: true
        },
    
    cuentaCorriente:{
            type:Boolean,
            required:true
        }
    },
    
    {
        timestamps: true
    }
)
const Cliente = Persona.discriminator('Cliente', Cliente_Schema);

module.exports = Cliente;