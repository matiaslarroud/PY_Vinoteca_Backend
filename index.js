const express = require('express');

const app = express();

app.get('/' , (req , res) => {
    console.log('petición recibida.');

    res.send('<h1>ENTUSIASMO POR EL VINO</h1><br><h2>En proceso...</h2>');
})

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
    console.log("Escuchando puerto ", PORT);
})