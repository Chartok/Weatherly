// DOM element references
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search');
const currentWeatherSection = document.querySelector('#current-weather');
const forecastSection = document.querySelector('#forecast');
const historyContainer = document.querySelector('#history');

// Global variables
let searchHistory = [];
const rootApiURL = 'https://api.openweathermap.org';
const apiKey = '4726c8ca508f780a7e5235fec5a27627';

// Add day.js plugins
dayjs.extend(dayjs_plugin_utc);
dayjs.extend(dayjs_plugin_timezone);
dayjs.extend(dayjs_plugin_isBetween);

// Function to display the search history list.
function renderSearchHistory() {
    historyContainer.innerHTML = '';

    for (const search of searchHistory.reverse()) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.classList.add('history-btn', 'btn-history');
        btn.textContent = search;
        historyContainer.appendChild(btn);
    }
}

// Function to update history in local storage and update displayed history.
function updateSearchHistory(search) {
    if (searchHistory.includes(search)) {
        return;
    }

    searchHistory.push(search);
    localStorage.setItem('search-history', JSON.stringify(searchHistory));
    renderSearchHistory();
}

// Function to get search history from local storage.
function initSearchHistory() {
    const storedHistory = localStorage.getItem('search-history');
    searchHistory = storedHistory ? JSON.parse(storedHistory) : [];
    renderSearchHistory();
}

// Function to display the current weather data.
function renderCurrentWeather(data) {
    const { temp, humidity, rain } = data;

    const currentWeather = document.createElement('div');
    currentWeather.classList.add('weather-info');

    const tempEl = document.createElement('p');
    tempEl.textContent = `Temperature: ${temp}°F`;

    const humidityEl = document.createElement('p');
    humidityEl.textContent = `Humidity: ${humidity}%`;

    const rainEl = document.createElement('p');
    rainEl.textContent = `Rain Chance: ${rain}%`;

    currentWeather.appendChild(tempEl);
    currentWeather.appendChild(humidityEl);
    currentWeather.appendChild(rainEl);

    currentWeatherSection.innerHTML = '';
    currentWeatherSection.appendChild(currentWeather);
}

// Function to display a forecast card.
function renderForecastCard(forecast) {
    const { temp, humidity, rain } = forecast;

    const forecastCard = document.createElement('div');
    forecastCard.classList.add('forecast-card');

    const tempEl = document.createElement('p');
    tempEl.textContent = `Temperature: ${temp}°F`;

    const humidityEl = document.createElement('p');
    humidityEl.textContent = `Humidity: ${humidity}%`;

    const rainEl = document.createElement('p');
    rainEl.textContent = `Rain Chance: ${rain}%`;

    forecastCard.appendChild(tempEl);
    forecastCard.appendChild(humidityEl);
    forecastCard.appendChild(rainEl);

    forecastSection.appendChild(forecastCard);
}

// Function to display 5-day forecast.
function renderForecast(forecastData) {
    forecastSection.innerHTML = '';

    for (const forecast of forecastData) {
        renderForecastCard(forecast);
    }
}

// Fetches weather data from the API based on the given latitude and longitude.
async function fetchWeatherData(lat, lon) {
    try {
        const apiUrl = `${rootApiURL}/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${apiKey}`;
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Weather data not found');
        }
        const data = await response.json();

        const currentWeather = data.current;
        const dailyForecast = data.daily.slice(0, 5);

        const currentWeatherData = {
            temp: currentWeather.temp,
            humidity: currentWeather.humidity,
            rain: currentWeather.rain ? currentWeather.rain['1h'] : 0,
        };
        renderCurrentWeather(currentWeatherData);
        renderForecast(dailyForecast);
    } catch (err) {
        console.error(err);
    }
}

// Fetches weather data from the API based on the timestamp (UNIX time).
async function fetchWeatherDataByTimestamp(lat, lon, timestamp) {
    try {
        const apiUrl = `${rootApiURL}/data/3.0/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${timestamp}&appid=${apiKey}`;
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Weather data not found');
        }
        const data = await response.json();

        const currentWeather = data.current;

        const currentWeatherData = {
            temp: currentWeather.temp,
            humidity: currentWeather.humidity,
            rain: currentWeather.rain ? currentWeather.rain['1h'] : 0,
        };
        renderCurrentWeather(currentWeatherData);
    } catch (err) {
        console.error(err);
    }
}

// Event handler for form submission
async function handleSearchFormSubmit(e) {
    e.preventDefault();
    const search = searchInput.value.trim();
    if (search) {
        try {
            const apiUrl = `${rootApiURL}/geo/1.0/direct?q=${search}&limit=5&appid=${apiKey}`;
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Location not found');
            }
            const data = await response.json();
            if (!data[0]) {
                throw new Error('Location not found');
            }
            const { lat, lon } = data[0];

            updateSearchHistory(search);
            fetchWeatherData(lat, lon);
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
        searchInput.value = '';
    }
}

// Event handler for search history button click
function handleSearchHistoryClick(e) {
    if (e.target.matches('.btn-history')) {
        const search = e.target.textContent;
        fetchWeatherDataByTimestamp(0, 0, Math.round(new Date().getTime() / 1000));
        searchInput.value = search;
    }
}

// Initialize search history and event listeners
initSearchHistory();
searchForm.addEventListener('submit', handleSearchFormSubmit);
historyContainer.addEventListener('click', handleSearchHistoryClick);
