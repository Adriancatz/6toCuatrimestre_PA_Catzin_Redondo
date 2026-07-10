const URL_API = 'https://fakestoreapi.com/products';

fetch(URL_API)
    .then(respuesta => respuesta.json())
    .then(productos => {
        const contenedor = document.getElementById('contenedor-productos');
        let htmlContenido = '';

        productos.forEach(producto => {
            htmlContenido += `
                <div class="tarjeta-producto">
                    <img src="${producto.image}" alt="${producto.title}">
                    <h3>${producto.title}</h3>
                    <p>Precio: $${producto.price}</p>
                    <span class="badge">${producto.category}</span>
                </div>
            `;
        });
        contenedor.innerHTML = htmlContenido;
    })
    .catch(error => {
        console.error("Hubo un error al consumir la API:", error);
    });