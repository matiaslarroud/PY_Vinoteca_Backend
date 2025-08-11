const mongoose = require("mongoose");

const tipoComprobante_Schema = mongoose.Schema({
    name: {type: String , require:true},
    condicionIva: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CondicionIva',
        required: true
    },
    
    },
    {
        timestamps: true
    }
)
const TipoComprobante = mongoose.model("TipoComprobante", tipoComprobante_Schema);

module.exports = TipoComprobante;