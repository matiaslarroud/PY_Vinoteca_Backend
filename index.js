const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const { json } = require('stream/consumers');

const app = express();

mongoose
    .connect(`mongodb+srv://matutedel30:${process.env.PASS_MONGODB}@vinOteca.thjyjhn.mongodb.net/Vinoteca?retryWrites=true&w=majority&appName=Vinoteca`)
    .then(() => {console.log("CONEXION EXITOSA A LA BD.")})
    .catch((error) => {console.log(`ERROR DE CONEXION A LA BD. \n ERROR: ${error}`)});

const productSchema = mongoose.Schema({
    name: {type: String , require:true},
    price: Number
    },
    {
        timestamps: true
    }
)

const Product = mongoose.model("Product", productSchema)

app.use(express.json());
app.use(cors());
    
app.post('/api/v1/products' , (req , res ) => {
    const nombreProducto = req.body.name;
    const precioProducto = req.body.price;
    
    if (!nombreProducto) {
        res.status(400).json({ok:false , message:'No se puede cargar el producto sin el nombre.'});
        return
    }

    const newProduct = new Product({name: nombreProducto , price: precioProducto});
    newProduct.save()
        .then(() => { 
            console.log("PRODUCTO CREADO EXITOSAMENTE");
            res.status(201).json({ok:true});
        })
        .catch((error) => { console.log(error) }) 
    
});

// app.get('/', (req,res) => {
//     const pokeApiUrl = 'https://pokeapi.co/api/v2/pokemon'
//     const pokemon = 'pikachu'
//     axios(`${pokeApiUrl}/${pokemon}`)
//         .then((poke) => {
//                 const pokemon = poke.data;
//                 console.log(pokemon.name)
//                 const html = `
//                             <head>
//                                 <meta charset="UTF-8">
//                                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                                 <title>Vinoteca</title>
//                                 <link rel="stylesheet" href="style.css">
//                                 <script src="index.js" defer></script>
//                             </head>
//                             <body>
//                                 <h1>ENTUSIASMO POR EL VINO</h1>
//                                 <br>
//                                 <h2>En proceso de desarrollo.</h2>

//                                 <form class="form" method="post">
//                                     <input type="text" name="inputNombre" id="inputNombre" placeholder="Ingrese el nombre del producto">
//                                     <input type="number" name="inputPrecio" id="inputPrecio" placeholder="Ingrese el precio del producto">
//                                     <button type="button" id="botonCargar">Cargar</button>
//                                 </form>
//                                 <h2>${pokemon.name}</h2>
//                                 <img src=${pokemon.sprites.front_default} alt="Imagen de ${pokemon.name}">
//                             </body>
//                             `;
//                 res.send(html);
//             })
//             // .then((pok) => {
//             //     // const body = document.querySelector('body');
//             //     // const div = document.createElement('div');
//             //     // 
//             //     // div.classList="poke-card";
//             //     // div.innerHTML = html;
//             //     // body.appendChild(div);
//             // })
//             // .catch((err) => {console.log('ERROR CON JSON \n ERROR: ',err)})
//         .catch((err) => {console.log('ERROR AL BUSCAR \n ERROR: ',err)})
// // })

// app.use(express.static(path.join(__dirname,'public')));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log("Escuchando puerto ", PORT);
});