console.log("HOLA DESDE EL SERVIDOR");

const nombreForm = document.querySelector('#inputNombre');
const precioForm = document.querySelector('#inputPrecio');
const botonForm = document.querySelector('#botonCargar');

botonForm.addEventListener('click' , (e) => {
    const nombreP = nombreForm.value;
    const precioP = precioForm.value;

    fetch('/api/v1/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: nombreP,
            price: precioP,
        }),
    })
})