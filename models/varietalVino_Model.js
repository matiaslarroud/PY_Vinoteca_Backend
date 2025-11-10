const mongoose = require("mongoose");

const VarietalVino_Schema = mongoose.Schema({
    _id: Number,
    name: {type: String , require:true},
    estado: {type: Boolean , require:true},
},
    
    {
        timestamps: true
    }
)

const VarietalVino = mongoose.model("Vino_Varietal", VarietalVino_Schema , "Vino_Varietal");

module.exports = VarietalVino;