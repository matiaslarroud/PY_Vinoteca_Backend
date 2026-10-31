const mongoose = require("mongoose");

const Caja_Schema = mongoose.Schema({
    _id: Number,
    referencia: {type: String },
    persona: {type: Number },
    total: {type: Number , required:true},
    tipo: {type: String , required:true, enum: ['ENTRADA', 'SALIDA', 'CUENTA_CORRIENTE']},
    fecha: {type:Date , required:true} ,
    medioPago: {
            type: Number,
            ref: 'MedioPago',
            required: true
        },
    tipoPersona: { type: String, enum: ['CLIENTE', 'PROVEEDOR'], required: false },
    // Documento que generó el movimiento. Los movimientos manuales no tienen origen.
    // (Los movimientos anteriores a este campo se identifican por `referencia`.)
    origen: {
        tipo: { type: String, enum: ['NOTA_PEDIDO', 'RECIBO_PAGO', 'PAGO_PROVEEDOR'] },
        id: { type: Number }
    },
    estado: {type: Boolean , required:true},
    },
    
    {
        timestamps: true
    }
)
Caja_Schema.index({ estado: 1, fecha: -1 });
Caja_Schema.index({ persona: 1, tipoPersona: 1, estado: 1 });
Caja_Schema.index({ "origen.tipo": 1, "origen.id": 1 });
Caja_Schema.index({ referencia: 1 });

const Caja = mongoose.model("Caja", Caja_Schema, "Caja");

module.exports = Caja;