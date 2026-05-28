import { apiRequest } from "./api/api.js";

const API_URL = "https://homiewood.onrender.com/api";

// ===============================
// INIT
// ===============================

document.addEventListener("DOMContentLoaded", async function () {
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (!usuario) {
        window.location.href = "/DeployHo/html/login.html";
        return;
    }

    await cargarDatosUsuario(usuario.idUsuario);
    await cargarPostsUsuario(usuario.idUsuario);
});

// ===============================
// CARGAR DATOS USUARIO
// ===============================

async function cargarDatosUsuario(idUsuario) {
    try {
        const usuario = await apiRequest(`/usuarios/${idUsuario}`);

        document.getElementById("profileName").textContent = usuario.nombre || "Usuario";
        document.getElementById("profileUsername").textContent = `@${usuario.username}`;

        // Fecha de creación como dato extra
        if (usuario.fechaCreacion) {
            const fecha = usuario.fechaCreacion.split("T")[0];
            console.log("Miembro desde:", fecha);
        }

    } catch (e) {
        console.error("Error cargando datos del usuario:", e);
    }
}

// ===============================
// CARGAR POSTS DEL USUARIO
// ===============================

async function cargarPostsUsuario(idUsuario) {
    try {
        const calificaciones = await apiRequest("/calificaciones");
        const propias = calificaciones.filter(c => c.idUsuario === idUsuario);

        const feed = document.getElementById("feed");
        if (!feed) return;

        document.getElementById("statPosts").textContent = propias.length;

        if (propias.length === 0) {
            feed.innerHTML = `<p style="color:#aaa; text-align:center; margin-top:2rem;">
                Aún no has publicado nada.
            </p>`;
            return;
        }

        feed.innerHTML = propias.reverse().map(c => renderPost(c)).join("");

    } catch (e) {
        console.error("Error cargando posts:", e);
    }
}

// ===============================
// RENDER POST
// ===============================

function renderPost(c) {
    const fecha = c.fechaCalificacion ? c.fechaCalificacion.split("T")[0] : "";
    const tipo = c.tipoContenido || "Contenido";

    return `
    <div class="post-card" id="post-${c.idCalificacion}">
        <div class="timestamp">${fecha}</div>
        <div class="d-flex gap-2 flex-wrap mb-2">
            <span class="tag tag-blue">${tipo}</span>
        </div>
        <div class="d-flex gap-3">
            <div class="post-thumb" style="${c.posterUrl
                ? `background-image:url('${c.posterUrl}');background-size:cover;background-position:center;`
                : 'background:linear-gradient(135deg,#2a1a4a,#5a2a8a)'}">
                ${c.posterUrl ? '' : (c.tituloContenido || "")}
            </div>
            <p class="post-text mb-0">${c.comentario || ""}</p>
        </div>
    </div>`;
}