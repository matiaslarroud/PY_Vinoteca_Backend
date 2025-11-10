const mongoose = require("mongoose");

const tipoComprobante_Schema = mongoose.Schema({
    _id: Number,
    name: {type: String , require:true},
    condicionIva: {
        type: Number,
        ref: 'CondicionIva',
        required: true
    },
    estado: {type: Boolean , require:true},
    
    },
    {
        timestamps: true
    }
)
const TipoComprobante = mongoose.model("TipoComprobante", tipoComprobante_Schema , "TipoComprobante");

module.exports = TipoComprobante;