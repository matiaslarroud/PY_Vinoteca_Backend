const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    name: {type: String , require:true},
    stock: {type: Number , require:true},
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

const Product = mongoose.model("Producto", productSchema)

module.exports = Product;