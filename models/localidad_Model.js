const mongoose = require("mongoose");

const Localidad_Schema = mongoose.Schema({
    _id: Number,
    name: {type: String , required:true},
    provincia: {
            type: Number,
            ref: 'Provincia',
            required: true
        },
    estado: {type: Boolean , required:true},
    },
    
    {
        timestamps: true
    }
)
const Localidad = mongoose.model("Localidad", Localidad_Schema , "Localidad");

module.exports = Localidad;