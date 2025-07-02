const mongoose = require("mongoose");

const VarietalVino_Schema = mongoose.Schema({
    name: {type: String , require:true},
    uva: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vino_Uva',
        required: true
    } ,
},
    
    {
        timestamps: true
    }
)

const VarietalVino = mongoose.model("Vino_Varietal", VarietalVino_Schema);

module.exports = VarietalVino;