const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    name: {type: String , require:true},
    stock: {type: Number , require:true},
    bodega: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bodega',
            required: false
        },
    paraje: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bodega_Paraje',
            required: false
        },
    crianza: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vino_Crianza',
            required: false
        },
    price: {type: Number , require:true},
    tipo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vino_Tipo',
            required: false
        } ,
    uva: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vino_Uva',
            required: false
        } ,
    varietal: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vino_Varietal',
            required: false
        } ,
    volumen: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vino_Volumen',
            required: false
        },
    deposito: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Deposito',
            required: false
        } ,
    },
    
    {
        timestamps: true
    }
)

const Product = mongoose.model("Product", productSchema)

module.exports = Product;