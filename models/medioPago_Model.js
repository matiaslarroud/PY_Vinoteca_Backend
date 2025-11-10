const mongoose = require("mongoose");

const MedioPago_Schema = mongoose.Schema({
    _id: Number,
    name: {type: String , require:true},
    interes: {type: Number , require:true},
    estado: {type: Boolean , require:true},
    },
    
    {
        timestamps: true
    }
)
const MedioPago = mongoose.model("MedioPago", MedioPago_Schema , "MedioPago");

module.exports = MedioPago;