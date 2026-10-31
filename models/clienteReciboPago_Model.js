const mongoose = require("mongoose");

const ReciboPago_Schema = mongoose.Schema({
    _id: Number,
    total: {type: Number , required:true},
    fecha: {type: Date , required:true},
    clienteID: {
            type: Number,
            ref: 'Cliente',
        },
    medioPagoID: {
            type: Number,
            ref: 'MedioPago',
        },
    estado: {type: Boolean , required:true},
},
    
    {
        timestamps: true
    }
)
const Cliente_ReciboPago = mongoose.model("Cliente_ReciboPago", ReciboPago_Schema , "Cliente_ReciboPago");
module.exports = Cliente_ReciboPago;