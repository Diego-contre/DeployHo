// ===============================
// BUSCADOR PELICULAS
// ===============================

function inicializarBuscadorPeliculas() {

    const filmSearchInput =
        document.getElementById("filmSearchInput");

    const filmDropdown =
        document.getElementById("filmDropdown");

    if (!filmSearchInput || !filmDropdown) {
        return;
    }

    let searchTimeout = null;

    filmSearchInput.addEventListener(
        "input",
        () => {

            const q =
                filmSearchInput.value.trim();

            if (!q) {

                filmDropdown.classList.remove("open");
                return;
            }

            clearTimeout(searchTimeout);

            searchTimeout = setTimeout(
                async () => {

                    try {

                        const [tmdb, anime] =
                            await Promise.allSettled([

                                buscarTmdb(q),
                                buscarAnime(q)
                            ]);

                        const resultados = [

                            ...(tmdb.status === "fulfilled"
                                ? tmdb.value
                                : []),

                            ...(anime.status === "fulfilled"
                                ? anime.value
                                : [])
                        ];

                        if (!resultados.length) {

                            filmDropdown.classList.remove("open");
                            return;
                        }

                        filmDropdown._data = resultados;

                        filmDropdown.innerHTML =
                            resultados.map((f, i) => `

                            <div
                                class="film-option"
                                data-index="${i}"
                            >

                                <div
                                    class="mini-cover"

                                    style="
                                        background:linear-gradient(
                                            135deg,
                                            #2a1a4a,
                                            #5a2a8a
                                        );

                                        overflow:hidden;
                                        padding:0;
                                    "
                                >

                                    ${
                                        f.posterUrl

                                        ? `

                                        <img
                                            src="${f.posterUrl}"

                                            style="
                                                width:100%;
                                                height:100%;
                                                object-fit:cover;
                                                border-radius:6px;
                                            "
                                        >
                                        `

                                        : `

                                        <span
                                            style="
                                                font-size:0.7rem;
                                                padding:4px;
                                            "
                                        >

                                            ${escapeHtml(f.titulo)}

                                        </span>
                                        `
                                    }

                                </div>

                                <div>

                                    <div>
                                        ${escapeHtml(f.titulo)}
                                    </div>

                                    <div class="film-meta">

                                        ${escapeHtml(
                                            f.tipoContenido || ""
                                        )}

                                        ${
                                            f.anioEstreno

                                            ? " · " + f.anioEstreno

                                            : ""
                                        }

                                    </div>

                                </div>

                            </div>
                            `).join("");

                        filmDropdown.classList.add("open");

                    } catch (e) {

                        console.error(
                            "Error buscando:",
                            e
                        );
                    }

                },

                400
            );
        }
    );

    filmDropdown.addEventListener(
        "click",
        e => {

            const option =
                e.target.closest(".film-option");

            if (!option) return;

            const f =
                filmDropdown._data[
                    parseInt(option.dataset.index)
                ];

            selectFilm({

                title: f.titulo,

                type:
                    f.tipoContenido || "Contenido",

                tags: [
                    f.tipoContenido || "Contenido"
                ],

                grad:
                    "linear-gradient(135deg,#2a1a4a,#5a2a8a)",

                posterUrl:
                    f.posterUrl || null,

                apiId: f.apiId,

                proveedor: f.proveedor
            });
        }
    );

    document.addEventListener(
        "click",
        e => {

            if (
                !e.target.closest("#filmSearchWrap")
            ) {

                filmDropdown.classList.remove("open");
            }
        }
    );
}

// ===============================
// SELECT FILM
// ===============================

function selectFilm(film) {

    selectedFilm = film;

    const filmSearchInput =
        document.getElementById("filmSearchInput");

    const filmDropdown =
        document.getElementById("filmDropdown");

    const selectedFilmEl =
        document.getElementById("selectedFilm");

    const selectedCoverEl =
        document.getElementById("selectedCover");

    const selectedTitleEl =
        document.getElementById("selectedTitle");

    const selectedMetaEl =
        document.getElementById("selectedMeta");

    const filmSearchWrap =
        document.getElementById("filmSearchWrap");

    filmSearchInput.value = "";

    filmDropdown.classList.remove("open");

    selectedCoverEl.textContent = "";

    selectedCoverEl.style.background = "";
    selectedCoverEl.style.backgroundImage = "";

    if (film.posterUrl) {

        selectedCoverEl.style.backgroundImage =
            `url('${film.posterUrl}')`;

        selectedCoverEl.style.backgroundSize =
            "cover";

        selectedCoverEl.style.backgroundPosition =
            "center";

    } else {

        selectedCoverEl.style.background =
            film.grad;

        selectedCoverEl.textContent =
            film.title;
    }

    selectedTitleEl.textContent =
        film.title;

    selectedMetaEl.textContent =
        film.type;

    document.getElementById(
        "selectedTags"
    ).innerHTML = film.tags.map(
        t => `

        <span
            class="tag ${tagClass(t)}"

            style="
                font-size:0.72rem;
                padding:2px 10px
            "
        >

            ${escapeHtml(t)}

        </span>
        `
    ).join("");

    filmSearchWrap.style.display = "none";

    selectedFilmEl.classList.add("show");

    checkPostReady();
}