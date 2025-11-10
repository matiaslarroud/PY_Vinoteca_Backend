const mongoose = require("mongoose");

const Barrio_Schema = mongoose.Schema({
    _id: Number,
    name: {type: String , require:true},
    localidad: {
            type: Number,
            ref: 'Localidad',
            required: true
        },
    estado: {type: Boolean , require:true},
    },
    
    {
        timestamps: true
    }
)
const Barrio = mongoose.model("Barrio", Barrio_Schema, "Barrio");

module.exports = Barrio;