const mongoose = require("mongoose");

const VinoTipo_Schema = mongoose.Schema({
    _id: Number,
    name: {type: String , require:true},
    estado: {type: Boolean , require:true},
},
    
    {
        timestamps: true
    })

const VinoTipo = mongoose.model("Vino_Tipo", VinoTipo_Schema , "Vino_Tipo");

module.exports = VinoTipo;