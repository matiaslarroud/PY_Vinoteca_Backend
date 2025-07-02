const mongoose = require("mongoose");

const VolumenVino_Schema = mongoose.Schema({
    name: {type: String , require:true},
},
    
    {
        timestamps: true
    }
)

const VolumenVino = mongoose.model("Vino_Volumen", VolumenVino_Schema);

module.exports = VolumenVino;