console.log("HOLA DESDE EL SERVIDOR");

const nombreP = document.querySelector('#inputNombre');
const precioP = document.querySelector('#inputPrecio');
const botonP = document.querySelector('#botonCargar');

botonP.addEventListener('click' , (e) => {
    const nombre = nombreP.value;
    const precio = precioP.value;

    console.log({ nombre, precio });

    fetch('http://localhost:5000/api/v1/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            nombre,
            precio,
        }),
    })
})