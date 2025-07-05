const mongoose = require("mongoose");

const Localidad_Schema = mongoose.Schema({
    name: {type: String , require:true},
    provincia: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Provincia',
            required: true
        },
    },
    
    {
        timestamps: true
    }
)
const Localidad = mongoose.model("Localidad", Localidad_Schema);

module.exports = Localidad;