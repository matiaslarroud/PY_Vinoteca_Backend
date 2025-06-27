const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    name: {type: String , require:true},
    price: Number
    },
    {
        timestamps: true
    }
)

const Product = mongoose.model("Product", productSchema)

module.exports = Product;