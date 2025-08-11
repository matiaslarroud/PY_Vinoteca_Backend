const mongoose = require("mongoose");

const Persona = require('./persona_Model');

const Proveedor_Schema = mongoose.Schema({
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
const Proveedor = Persona.discriminator('Proveedor', Proveedor_Schema);

module.exports = Proveedor;