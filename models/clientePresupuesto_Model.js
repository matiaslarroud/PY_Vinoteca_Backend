const mongoose = require("mongoose");

const Presupuesto_Schema = mongoose.Schema({
    _id: Number,
    total: {type: Number , require:true},
    fecha: {type: Date , require:true},
    cliente: {
            type: Number,
            ref: 'Cliente',
            required: true
        },
    empleado: {
            type: Number,
            ref: 'Empleado',
            required: true
        },
    },
    
    {
        timestamps: true
    }
)
const Cliente_Presupuesto = mongoose.model("Cliente_Presupuesto", Presupuesto_Schema , "Cliente_Presupuesto");

module.exports = Cliente_Presupuesto;