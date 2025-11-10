const mongoose = require("mongoose");

const CrianzaVino_Schema = mongoose.Schema({
    _id: Number,
    name: {type: String , require:true},
    estado: {type: Boolean , require:true},
},
    {
        timestamps: true
    }  
)

const CrianzaVino = mongoose.model("Vino_Crianza", CrianzaVino_Schema , "Vino_Crianza");

module.exports = CrianzaVino;