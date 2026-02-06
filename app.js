let allAsteroidData = [];

// Helper per formattare numeri grandi
function formatNumber(num) {
    return Math.round(num).toLocaleString("it-IT");
}

// Helper per formattare distanza in modo leggibile
function formatDistance(km) {
    if (km >= 1000000) {
        return (km / 1000000).toFixed(2) + " milioni di km";
    }
    return formatNumber(km) + " km";
}

async function fetchDay(date) {
    const response = fetch(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${date}&end_date=${date}&api_key=${apiKey}`);
    const timeOut = new Promise((_, reject) => setTimeout(() => reject("Timeout"), 5000));
    const result = await Promise.race([response, timeOut]);
    if(!result.ok) {
        throw new Error("Errore HTTP: " + result.status);
    }
    const data = await result.json();
    return data;
}

async function fetchWithRetry(date, maxRetries = 2) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const result = await fetchDay(date);
            return result;
        } catch(err) {
            if(i === maxRetries - 1) {
                throw err;
            }
        }
    }
}

function getDates() {
    let date = new Date();
    const datesArr = [];
    datesArr.push(date.toISOString().slice(0,10));
    for (let i = 1; i < 7; i++) {
        date.setDate(date.getDate() + 1);
        datesArr.push(date.toISOString().slice(0,10));
    }
    return datesArr;
}

async function loadAsteroids() {
    const dates = getDates();
    let completed = 0;
    const progressFill = document.getElementById("progress-fill");
    const progressText = document.getElementById("progress-text");
    const asteroidGrid = document.getElementById("asteroid-grid");

    // Mostra stato di caricamento
    asteroidGrid.innerHTML = '<p class="loading-message">Caricamento asteroidi in corso...</p>';

    function updateProgress() {
        completed++;
        progressFill.style.width = completed / 7 * 100 + "%";
        progressText.textContent = `${completed}/7 giorni caricati`;
    }

    const result = await Promise.allSettled(dates.map(async (date) => {
        try {
            const data = await fetchWithRetry(date);
            return data;
        } catch(err) {
            throw err;
        } finally {
            updateProgress();
        }
    }));
    const asteroids = parseAsteroid(result);
    allAsteroidData = asteroids;

    // Gestione errori: se nessun dato caricato
    if (asteroids.length === 0) {
        asteroidGrid.innerHTML = '<p class="error-message">Impossibile caricare i dati. Riprova più tardi.</p>';
        return;
    }

    renderCards(asteroids);
    updateSummary(asteroids);
}

loadAsteroids();

function parseAsteroid(results) {
    const resultsFulfilled = results.filter(result => result.status === "fulfilled");
    const allAsteroids = resultsFulfilled
        .map(result => Object.values(result.value.near_earth_objects))
        .flat(2);
    const parsed = allAsteroids.map(asteroid => {
        return {
            name: asteroid.name,
            diameterMin: asteroid.estimated_diameter.meters.estimated_diameter_min,
            diameterMax: asteroid.estimated_diameter.meters.estimated_diameter_max,
            velocity: Number(asteroid.close_approach_data[0].relative_velocity.kilometers_per_hour),
            distance: Number(asteroid.close_approach_data[0].miss_distance.kilometers),
            hazardous: asteroid.is_potentially_hazardous_asteroid
        }
    })
    return parsed;
}

function renderCards(asteroids) {
    const asteroidGrid = document.getElementById("asteroid-grid");

    // Feedback per filtri vuoti
    if (asteroids.length === 0) {
        asteroidGrid.innerHTML = '<p class="empty-message">Nessun asteroide trovato con questi criteri.</p>';
        return;
    }

    asteroidGrid.innerHTML = "";
    asteroids.forEach(asteroid => {
        asteroidGrid.innerHTML += `
            <div class="asteroid-card ${asteroid.hazardous ? "hazardous" : "safe"}">
                <h3 class="asteroid-name">${asteroid.name}</h3>
                <p class="asteroid-info">Dimensione: ${formatNumber(asteroid.diameterMin)} — ${formatNumber(asteroid.diameterMax)} m</p>
                <p class="asteroid-info">Velocità: ${formatNumber(asteroid.velocity)} km/h</p>
                <p class="asteroid-info">Distanza: ${formatDistance(asteroid.distance)}</p>
                <span class="asteroid-badge ${asteroid.hazardous ? "badge-hazardous" : "badge-safe"}">${asteroid.hazardous ? "Pericoloso" : "Sicuro"}</span>
            </div>
        `;
    })
}

function applyFilter(filterType) {
    if (filterType === "all") {
        renderCards(allAsteroidData);
    } else if (filterType === "hazardous") {
        renderCards(allAsteroidData.filter(asteroid => asteroid.hazardous === true));
    } else if (filterType === "distance") {
        renderCards([...allAsteroidData].sort((a, b) => a.distance - b.distance));
    } else if (filterType === "size") {
        renderCards([...allAsteroidData].sort((a, b) => b.diameterMax - a.diameterMax));
    }
}

const btns = document.querySelectorAll(".filter-btn");
btns.forEach(btn => btn.addEventListener("click", () => {
    btns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    applyFilter(btn.dataset.filter);
}))

function updateSummary(asteroids) {
    document.getElementById("total-count").textContent = asteroids.length;

    const hazardousCount = asteroids.filter(a => a.hazardous).length;
    document.getElementById("hazardous-count").textContent = hazardousCount;

    const largest = asteroids.reduce((max, a) => a.diameterMax > max.diameterMax ? a : max);
    document.getElementById("largest").textContent = `${largest.name} (${formatNumber(largest.diameterMax)} m)`;

    const closest = asteroids.reduce((min, a) => a.distance < min.distance ? a : min);
    document.getElementById("closest").textContent = `${closest.name} (${formatDistance(closest.distance)})`;
}
