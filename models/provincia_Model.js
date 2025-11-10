const mongoose = require("mongoose");

const Provincia_Schema = mongoose.Schema({
    _id: Number,
    name: {type: String , require:true},
    pais: {
            type: Number,
            ref: 'Pais',
            required: true
        },
    estado: {type: Boolean , require:true},
    },
    
    {
        timestamps: true
    }
)
const Provincia = mongoose.model("Provincia", Provincia_Schema , "Provincia");

module.exports = Provincia;