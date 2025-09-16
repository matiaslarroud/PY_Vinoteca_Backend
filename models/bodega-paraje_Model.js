const mongoose = require("mongoose");

const BodegaParaje_Schema = mongoose.Schema({
    _id: Number,
    name: {type: String , require:true},
    bodega: {
        type: Number,
        ref: 'Bodega',
        required: true
    },
    pais: {
            type: Number,
            ref: 'Pais',
            required: true
        },
    provincia: {
            type: Number,
            ref: 'Provincia',
            required: true
        },
    localidad: {
            type: Number,
            ref: 'Localidad',
            required: true
        },
    barrio: {
            type: Number,
            ref: 'Barrio',
            required: true
        },
    calle: {
            type: Number,
            ref: 'Calle',
            required: true
        },
    altura: {type: Number , require:true},
},
    {
        timestamps: true
    }  
)

const Bodega_Paraje = mongoose.model("Bodega_Paraje", BodegaParaje_Schema , "Bodega_Paraje");

module.exports = Bodega_Paraje;