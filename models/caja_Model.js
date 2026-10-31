const mongoose = require("mongoose");

const Caja_Schema = mongoose.Schema({
    _id: Number,
    referencia: {type: String },
    persona: {type: Number },
    total: {type: Number , required:true},
    tipo: {type: String , required:true},
    fecha: {type:Date , required:true} ,
    medioPago: {
            type: Number,
            ref: 'MedioPago',
            required: true
        },
    tipoPersona: { type: String, enum: ['CLIENTE', 'PROVEEDOR'], required: false },
    estado: {type: Boolean , required:true},
    },
    
    {
        timestamps: true
    }
)
const Caja = mongoose.model("Caja", Caja_Schema, "Caja");

module.exports = Caja;