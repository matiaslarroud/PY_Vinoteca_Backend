const mongoose = require("mongoose");

const Bodega_Schema = mongoose.Schema({
    _id: Number,
    name: {type: String , required:true},
    familia: {type: String },
    estado: {type: Boolean , required:true},
},
    {
        timestamps: true
    }  
)

const Bodega = mongoose.model("Bodega", Bodega_Schema , "Bodega");

module.exports = Bodega;