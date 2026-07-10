const API_URL = "https://192.168.1.140/videojuegos_app/"; 

let listaVideojuegosGlobal = [];

const tablaVideojuegos = document.getElementById("tabla-videojuegos");
const selectGenero = document.getElementById("id_genero");
const selectPlataforma = document.getElementById("id_plataforma");
const filterGenero = document.getElementById("filtrar-genero");
const filterPlataforma = document.getElementById("filtrar-plataforma");
const spinner = document.getElementById("spinner");
const btnGuardar = document.getElementById("btn-guardar");

document.addEventListener("DOMContentLoaded", () => {
    cargarCatalogos();     
    obtenerVideojuegos();  
});

// Cambiar visibilidad del indicador de carga y bloquear botones de forma segura
function toggleLoading(isLoading) {
    if (spinner) spinner.style.display = isLoading ? "block" : "none";
    if (btnGuardar) btnGuardar.disabled = isLoading;
}

async function cargarCatalogos() {
    try {
        const [resGen, resPlat] = await Promise.all([
            fetch(`${API_URL}api-genero.php`),
            fetch(`${API_URL}api-plataforma.php`)
        ]);

        if (!resGen.ok || !resPlat.ok) throw new Error("Error al traer catálogos del servidor");

        const generos = await resGen.json();
        const plataformas = await resPlat.json();

        // Poblar selectores de Género
        if (selectGenero && filterGenero) {
            let htmlGen = '<option value="">Selecciona un género</option>';
            // Guardamos el NOMBRE como el valor del option en el filtro para que coincida con tu endpoint (?genero=Accion)
            let htmlFilterGen = '<option value="">Filtrar por Género</option>';
            
            generos.forEach(g => {
                htmlGen += `<option value="${g.id}">${g.nombre}</option>`;
                htmlFilterGen += `<option value="${g.nombre}">${g.nombre}</option>`;
            });
            selectGenero.innerHTML = htmlGen;
            filterGenero.innerHTML = htmlFilterGen;
        }

        // Poblar selectores de Plataforma
        if (selectPlataforma && filterPlataforma) {
            let htmlPlat = '<option value="">Selecciona una plataforma</option>';
            // Guardamos el NOMBRE como el valor del option en el filtro para tu endpoint (?plataforma=Pc)
            let htmlFilterPlat = '<option value="">Filtrar por Plataforma</option>';
            
            plataformas.forEach(p => {
                htmlPlat += `<option value="${p.id}">${p.nombre}</option>`;
                htmlFilterPlat += `<option value="${p.nombre}">${p.nombre}</option>`;
            });
            selectPlataforma.innerHTML = htmlPlat;
            filterPlataforma.innerHTML = htmlFilterPlat;
        }

    } catch (error) {
        console.error("Error cargando los catálogos:", error);
    }
}

// =========================================================================
// OBTENER Y CONTROLAR LISTADO (GET)
// =========================================================================
async function obtenerVideojuegos(queryString = "") {
    toggleLoading(true);
    try {
        const res = await fetch(`${API_URL}api-videojuego.php${queryString}`);
        
        // Manejo estricto de errores HTTP (Rúbrica)
        if (!res.ok) {
            if (res.status === 404) throw new Error("404: Ruta o videojuego no encontrado.");
            if (res.status === 400) throw new Error("400: Petición incorrecta (Faltan datos).");
            if (res.status === 500) throw new Error("500: Error interno del servidor en PHP.");
            throw new Error(`Código de Error HTTP: ${res.status}`);
        }
        
        const videojuegos = await res.json();
        listaVideojuegosGlobal = videojuegos; // Guardamos en memoria global
        renderizarTabla(videojuegos);
    } catch (error) {
        alert("Error de la API: " + error.message);
    } finally {
        toggleLoading(false);
    }
}

