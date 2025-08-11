const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    name: {type: String , require:true},
    stock: {
        type: Number , 
        require:true ,
        min: [0, 'El stock no puede ser negativo']
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

const Product = mongoose.model("Producto", productSchema)

module.exports = Product;