const mongoose = require("mongoose");

const VarietalVino_Schema = mongoose.Schema({
    _id: Number,
    name: {type: String , required:true},
    estado: {type: Boolean , required:true},
},
    
    {
        timestamps: true
    }
)

const VarietalVino = mongoose.model("Vino_Varietal", VarietalVino_Schema , "Vino_Varietal");

module.exports = VarietalVino;