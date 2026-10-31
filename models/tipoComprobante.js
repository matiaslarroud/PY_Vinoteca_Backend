const mongoose = require("mongoose");

const tipoComprobante_Schema = mongoose.Schema({
    _id: Number,
    name: {type: String , required:true},
    condicionIva: {
        type: Number,
        ref: 'CondicionIva',
        required: true
    },
    estado: {type: Boolean , required:true},
    
    },
    {
        timestamps: true
    }
)
const TipoComprobante = mongoose.model("TipoComprobante", tipoComprobante_Schema , "TipoComprobante");

module.exports = TipoComprobante;