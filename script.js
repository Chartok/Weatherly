const apiKey = 'b58ac1c39182100d7b0b59aaf0a9c6d2';
let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

const updateSearchHistory = () => {
    $("#searchHistory").empty();
    searchHistory.forEach(cityName => {
        $("#searchHistory").append(`<button class="btn btn-light history-btn">${cityName}</button><br/>`);
    });
};

$(document).ready(function () {
    // Populate search history on page load
    updateSearchHistory();

    // Event handler for form submission
    $("#searchForm").on("submit", async function (event) {
        event.preventDefault();
        let cityName = $("#cityInput").val();
        try {
            await getGeoCoordinates(cityName);
            if (!searchHistory.includes(cityName)) {
                searchHistory.push(cityName);
                localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
                updateSearchHistory();
            }
        } catch (error) {
            console.error(`Error occurred while fetching data for ${cityName}:`, error);
        }
    });

    // Event handler for history button clicks
    $("#searchHistory").on("click", ".history-btn", async function () {
        try {
            await getGeoCoordinates($(this).text());
        } catch (error) {
            console.error(`Error occurred while fetching data for ${$(this).text()}:`, error);
        }
    });
});

const getGeoCoordinates = async (cityName) => {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${apiKey}`;
    let response = await fetch(url);
    let data = await response.json();
    let lat = data[0].lat;
    let lon = data[0].lon;
    await getWeatherData(lat, lon);
    await getForecastData(lat, lon);
}

const getWeatherData = async (lat, lon) => {
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
    let response = await fetch(url);
    let data = await response.json();

    // Display current weather data
    let currentWeather = data.current;
    $("#currentWeather").html(`
    <h2>${new Date(currentWeather.dt * 1000).toLocaleDateString()}
        <img src="https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}.png" alt="Weather icon">
    </h2>
    <p>Temperature: ${currentWeather.temp}&#176;F</p>
    <p>Humidity: ${currentWeather.humidity}%</p>
    <p>Wind Speed: ${currentWeather.wind_speed} MPH</p>
`);
}

const getForecastData = async (lat, lon) => {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
    let response = await fetch(url);
    let data = await response.json();

    // Display 5-day forecast
    $("#forecastWeather").empty();
    for (let i = 0; i < data.list.length; i += 8) { // 5-day forecast, 3-hour data points
        let forecast = data.list[i];
        $("#forecastWeather").append(`
    <div class="card">
        <div class="card-body">
        <h5 class="card-title">${new Date(
            forecast.dt * 1000
        ).toLocaleDateString()}</h5>
        <h6 class="card-subtitle mb-2 text-muted">
            <img src="https://openweathermap.org/img/wn/${
            forecast.weather[0].icon
            }.png" alt="Weather icon">
        </h6>
        <p class="card-text">Temp: ${forecast.main.temp}&#176;F</p>
        <p class="card-text">Humidity: ${forecast.main.humidity}%</p>
        <p class="card-text">Wind Speed: ${forecast.wind.speed} MPH</p>
        </div>
    </div>
`);
    }
}
