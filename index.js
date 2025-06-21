const express = require('express');
const path = require('path')

const app = express();

app.use(express.static(path.join(__dirname,"public")))

app.get('/' , (req , res) => {
    console.log('petición recibida.');
})

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
    console.log("Escuchando puerto ", PORT);
})