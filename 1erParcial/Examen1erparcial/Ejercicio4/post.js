const URL_API = 'https://jsonplaceholder.typicode.com/posts';

fetch(URL_API)
    .then(respuesta => respuesta.json())
    .then(posts => {
        const tbody = document.getElementById('tabla-posts');
        let htmlFilas = '';

        const primerosDiez = posts.slice(0, 10);

        primerosDiez.forEach(post => {
            let cuerpoTruncado = post.body.substring(0, 50) + "...";
            
            let tituloFormateado = post.title
                .split(' ')
                .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
                .join(' ');

            htmlFilas += `
                <tr>
                    <td>${post.id}</td>
                    <td>${tituloFormateado}</td>
                    <td>${cuerpoTruncado}</td>
                </tr>
            `;
        });

        tbody.innerHTML = htmlFilas;
    })
    .catch(error => console.error("Error al cargar los posts:", error));