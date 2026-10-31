const mongoose = require("mongoose");

const MedioPago_Schema = mongoose.Schema({
    _id: Number,
    name: {type: String , required:true},
    interes: {type: Number },
    estado: {type: Boolean , required:true},
    },
    
    {
        timestamps: true
    }
)
const MedioPago = mongoose.model("MedioPago", MedioPago_Schema , "MedioPago");

module.exports = MedioPago;