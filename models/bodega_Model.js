const mongoose = require("mongoose");

const Bodega_Schema = mongoose.Schema({
    _id: Number,
    name: {type: String , require:true},
    familia: {type: String , require:true},
},
    {
        timestamps: true
    }  
)

const Bodega = mongoose.model("Bodega", Bodega_Schema , "Bodega");

module.exports = Bodega;