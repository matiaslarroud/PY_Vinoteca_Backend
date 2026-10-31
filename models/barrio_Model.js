const mongoose = require("mongoose");

const Barrio_Schema = mongoose.Schema({
    _id: Number,
    name: {type: String , required:true},
    localidad: {
            type: Number,
            ref: 'Localidad',
            required: true
        },
    estado: {type: Boolean , required:true},
    },
    
    {
        timestamps: true
    }
)
const Barrio = mongoose.model("Barrio", Barrio_Schema, "Barrio");

module.exports = Barrio;