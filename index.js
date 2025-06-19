const express = require('express');

const app = express();

app.get('/' , (req , res) => {
    console.log('petición recibida.');

    res.send('<h1>HOLA</h1>');
})

app.listen(4000, () => {
    console.log("Escuchando en el puerto 4000.");
})