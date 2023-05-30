const apiKey = '8cf08a86c18fdf323a1881ae3a48adae';

const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const searchHistory = document.getElementById('search-history');
const currentWeather = document.getElementById('current-weather');
const forecast = document.getElementById('forecast');

searchBtn.addEventListener('click', () => {
    const city = cityInput.value;
    fetchGeoCoordinates(city)
        .then(coords => fetchWeatherData(coords.lat, coords.lon))
        .then(data => updateWeatherDisplay(data))
        .catch(err => console.log(err));
});

function fetchGeoCoordinates(city) {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${apiKey}`;
    return fetch(url)
        .then(response => response.json())
        .then(data => data[0])
        .catch(err => console.log(err));
}

function fetchWeatherData(lat, lon) {
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=${apiKey}`;
    return fetch(url)
        .then(response => response.json())
        .catch(err => console.log(err));
}

function updateWeatherDisplay(data) {
    const { current, daily } = data;
    const { temp, humidity, wind_speed, uvi } = current;
    const dt = new Date(daily[0].dt * 1000);
    const day = dt.getDate();
    const month = dt.getMonth() + 1;
    const year = dt.getFullYear();
    const icon = current.weather[0].icon;
    const description = current.weather[0].description;
    const max = daily[0].temp.max;
    const min = daily[0].temp.min;

    currentWeather.innerHTML = `
        <h2>${day}/${month}/${year}</h2>
        <h2>${description}</h2>
        <img src="http://openweathermap.org/img/wn/${icon}.png" alt="${description}">
        <h2>Temp: ${temp}°C</h2>
        <h2>Humidity: ${humidity}%</h2>
        <h2>Wind Speed: ${wind_speed}m/s</h2>
        <h2>UV Index: ${uvi}</h2>
    `;
    forecast.innerHTML = `
        <h2>Forecast</h2>
        <h3>Max: ${max}°C</h3>
        <h3>Min: ${min}°C</h3>
    `;
}
