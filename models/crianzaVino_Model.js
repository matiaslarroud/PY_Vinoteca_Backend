const mongoose = require("mongoose");

const CrianzaVino_Schema = mongoose.Schema({
    name: {type: String , require:true},
},
    {
        timestamps: true
    }  
)

const CrianzaVino = mongoose.model("Vino_Crianza", CrianzaVino_Schema);

module.exports = CrianzaVino;