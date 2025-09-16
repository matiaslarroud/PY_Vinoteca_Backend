const mongoose = require("mongoose");

const Pais_Schema = mongoose.Schema({
    _id: Number,
    name: {type: String , require:true},
},
    
    {
        timestamps: true
    }
)

const Pais = mongoose.model("Pais", Pais_Schema , "Pais");

module.exports = Pais;