function renderizarTabla(juegos) {
    if (!tablaVideojuegos) return;
    tablaVideojuegos.innerHTML = "";
    
    if (!Array.isArray(juegos) || juegos.length === 0) {
        tablaVideojuegos.innerHTML = `<tr><td colspan="6" style="text-align:center;">No se encontraron videojuegos.</td></tr>`;
        return;
    }

    juegos.forEach(juego => {
        const srcImagen = juego.imagen 
            ? `${API_URL}api-imagen.php?nombre=${encodeURIComponent(juego.imagen)}`
            : 'https://via.placeholder.com/60x60?text=No+Img'; 

        // Se llama a las funciones usando únicamente el ID numérico para evitar errores de comillas
        tablaVideojuegos.innerHTML += `
            <tr>
                <td>${juego.id}</td>
                <td><img src="${srcImagen}" width="60" height="60" style="object-fit:cover; border-radius:4px;" onerror="this.src='https://via.placeholder.com/60x60?text=Error'"></td>
                <td><strong>${juego.titulo}</strong></td>
                <td>$${parseFloat(juego.precio).toFixed(2)}</td>
                <td>⭐ ${juego.calificacion || '0'}/10</td>
                <td>
                    <button class="btn-warning" onclick="cargarVideojuegoEnFormulario(${juego.id})">Editar</button>
                    <button onclick="abrirModalPatch(${juego.id}, ${juego.precio}, ${juego.calificacion || 0})">⚡ Rápido</button>
                    <button class="btn-danger" onclick="eliminarVideojuego(${juego.id})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

// =========================================================================
// BÚSQUEDAS Y FILTROS (GET con Query Params corregidos)
// =========================================================================
function buscarPorTitulo() {
    const inputBuscar = document.getElementById("buscar-titulo");
    const txt = inputBuscar ? inputBuscar.value.trim() : "";
    obtenerVideojuegos(txt ? `?titulo=${encodeURIComponent(txt)}` : "");
}

function filtrarPorGenero() {
    const nombreGen = filterGenero ? filterGenero.value : "";
    obtenerVideojuegos(nombreGen ? `?genero=${encodeURIComponent(nombreGen)}` : "");
}

function filtrarPorPlataforma() {
    const nombrePlat = filterPlataforma ? filterPlataforma.value : "";
    obtenerVideojuegos(nombrePlat ? `?plataforma=${encodeURIComponent(nombrePlat)}` : "");
}

function limpiarFiltros() {
    const inputBuscar = document.getElementById("buscar-titulo");
    if (inputBuscar) inputBuscar.value = "";
    if (filterGenero) filterGenero.value = "";
    if (filterPlataforma) filterPlataforma.value = "";
    obtenerVideojuegos();
}

// =========================================================================
// ENVIAR / PROCESAR FORMULARIO (POST / PUT)
// =========================================================================
async function procesarFormulario() {
    const id = document.getElementById("videojuego-id").value;
    const fileInput = document.getElementById("imagen");
    const tieneImagen = fileInput && fileInput.files.length > 0;

    const titulo = document.getElementById("titulo").value.trim();
    const precio = document.getElementById("precio").value;

    if (!titulo || !precio) {
        alert("Error: Los campos Título y Precio son totalmente obligatorios.");
        return;
    }

    let url = `${API_URL}api-videojuego.php`;
    let metodo = id ? "PUT" : "POST";
    
    if (id) {
        url += `?id=${id}`;
    }

    let opcionesFetch = { method: metodo };

    if (tieneImagen) {
        // Enviar como FormData cuando hay archivos adjuntos
        const formData = new FormData();
        formData.append("titulo", titulo);
        formData.append("descripcion", document.getElementById("descripcion").value);
        formData.append("precio", precio);
        formData.append("lanzamiento", document.getElementById("lanzamiento").value);
        formData.append("calificacion", document.getElementById("calificacion").value || "0");
        formData.append("id_genero", selectGenero.value);
        formData.append("id_plataforma", selectPlataforma.value);
        formData.append("imagen", fileInput.files[0]);

        opcionesFetch.body = formData;
    } else {
        // Enviar como JSON plano si no hay archivo adjunto
        const datosJson = {
            titulo: titulo,
            descripcion: document.getElementById("descripcion").value,
            precio: parseFloat(precio),
            lanzamiento: document.getElementById("lanzamiento").value,
            calificacion: parseFloat(document.getElementById("calificacion").value) || 0,
            imagen: "",
            id_genero: selectGenero.value ? parseInt(selectGenero.value) : null,
            id_plataforma: selectPlataforma.value ? parseInt(selectPlataforma.value) : null
        };

        opcionesFetch.headers = { "Content-Type": "application/json" };
        opcionesFetch.body = JSON.stringify(datosJson);
    }

    toggleLoading(true);

    try {
        const res = await fetch(url, opcionesFetch);
        const data = await res.json();

        if (res.ok) {
            alert(id ? "¡Videojuego actualizado con éxito (PUT)!" : "¡Videojuego creado con éxito (POST)!");
            cancelarEdicion(); 
            obtenerVideojuegos(); 
        } else {
            alert("Error de la API: " + (data.message || "No se pudo procesar los datos."));
        }
    } catch (error) {
        alert("Fallo crítico de red: " + error.message);
    } finally {
        toggleLoading(false);
    }
}

// Carga los datos al Formulario principal para edición completa (PUT)
function cargarVideojuegoEnFormulario(id) {
    const juego = listaVideojuegosGlobal.find(j => j.id == id);
    if (!juego) return;

    document.getElementById("form-title").innerText = "Editar Videojuego Completo (PUT)";
    document.getElementById("videojuego-id").value = juego.id;
    document.getElementById("titulo").value = juego.titulo;
    document.getElementById("descripcion").value = juego.descripcion || "";
    document.getElementById("precio").value = juego.precio;
    document.getElementById("calificacion").value = juego.calificacion || "";
    document.getElementById("lanzamiento").value = juego.lanzamiento || "";
    if (selectGenero) selectGenero.value = juego.id_genero || "";
    if (selectPlataforma) selectPlataforma.value = juego.id_plataforma || "";
    
    const btnCancel = document.getElementById("btn-cancelar");
    if (btnCancel) btnCancel.style.display = "inline-block";
}

function cancelarEdicion() {
    const formTitle = document.getElementById("form-title");
    const vId = document.getElementById("videojuego-id");
    const form = document.getElementById("formulario-videojuego");
    const btnCancel = document.getElementById("btn-cancelar");

    if (formTitle) formTitle.innerText = "Agregar Nuevo Videojuego";
    if (vId) vId.value = "";
    if (form) form.reset();
    if (btnCancel) btnCancel.style.display = "none";
}

// =========================================================================
// EDICIÓN PARCIAL (PATCH)
// =========================================================================
function abrirModalPatch(id, precio, calificacion) {
    const pId = document.getElementById("patch-id");
    const pPrecio = document.getElementById("patch-precio");
    const pCal = document.getElementById("patch-calificacion");
    const modal = document.getElementById("modal-patch");

    if (pId) pId.value = id;
    if (pPrecio) pPrecio.value = precio;
    if (pCal) pCal.value = calificacion;
    if (modal) modal.style.display = "block";
}

function cerrarModalPatch() {
    const modal = document.getElementById("modal-patch");
    if (modal) modal.style.display = "none";
}

async function guardarPatch() {
    const id = document.getElementById("patch-id").value;
    const precio = parseFloat(document.getElementById("patch-precio").value);
    const calificacion = parseFloat(document.getElementById("patch-calificacion").value);

    if (isNaN(precio)) {
        alert("Por favor ingresa un precio válido.");
        return;
    }

    const datosPatch = {
        precio: precio,
        calificacion: isNaN(calificacion) ? 0 : calificacion
    };

    cerrarModalPatch();
    toggleLoading(true);

    try {
        const res = await fetch(`${API_URL}api-videojuego.php?id=${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosPatch)
        });

        const data = await res.json();

        if (res.ok) {
            alert("¡Edición rápida (PATCH) guardada exitosamente!");
            obtenerVideojuegos();
        } else {
            alert("Error al aplicar PATCH: " + data.message);
        }
    } catch (error) {
        alert("Fallo de conexión en PATCH: " + error.message);
    } finally {
        toggleLoading(false);
    }
}

// =========================================================================
// ELIMINACIÓN DE REGISTRO (DELETE)
// =========================================================================
async function eliminarVideojuego(id) {
    if (!confirm(`¿Estás completamente seguro de eliminar permanentemente el videojuego con ID: ${id}?`)) {
        return; 
    }

    toggleLoading(true);

    try {
        const res = await fetch(`${API_URL}api-videojuego.php?id=${id}`, {
            method: "DELETE"
        });

        const data = await res.json();

        if (res.ok) {
            alert("El registro fue eliminado correctamente.");
            obtenerVideojuegos();
        } else {
            alert("Error en eliminación: " + data.message);
        }
    } catch (error) {
        alert("Fallo de red en DELETE: " + error.message);
    } finally {
        toggleLoading(false);
    }
}