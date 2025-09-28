const mongoose = require("mongoose");

const UvaTipo_Schema = mongoose.Schema({
    _id: Number,
    name: {type: String , require:true}
    },
    {
        timestamps: true
    }  
    
)

const UvaTipo = mongoose.model("Vino_Uva", UvaTipo_Schema , "Vino_Uva");

module.exports = UvaTipo;