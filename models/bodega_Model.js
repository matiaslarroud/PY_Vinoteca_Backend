const mongoose = require("mongoose");

const Bodega_Schema = mongoose.Schema({
    name: {type: String , require:true},
    familia: {type: String , require:true},
},
    {
        timestamps: true
    }  
)

const Bodega = mongoose.model("Bodega", Bodega_Schema);

module.exports = Bodega;