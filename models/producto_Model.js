const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    _id: Number,
    name: {type: String , require:true},
    stock: {
        type: Number , 
        require:true ,
        min: [0, 'El stock no puede ser negativo']
    },
    stockMinimo: {
        type: Number , 
        require:false ,
        min: [0, 'El stock minimo no puede ser negativo']
    },
    deposito: {
            type: Number,
            ref: 'Deposito',
            required: false
        } ,
    tipoProducto:{type: String , require:true}
    },
    {
        timestamps: true
    }
)

const Product = mongoose.model("Producto", productSchema , "Producto");

module.exports = Product;