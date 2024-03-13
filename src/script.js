document.addEventListener("DOMContentLoaded", function () {
  console.log('DOM loaded');
  document.getElementById("weather-results").style.display = "none";

  //ensure checkbox is unchecked after page refresh
  if(document.querySelector(".slider-checkbox").checked) {
    document.querySelector(".slider-checkbox").checked = false;
}
});


let formLoaded;
console.log('test log');
let day = 0;

let temperatureData = [
  { day: '1', maxFahrenheit: null, minFahrenheit: null, maxCelsius: null, minCelsius: null },
  { day: '2', maxFahrenheit: null, minFahrenheit: null, maxCelsius: null, minCelsius: null },
  { day: '3', maxFahrenheit: null, minFahrenheit: null, maxCelsius: null, minCelsius: null },
  { day: '4', maxFahrenheit: null, minFahrenheit: null, maxCelsius: null, minCelsius: null },
  { day: '5', maxFahrenheit: null, minFahrenheit: null, maxCelsius: null, minCelsius: null },
  { day: '6', maxFahrenheit: null, minFahrenheit: null, maxCelsius: null, minCelsius: null }
];

const socket = new WebSocket('ws://dry-enough.onrender.com:5500');
// const socket = new WebSocket('ws://localhost:5500');

async function displayWeather(data, day) {
  apiData = data;
  document.getElementById("weather-grid").style.display = "grid";

  //set results header
  const resultsHeader = document.getElementById("results-header");
  const locationName = data.location.name;
  const locationRegion = data.location.region;
  let locationCountry = data.location.country;
  if (locationCountry === 'United States of America') { locationCountry = 'USA'; }
  resultsHeader.innerHTML = "Past weather for " + locationName + ", " + locationRegion + ", " + locationCountry + ":";

  const weatherItem = document.getElementById("day" + day);

  //set weather icon
  const weatherIcon = weatherItem.querySelector(".weather-icon");
  const iconText = data.forecast.forecastday[0].day.condition.text;
  // console.log(iconText);
  setWeatherIcon(iconText, weatherIcon);

  //set dates
  const weatherDate = weatherItem.querySelector(".date");
  const formattedDate = formatDate(data.forecast.forecastday[0].date);
  weatherDate.innerHTML = formattedDate;

  const weatherData = weatherItem.querySelector(".weather-data");

  //set percipitation
  const precipInches = data.forecast.forecastday[0].day.totalprecip_in;
  const percipData = weatherData.querySelector(".percip-data");
  percipData.innerHTML = " " + precipInches + " in.";

  //set max temp
  const maxTempF = weatherData.querySelector(".max-temp");

  //set min temp
  const minTempF = weatherData.querySelector(".min-temp");

  //display temp
  maxTempF.innerHTML = data.forecast.forecastday[0].day.maxtemp_f;
  minTempF.innerHTML = data.forecast.forecastday[0].day.mintemp_f;
  // maxTempF.innerHTML = data.forecast.forecastday[0].day.maxtemp_c;
  // minTempF.innerHTML = data.forecast.forecastday[0].day.mintemp_c;
  

  //put values in temperatureData
  temperatureData[day-1].maxFahrenheit = data.forecast.forecastday[0].day.maxtemp_f;
  temperatureData[day-1].minFahrenheit = data.forecast.forecastday[0].day.mintemp_f;
  temperatureData[day-1].maxCelsius = data.forecast.forecastday[0].day.maxtemp_c;
  temperatureData[day-1].minCelsius = data.forecast.forecastday[0].day.mintemp_c;

  //show weather grid
  document.getElementById("weather-results").style.display = "flex";

  //stop gradient spin when form loaded
  if (day === 6) { formLoaded = true; }

  return { error: false }
}

