// Code the Dream Advanced Pre-Work MVP: SWAPI.tech People <-> Films
const PEOPLE_URL = "https://swapi.tech/api/people";
const FILMS_URL = "https://swapi.tech/api/films";

const contentEl = document.getElementById("content");

// Simple cache so repeat clicks don't re-fetch the same URL
const cache = new Map();

function setMessage(type, text) {
  // type: "loading" | "error" | ""
  let msg = document.getElementById("message");
  if (!msg) {
    msg = document.createElement("div");
    msg.id = "message";
    document.body.insertBefore(msg, document.body.firstChild.nextSibling); // after h1 if present
  }
  msg.className = type ? type : "";
  msg.textContent = text || "";
}

async function fetchJson(url) {
  if (cache.has(url)) return cache.get(url);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const data = await res.json();

  cache.set(url, data);
  return data;
}

// Fetch a human-friendly label for linked resources (film title / person name)
async function fetchLinkLabel(url, type) {
  const data = await fetchJson(url);

  if (type === "film") {
    return data?.result?.properties?.title ?? "View Film";
  }
  if (type === "person") {
    return data?.result?.properties?.name ?? "View Character";
  }
  return "View";
}

function clearContent() {
  contentEl.innerHTML = "";
}

function renderTopNav() {
  // Creates nav once if not present
  let nav = document.querySelector("nav");
  if (!nav) {
    nav = document.createElement("nav");
    const h1 = document.querySelector("h1");
    if (h1) h1.insertAdjacentElement("afterend", nav);
    else document.body.insertBefore(nav, document.body.firstChild);
  }

  if (nav.dataset.ready === "true") return;

  const peopleBtn = document.createElement("button");
  peopleBtn.textContent = "People";
  peopleBtn.addEventListener("click", () => showPeopleList());

  const filmsBtn = document.createElement("button");
  filmsBtn.textContent = "Films";
  filmsBtn.addEventListener("click", () => showFilmsList());

  nav.appendChild(peopleBtn);
  nav.appendChild(filmsBtn);
  nav.dataset.ready = "true";
}

async function showPeopleList() {
  try {
    setMessage("loading", "Loading people...");
    clearContent();

    const data = await fetchJson(PEOPLE_URL);
    // SWAPI.tech shape: { results: [{ name, url }, ...] }
    const people = data.results || [];

    people.forEach((person) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `<h3>${person.name}</h3><p>Click for details</p>`;
      card.addEventListener("click", () => showPersonDetail(person.url));
      contentEl.appendChild(card);
    });

    setMessage("", "");
  } catch (err) {
    console.error(err);
    setMessage("error", "Could not load people. Please try again.");
  }
}

async function showFilmsList() {
  try {
    setMessage("loading", "Loading films...");
    clearContent();

    const data = await fetchJson(FILMS_URL);
    // The /films endpoint can return list items in "result" or "results" depending on API version.
    const films = data.result || data.results || [];

    films.forEach((filmItem) => {
      const title =
        filmItem.properties?.title ||
        filmItem.title ||
        filmItem.name ||
        `Film ${filmItem.uid ?? ""}`.trim();

      // Many list items include "url". If not, build it from uid.
      const url =
        filmItem.url ||
        (filmItem.uid ? `https://swapi.tech/api/films/${filmItem.uid}` : null);

      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `<h3>${title}</h3><p>Click for details</p>`;

      if (url) {
        card.addEventListener("click", () => showFilmDetail(url));
      } else {
        card.addEventListener("click", () => {
          setMessage("error", "Film detail URL missing from API response.");
        });
      }

      contentEl.appendChild(card);
    });

    setMessage("", "");
  } catch (err) {
    console.error(err);
    setMessage("error", "Could not load films. Please try again.");
  }
}

