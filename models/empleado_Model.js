const mongoose = require("mongoose");

const Persona = require('./persona_Model');

const Empleado_Schema = mongoose.Schema({
    },
    
    {
        timestamps: true
    }
)
const Empleado = Persona.discriminator('Empleado', Empleado_Schema);

module.exports = Empleado;