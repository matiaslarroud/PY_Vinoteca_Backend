console.log("HOLA DESDE EL SERVIDOR");

const nombreP = document.querySelector('#inputNombre');
const precioP = document.querySelector('#inputPrecio');
const botonP = document.querySelector('#botonCargar');

botonP.addEventListener('click' , (e) => {
    const nombre = nombreP.value;
    const precio = precioP.value;

    fetch('/api/v1/products', {
        method: 'POST',
        headers: {
            'Content-Type': '/application/json',
        },
        body: JSON.stringify({
            nombre: nombre,
            precio: precio,
        })
    })
})