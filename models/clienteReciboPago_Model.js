const mongoose = require("mongoose");

const ReciboPago_Schema = mongoose.Schema({
    _id: Number,
    total: {type: Number , require:true},
    fecha: {type: Date , require:true},
    clienteID: {
            type: Number,
            ref: 'Cliente',
        },
    medioPagoID: {
            type: Number,
            ref: 'MedioPago',
        },
    estado: {type: Boolean , require:true},
},
    
    {
        timestamps: true
    }
)
const Cliente_ReciboPago = mongoose.model("Cliente_ReciboPago", ReciboPago_Schema , "Cliente_ReciboPago");
module.exports = Cliente_ReciboPago;