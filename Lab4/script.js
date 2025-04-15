const apiKey = '';
const weatherButton = document.getElementById('weatherButton');
const addressInput = document.getElementById('addressInput');
const weatherResult = document.getElementById('weatherResult');

weatherButton.addEventListener('click', () => {
    const location = addressInput.value.trim();
    if (!location) {
        weatherResult.innerHTML = '<p>Proszę wpisać lokalizację.</p>';
        return;
    }

    // Wywołanie API bieżącej pogody
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric&lang=pl`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric&lang=pl`;

    // XMLHttpRequest dla bieżącej pogody
    const xhr = new XMLHttpRequest();
    xhr.open('GET', currentWeatherUrl, true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            const currentWeather = JSON.parse(xhr.responseText);
            console.log("Odpowiedz z Current Weather API:", currentWeather);
            displayCurrentWeather(currentWeather);
        } else {
            console.log("Błąd:", xhr.status, xhr.statusText);
            weatherResult.innerHTML = '<p>Nie udało się pobrać bieżącej pogody.</p>';
        }
    };
    xhr.send();

    // Fetch API dla prognozy 5-dniowej
    fetch(forecastUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Nie udało się pobrać prognozy.');
            }
            return response.json();
        })
        .then(forecastData => {
            console.log('Odpowiedź API forecast:', forecastData);
            displayForecast(forecastData);
        })
        .catch(error => {
            console.error('Błąd podczas pobierania prognozy:', error);
            weatherResult.innerHTML += '<p>Nie udało się pobrać prognozy 5-dniowej.</p>';
        });
});

function displayCurrentWeather(weather) {
    const { name, main, weather: weatherDetails } = weather;
    const description = weatherDetails[0].description;
    const temperature = main.temp;

    const html = `
        <h2>Bieżąca pogoda w ${name}</h2>
        <p>${description}, temperatura: ${temperature}°C</p>
    `;
    weatherResult.innerHTML = html;
}

function displayForecast(forecast) {
    const { list } = forecast;
    let html = '<h2>Prognoza na 5 dni</h2>';
    list.forEach((item, index) => {
        if (index % 8 === 0) { // co 8 wpisów (raz dziennie)
            const date = new Date(item.dt * 1000).toLocaleDateString('pl-PL', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
            });
            const description = item.weather[0].description;
            const temperature = item.main.temp;
            html += `
                <div class="forecast-item">
                    <p><strong>${date}</strong>: ${description}, temperatura: ${temperature}°C</p>
                </div>
            `;
        }
    });
    weatherResult.innerHTML += html;
}
