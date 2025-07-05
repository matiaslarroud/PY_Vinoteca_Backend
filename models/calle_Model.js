const mongoose = require("mongoose");

const Calle_Schema = mongoose.Schema({
    name: {type: String , require:true},
    barrio: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Barrio',
            required: true
        },
    },
    
    {
        timestamps: true
    }
)
const Calle = mongoose.model("Calle", Calle_Schema);

module.exports = Calle;