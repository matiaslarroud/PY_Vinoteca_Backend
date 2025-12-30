const mongoose = require("mongoose");

const Caja_Schema = mongoose.Schema({
    _id: Number,
    referencia: {type: String , require:true},
    persona: {type: Number , require:true},
    total: {type: Number , require:true},
    tipo: {type: String , require:true},
    fecha: {type:Date , require:true} ,
    medioPago: {
            type: Number,
            ref: 'MedioPago',
            required: true
        },
    estado: {type: Boolean , require:true},
    },
    
    {
        timestamps: true
    }
)
const Caja = mongoose.model("Caja", Caja_Schema, "Caja");

module.exports = Caja;