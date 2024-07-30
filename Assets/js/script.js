// weather api key
const apikey = "9400c396d73455a906865867e6ec8a03";
const formEl = document.querySelector("form");
const cityHistory = JSON.parse(localStorage.getItem("cityHistory")) || [];

// function to handle form submit
function handleFormSubmit(event) {
    event.preventDefault();
    
    const city = document.querySelector('#search').value 
    if (!city) {
        alert("Please enter a city name");
        return;
    }
    handleFetchWeather(city)
    document.querySelector('#search').value = "";
}

// function to fetch weather data
function handleFetchWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apikey}&units=imperial`;
    fetch(url)
        .then(function (response) {
            if(response.status === 401) {
                alert("Api Key is invalid");
                return;
            }
            else if(response.status === 404) {
                alert("City not found");
                return;
            }
            else if(!response.ok) {
                alert("Something went wrong");
                return;
            } else {
                return response.json();
            }
        })
        .then(function (data) {
            console.log(data);
            saveCity(data.name);
            const {lat, lon} = data.coord;
            const onecallUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apikey}&units=imperial`;

            renderWeather(data);
            fetch(onecallUrl)
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    console.log(data);
                    renderForecast(data);
                });
        }).catch(function (error) {
            console.error(error);
        });
}

// function to render current weather
function renderWeather(data) {
    const { name, main, weather, wind } = data;
    const weatherEl = document.querySelector("#current-weather");
    const icon = `http://openweathermap.org/img/w/${weather[0].icon}.png`;
    const roundedTemp = Math.round(main.temp);

    weatherEl.innerHTML = `
        <h2>${name}</h2>
        <img src="${icon}" alt="${weather[0].description}">
        <p>Temperature: ${roundedTemp}°F</p>
        <p>Humidity: ${main.humidity}%</p>
        <p>Wind Speed: ${wind.speed} mph</p>
    `;
}

// function to render forecast
function renderForecast(data) {   
    const forecastEl = document.querySelector("#forecast");
    forecastEl.innerHTML = "";
    for (let i = 6; i < data.list.length; i+=8) {
        const { dt, weather, main } = data.list[i];
        const icon = `http://openweathermap.org/img/w/${weather[0].icon}.png`;
        const date = dayjs.unix(dt).format("MM/DD/YYYY");   
        const roundedTemp = Math.round(main.temp);
        const card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
            <h3>${date}</h3>
            <div class="card-body">
            <img src="${icon}" alt="${weather[0].description}">
            <p>Temperature: ${roundedTemp}°F</p>
            <p>Humidity: ${main.humidity}%</p>
            <p>Wind Speed: ${data.list[i].wind.speed} mph</p>
            </div>
        `;
        forecastEl.appendChild(card);
    }
}

// function to save history of cities in local storage
function saveCity(city) {
    if (cityHistory.includes(city)) {
        return;
    }
    cityHistory.push(city);
    localStorage.setItem("cityHistory", JSON.stringify(cityHistory));
    renderCityHistory();
}

// function to render city history
function renderCityHistory() {
    const historyEl = document.querySelector("#city-history");
    historyEl.innerHTML = "";
    cityHistory.forEach(function (city) {
        const btn = document.createElement("button");
        btn.textContent = city;
        btn.classList.add("btn", "btn-secondary", "btn-sm", "mb-2");
        btn.addEventListener("click", function () {
            handleFetchWeather(city);
        });
        historyEl.appendChild(btn);
    });
}   

renderCityHistory();

// Event listener for form submit
formEl.addEventListener("submit", handleFormSubmit);
