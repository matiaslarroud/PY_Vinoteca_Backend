const mongoose = require("mongoose");

const VolumenVino_Schema = mongoose.Schema({
    _id: Number,
    name: {type: String , require:true},
    estado: {type: Boolean , require:true},
},
    
    {
        timestamps: true
    }
)

const VolumenVino = mongoose.model("Vino_Volumen", VolumenVino_Schema , 'Vino_Volumen');

module.exports = VolumenVino;