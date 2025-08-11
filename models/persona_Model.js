const mongoose = require("mongoose");

const Persona_Schema = mongoose.Schema({
    name: {type: String , require:true},
    lastname: {type: String , require:true},
    fechaNacimiento: {type: Date , require:true},
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
        }
    },
    
    {
        discriminatorKey: 'tipo',
        collection: 'personas',
        timestamps: true
    }
)
const Persona = mongoose.model("Persona", Persona_Schema);

module.exports = Persona;