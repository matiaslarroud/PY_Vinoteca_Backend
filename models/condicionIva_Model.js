const mongoose = require("mongoose");

const CondicionIva_Schema = mongoose.Schema({
    _id: Number,
    name: {type: String , require:true},
    estado: {type: Boolean , require:true},
    },
    
    {
        timestamps: true
    }
)
const CondicionIva = mongoose.model("CondicionIva", CondicionIva_Schema , "CondicionIva");

module.exports = CondicionIva;