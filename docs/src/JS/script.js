// ===============================
// IMPORTS
// ===============================

import { obtenerUsuarioAutenticado } from "../api/authApi.js";

import {
    buscarTmdb,
    buscarAnime,
    guardarContenidoExterno
} from "../api/catalogoApi.js";

import { apiRequest } from "../api/api.js";

// ===============================
// CONFIG
// ===============================

const API_URL = "https://homiewood.onrender.com/api";

// ===============================
// ESTADO GLOBAL
// ===============================

let usuarioActual = null;
let selectedFilm = null;

const userRatings = {};
const userLists = {};

// ===============================
// INIT
// ===============================

document.addEventListener("DOMContentLoaded", async function () {

    console.log("home.js cargado");

    await cargarUsuarioLogueado();

    inicializarBuscadorPeliculas();
    inicializarPublicador();

    inicializarNavbar();
    inicializarModalPelicula();
    inicializarSidebarDrawer();
    inicializarComposer();

    await cargarFeed();
});

// ===============================
// AUTH
// ===============================

async function cargarUsuarioLogueado() {

    const token = localStorage.getItem("token");
    const usuarioGuardado = localStorage.getItem("usuario");

    const nombreUsuario =
        document.getElementById("navbar-username");

    if (!token) {

        window.location.href =
            "/DeployHo/html/login.html";

        return;
    }

    if (usuarioGuardado) {

        usuarioActual = JSON.parse(usuarioGuardado);

        if (nombreUsuario) {

            nombreUsuario.textContent =
                `@${usuarioActual.username || usuarioActual.nombre}`;
        }

        return;
    }

    try {

        const usuario =
            await obtenerUsuarioAutenticado();

        usuarioActual = usuario;

        localStorage.setItem(
            "usuario",
            JSON.stringify(usuario)
        );

        if (nombreUsuario) {

            nombreUsuario.textContent =
                `@${usuario.username || usuario.nombre}`;
        }

    } catch (error) {

        console.error(error);

        localStorage.removeItem("token");
        localStorage.removeItem("usuario");

        window.location.href =
            "/DeployHo/html/login.html";
    }
}

function cerrarSesion() {

    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    window.location.href =
        "/DeployHo/html/login.html";
}

function obtenerNombreUsuarioActual() {

    return usuarioActual?.username
        || usuarioActual?.nombre
        || "Usuario";
}

// ===============================
// UTILS
// ===============================

