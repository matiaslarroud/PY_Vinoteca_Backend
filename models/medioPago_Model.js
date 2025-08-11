const mongoose = require("mongoose");

const MedioPago_Schema = mongoose.Schema({
    name: {type: String , require:true},
    interes: {type: Number , require:true},
    },
    
    {
        timestamps: true
    }
)
const MedioPago = mongoose.model("MedioPago", MedioPago_Schema);

module.exports = MedioPago;