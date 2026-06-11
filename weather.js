navigator.geolocation.getCurrentPosition(success, error);

function success(position){

    if(loadCachedWeather()){
        return;
    }

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    fetchWeather(lat, lon);
}

function error(){

    document.getElementById("city-search").style.display = "block";

    showError("Location permission denied.");
}

async function fetchWeather(lat, lon) {
    
    document.getElementById("loading").style.display = "block";

    const url =
`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,rain&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=3&timezone=auto`;

    try {

        const response = await fetch(url);

        const data = await response.json();

        document.getElementById("loading").style.display = "none";

        data._fetchedAt = Date.now();

localStorage.setItem(
    "weather",
    JSON.stringify(data)
);

        

        updateUI(data);

        console.log(data);

    } catch(err) {
        showError(err.message);
    }
}

function renderForecast(data) {

    const forecast = document.getElementById("forecast");

    const cards = data.daily.time.map((date, index) => {

        return `
        <div class="card">
            <h3>${date}</h3>
            <p>⬆ High: ${data.daily.temperature_2m_max[index]}°C</p>
            <p>⬇ Low: ${data.daily.temperature_2m_min[index]}°C</p>
            <p>🌧 Rain: ${data.daily.precipitation_probability_max[index]}%</p>
        </div>
        `;
    }).join("");

    forecast.innerHTML = cards;
}

function showError(message){

    document.getElementById("loading").style.display = "none";

    document.getElementById("error").innerHTML = `
        <div class="error-card">
            ${message}
        </div>
    `;
}

function loadCachedWeather(){

    const cached = localStorage.getItem("weather");

    if(!cached) return false;

    const data = JSON.parse(cached);

    const age = Date.now() - data._fetchedAt;

if(age < 10 * 60 * 1000){

    document.getElementById("loading").style.display = "none";

    updateUI(data);

    return true;
}

    return false;
}

function updateUI(data){

    document.getElementById("temp").textContent =
        data.current.temperature_2m + " °C";

    document.getElementById("humidity").textContent =
        data.current.relative_humidity_2m + "%";

    document.getElementById("rain").textContent =
        data.current.rain + " mm";

    renderForecast(data);
}