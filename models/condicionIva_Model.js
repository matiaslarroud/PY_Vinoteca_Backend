const mongoose = require("mongoose");

const CondicionIva_Schema = mongoose.Schema({
    name: {type: String , require:true},
    },
    
    {
        timestamps: true
    }
)
const CondicionIva = mongoose.model("CondicionIva", CondicionIva_Schema);

module.exports = CondicionIva;