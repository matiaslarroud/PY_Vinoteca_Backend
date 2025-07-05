const mongoose = require("mongoose");

const Barrio_Schema = mongoose.Schema({
    name: {type: String , require:true},
    localidad: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Localidad',
            required: true
        },
    },
    
    {
        timestamps: true
    }
)
const Barrio = mongoose.model("Barrio", Barrio_Schema);

module.exports = Barrio;