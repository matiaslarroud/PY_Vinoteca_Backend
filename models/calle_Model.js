const mongoose = require("mongoose");

const Calle_Schema = mongoose.Schema({
    _id: Number,
    name: {type: String , require:true},
    barrio: {
            type: Number,
            ref: 'Barrio',
            required: true
        },
    },
    
    {
        timestamps: true
    }
)
const Calle = mongoose.model("Calle", Calle_Schema , "Calle");

module.exports = Calle;