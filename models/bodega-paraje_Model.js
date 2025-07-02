const mongoose = require("mongoose");

const BodegaParaje_Schema = mongoose.Schema({
    name: {type: String , require:true},
    bodega: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bodega',
        required: true
    },
    pais: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Pais',
            required: true
        },
    provincia: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Provincia',
            required: true
        },
    localidad: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Localidad',
            required: true
        },
    barrio: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Barrio',
            required: true
        },
    calle: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Calle',
            required: true
        }
},
    {
        timestamps: true
    }  
)

const Bodega_Paraje = mongoose.model("Bodega_Paraje", BodegaParaje_Schema);

module.exports = Bodega_Paraje;