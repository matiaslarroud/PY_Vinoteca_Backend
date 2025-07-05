const mongoose = require("mongoose");

const Provincia_Schema = mongoose.Schema({
    name: {type: String , require:true},
    pais: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Pais',
            required: true
        },
    },
    
    {
        timestamps: true
    }
)
const Provincia = mongoose.model("Provincia", Provincia_Schema);

module.exports = Provincia;