function escapeHtml(texto) {

    return String(texto ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function tagClass(tag) {

    const blue = [
        "Anime",
        "Sci-Fi",
        "Misterio"
    ];

    const yellow = [
        "TV Show",
        "Aventura",
        "Acción",
        "Fantasía"
    ];

    const teal = [
        "Película",
        "Drama",
        "Romance"
    ];

    if (blue.includes(tag)) return "tag-blue";
    if (yellow.includes(tag)) return "tag-yellow";
    if (teal.includes(tag)) return "tag-teal";

    return "tag-blue";
}

function timeNow() {

    return new Date().toLocaleString("es-CL", {

        day: "2-digit",
        month: "short",
        year: "numeric",

        hour: "2-digit",
        minute: "2-digit"
    });
}

// ===============================
// FEED BACKEND
// ===============================

async function cargarFeed() {

    try {

        const calificaciones =
            await apiRequest("/calificaciones");

        const feed =
            document.getElementById("feed");

        if (!feed) return;

        feed.innerHTML =
            calificaciones
                .reverse()
                .map(renderCalificacion)
                .join("");

        for (const c of calificaciones) {

            await cargarLikes(c.idCalificacion);
        }

    } catch (e) {

        console.error(
            "Error cargando feed:",
            e
        );
    }
}

// ===============================
// RENDER POST
// ===============================

function renderCalificacion(c) {

    const fecha =
        c.fechaCalificacion?.split("T")[0] || "";

    const tipo =
        c.tipoContenido || "Contenido";

    const tagsHtml = `
        <span class="tag ${tagClass(tipo)}">
            ${escapeHtml(tipo)}
        </span>
    `;

    const posterStyle = c.posterUrl
        ? `
            background-image:url('${c.posterUrl}');
            background-size:cover;
            background-position:center;
        `
        : `
            background:linear-gradient(
                135deg,
                #2a1a4a,
                #5a2a8a
            )
        `;

    return `

    <div
        class="post-card"
        id="post-${c.idCalificacion}"
    >

        <div class="timestamp">
            ${fecha}
        </div>

        <div
            class="
                d-flex
                justify-content-between
                align-items-center
                flex-wrap
                gap-2
                mb-3
            "
        >

            <div class="username">

                <div class="user-icon">

                    <img
                        src="/DeployHo/img/home_profileicon(noglow).webp"
                        width="40px"
                    >

                </div>

                ${escapeHtml(
                    c.username ||
                    c.nombreUsuario
                )}

            </div>

            <div class="d-flex gap-2 flex-wrap">

                ${tagsHtml}

            </div>

        </div>

        <div class="d-flex gap-3">

            <div
                class="post-thumb"
                style="${posterStyle}"
            >

                ${
                    !c.posterUrl
                        ? escapeHtml(c.tituloContenido)
                        : ""
                }

            </div>

            <p class="post-text mb-0">

                ${escapeHtml(
                    c.comentario || ""
                )}

            </p>

        </div>

        <div class="post-actions">

            <button
                id="btn-like-${c.idCalificacion}"
                onclick="
                    toggleLike(
                        ${c.idCalificacion},
                        'LIKE'
                    )
                "
            >

                <img
                    src="/DeployHo/img/postlike.webp"
                    width="50px"
                    class="glow-image"
                >

                <span
                    id="count-like-${c.idCalificacion}"
                >
                    0
                </span>

            </button>

            <button
                id="btn-dislike-${c.idCalificacion}"
                onclick="
                    toggleLike(
                        ${c.idCalificacion},
                        'DISLIKE'
                    )
                "
            >

                <img
                    src="/DeployHo/img/postdislike.webp"
                    width="50px"
                    class="glow-image"
                >

                <span
                    id="count-dislike-${c.idCalificacion}"
                >
                    0
                </span>

            </button>

        </div>

        <button
            class="comment-toggle"
            onclick="
                toggleComments(
                    ${c.idCalificacion}
                )
            "
        >

            <img
                src="/DeployHo/img/hamstercomment.webp"
                width="50px"
            >

            Comentarios

        </button>

        <div
            class="comment-section"
            id="comments-${c.idCalificacion}"
        >

            <div
                class="comment-list"
                id="comment-list-${c.idCalificacion}"
            ></div>

            <div class="comment-input-row">

                <input
                    type="text"
                    id="comment-input-${c.idCalificacion}"
                    placeholder="Escribe un comentario..."

                    onkeydown="
                        if(event.key==='Enter')
                        addComment(
                            ${c.idCalificacion}
                        )
                    "
                >

                <button
                    onclick="
                        addComment(
                            ${c.idCalificacion}
                        )
                    "
                >
                    Comentar
                </button>

            </div>

        </div>

    </div>
    `;
}

// ===============================
// LIKES
// ===============================

async function cargarLikes(idCalificacion) {

    try {

        const data =
            await apiRequest(
                `/likes-calificacion/${idCalificacion}/${usuarioActual.idUsuario}`
            );

        actualizarLikesUI(data);

    } catch (e) {

        console.error(
            "Error cargando likes:",
            e
        );
    }
}

function actualizarLikesUI(data) {

    const id =
        data.idCalificacion;

    const countLike =
        document.getElementById(
            `count-like-${id}`
        );

    const countDislike =
        document.getElementById(
            `count-dislike-${id}`
        );

    const btnLike =
        document.getElementById(
            `btn-like-${id}`
        );

    const btnDislike =
        document.getElementById(
            `btn-dislike-${id}`
        );

    if (countLike) {

        countLike.textContent =
            data.totalLikes;
    }

    if (countDislike) {

        countDislike.textContent =
            data.totalDislikes;
    }

    if (btnLike) {

        btnLike.classList.toggle(
            "active",
            data.tipoUsuario === "LIKE"
        );
    }

    if (btnDislike) {

        btnDislike.classList.toggle(
            "active",
            data.tipoUsuario === "DISLIKE"
        );
    }
}

async function toggleLike(
    idCalificacion,
    tipo
) {

    try {

        const data =
            await apiRequest(
                "/likes-calificacion",
                {
                    method: "POST",

                    body: JSON.stringify({

                        idCalificacion,

                        idUsuario:
                            usuarioActual.idUsuario,

                        tipo
                    })
                }
            );

        actualizarLikesUI(data);

    } catch (e) {

        console.error(
            "Error en toggleLike:",
            e
        );
    }
}

// ===============================
// EXPORTS
// ===============================

window.toggleLike = toggleLike;
window.cerrarSesion = cerrarSesion;