//change temp unit used in weather-grid
function toggleTempUnit(u) {
  for (let i = 1; i <= 6; i++) {
    const weatherItem = document.getElementById("day" + i);
    const weatherData = weatherItem.querySelector(".weather-data");
    const maxTemp = weatherData.querySelector(".max-temp");
    const minTemp = weatherData.querySelector(".min-temp");

    if (u === '°F') {
      maxTemp.innerHTML = temperatureData[i-1].maxFahrenheit;
      minTemp.innerHTML = temperatureData[i-1].minFahrenheit;
    } else {
      maxTemp.innerHTML = temperatureData[i-1].maxCelsius;
      minTemp.innerHTML = temperatureData[i-1].minCelsius;
    }
  }
}

async function submitForm() {
  formLoaded = false;
  gradientBorder();

  const location = document.getElementById('location').value;
  const formData = { location: location };

  fetch('http://dry-enough.onrender.com:5500/submit', {
  //fetch('http://localhost:5500/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  })
    .then(response => response.json())
    .then(data => {
      console.log('Response from server:', data);
    })
    .catch(error => {
      console.error('Error sending data:', error);
    });
}

function setWeatherIcon(name, weatherIcon) {
  const weatherIcons = {
    '☀️': ["Sunny"],
    '☁️': ["Cloudy", "Overcast"],
    '🌨️': ["Moderate snow", "Patchy light snow", "Light snow", "Light snow showers"],
    '🌧️': ["Light rain shower", "Light rain", "Patchy rain possible", "Moderate rain at times", "Light drizzle", "Light freezing rain", "Moderate rain", "Light sleet showers"],
    '⛅': ["Partly cloudy"],
    '❄️': ["Moderate or heavy snow showers", "Heavy snow", "Blizzard"],
    '⛈️': ["Moderate or heavy rain with thunder", "Thundery outbreaks possible"],
    '🌫️': ["Fog", "Freezing fog", "Mist"]
  };

  //find the common emoji for the given weather name
  const emoji = Object.keys(weatherIcons).find(key => weatherIcons[key].includes(name)) || '';

  weatherIcon.innerHTML = emoji;
}

//change order of date, not using year value
function formatDate(date) {
  let newDate = date.slice(2).replace(/-/g, "");

  //day
  const lastTwo = newDate.slice(-2);
  //month
  const middle = newDate.slice(2, -2);

  newDate = middle + "<br>" + lastTwo;
  return newDate;
}

//spin linear gradient until form is loaded
async function gradientBorder() {
  let borderElement = document.getElementById("form-border");

  for (let i = 1; !formLoaded; i++) {
    await new Promise(resolve => setTimeout(resolve));

    const speedMultiplier = 5;
    let deg = 30 + i * speedMultiplier;

    borderElement.style.background =
      "linear-gradient(" +
      deg +
      "deg, rgb(107, 20, 110) 30%, rgba(255, 255, 0, 0.671) 50%, rgb(109, 0, 0) 70%)";
  }
}

function showError() {
  document.getElementById("results-header").innerHTML = "Error: check your input";
  document.getElementById("results-header").style.display = "block";
  document.getElementById("weather-results").style.display = "flex";
  document.getElementById("weather-grid").style.display = "none";
  formLoaded = true;
}

socket.onerror = function (event) {
  console.log('Connection error:', event);
}

socket.onopen = function (event) {
  console.log('Connected to server');
}

socket.onclose = function (event) {
  console.log('Connection closed', event);
}

const sendMessage = () => {
  socket.send('hello server');
}

socket.onmessage = function (event) {
  day++;
  if (day === 7) { day = 1; }

  const receivedMsg = event.data;
  // console.log('Received message:', receivedMsg);


  if (receivedMsg === 'bad response') {
    showError();
  } else {
    displayWeather(JSON.parse(receivedMsg), day);
  }
}

const spanElement = document.getElementById('slider-text');
const checkboxElement = document.querySelector('.slider-checkbox');

checkboxElement.addEventListener('change', () => {
    if (checkboxElement.checked) {
        spanElement.innerHTML = '°C';
        toggleTempUnit();
    } else {
        spanElement.innerHTML = '°F';
        toggleTempUnit('°F');
    }
})