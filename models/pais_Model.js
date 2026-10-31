const mongoose = require("mongoose");

const Pais_Schema = mongoose.Schema({
    _id: Number,
    name: {type: String , required:true},
    estado: {type: Boolean , required:true},
},
    
    {
        timestamps: true
    }
)

const Pais = mongoose.model("Pais", Pais_Schema , "Pais");

module.exports = Pais;