async function showPersonDetail(url) {
  try {
    setMessage("loading", "Loading person...");
    clearContent();

    const data = await fetchJson(url);
    const person = data?.result?.properties;

    if (!person) throw new Error("Unexpected person response shape.");

    const detail = document.createElement("div");
    detail.classList.add("detail");
    detail.innerHTML = `
      <h2>${person.name}</h2>
      <p><strong>Height (cm):</strong> ${person.height ?? "Unknown"}</p>
      <p><strong>Mass (kg):</strong> ${person.mass ?? "Unknown"}</p>
      <p><strong>Gender:</strong> ${person.gender ?? "Unknown"}</p>
      <div style="margin-top: 12px;">
        <button id="back-people">← Back to People</button>
      </div>
      <h3 style="margin-top: 16px;">Films</h3>
      <p>Click a film to load it (new GET request).</p>
      <div id="films-list" style="margin-top: 10px;"></div>
    `;

    contentEl.appendChild(detail);

    document
      .getElementById("back-people")
      .addEventListener("click", () => showPeopleList());

    // Preload a few film titles for better UX (limited so we don't over-fetch)
    await renderFilmLinks(person.films || []);

    setMessage("", "");
  } catch (err) {
    console.error(err);
    setMessage("error", "Could not load that person. Please try again.");
  }
}

async function renderFilmLinks(filmUrls) {
  const filmsList = document.getElementById("films-list");

  if (!filmUrls.length) {
    filmsList.innerHTML = "<p>No films found.</p>";
    return;
  }

  // Create buttons first
  const buttons = filmUrls.map((filmUrl) => {
    const btn = document.createElement("button");
    btn.textContent = "Loading...";
    btn.addEventListener("click", () => showFilmDetail(filmUrl));
    filmsList.appendChild(btn);
    return { btn, filmUrl };
  });

  // Preload titles for all displayed films
  await Promise.all(
    buttons.map(async ({ btn, filmUrl }) => {
      try {
        const title = await fetchLinkLabel(filmUrl, "film");
        btn.textContent = title;
      } catch {
        btn.textContent = "View Film";
      }
    })
  );
}

async function showFilmDetail(url) {
  try {
    setMessage("loading", "Loading film...");
    clearContent();

    const data = await fetchJson(url);
    const film = data?.result?.properties;

    if (!film) throw new Error("Unexpected film response shape.");

    const detail = document.createElement("div");
    detail.classList.add("detail");
    detail.innerHTML = `
      <h2>${film.title}</h2>
      <p><strong>Director:</strong> ${film.director ?? "Unknown"}</p>
      <p><strong>Producer:</strong> ${film.producer ?? "Unknown"}</p>
      <p><strong>Release Date:</strong> ${film.release_date ?? "Unknown"}</p>
      <div style="margin-top: 12px;">
        <button id="back-films">← Back to Films</button>
      </div>
      <h3 style="margin-top: 16px;">Characters</h3>
      <p>Click a character to load it (new GET request).</p>
      <div id="characters-list" style="margin-top: 10px;"></div>
    `;

    contentEl.appendChild(detail);

    document
      .getElementById("back-films")
      .addEventListener("click", () => showFilmsList());

    // Preload a few character names for better UX (limited so we don't over-fetch)
    await renderCharacterLinks(film.characters || []);

    setMessage("", "");
  } catch (err) {
    console.error(err);
    setMessage("error", "Could not load that film. Please try again.");
  }
}

async function renderCharacterLinks(characterUrls) {
  const list = document.getElementById("characters-list");

  if (!characterUrls.length) {
    list.innerHTML = "<p>No characters found.</p>";
    return;
  }

  const MAX_SHOW = 12;
  const limited = characterUrls.slice(0, MAX_SHOW);

  // Create buttons first
  const buttons = limited.map((characterUrl) => {
    const btn = document.createElement("button");
    btn.textContent = "Loading...";
    btn.addEventListener("click", () => showPersonDetail(characterUrl));
    list.appendChild(btn);
    return { btn, characterUrl };
  });

  // Preload names for all displayed characters
  await Promise.all(
    buttons.map(async ({ btn, characterUrl }) => {
      try {
        const name = await fetchLinkLabel(characterUrl, "person");
        btn.textContent = name;
      } catch {
        btn.textContent = "View Character";
      }
    })
  );

  if (characterUrls.length > MAX_SHOW) {
    const note = document.createElement("p");
    note.style.marginTop = "10px";
    note.style.color = "#ccc";
    note.textContent = `Showing first ${MAX_SHOW} of ${characterUrls.length} characters.`;
    list.appendChild(note);
  }
}

renderTopNav();
showPeopleList();
