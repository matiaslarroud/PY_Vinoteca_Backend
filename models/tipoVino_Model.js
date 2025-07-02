const mongoose = require("mongoose");

const VinoTipo_Schema = mongoose.Schema({
    name: {type: String , require:true},
},
    
    {
        timestamps: true
    })

const VinoTipo = mongoose.model("Vino_Tipo", VinoTipo_Schema);

module.exports = VinoTipo;