const mongoose = require("mongoose");

const Pais_Schema = mongoose.Schema({
    name: {type: String , require:true},
},
    
    {
        timestamps: true
    }
)

const Pais = mongoose.model("Pais", Pais_Schema);

module.exports = Pais;