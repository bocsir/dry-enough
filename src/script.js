document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("weather-results").style.display = "none";

  //ensure checkbox is unchecked after page refresh
  if(document.querySelector(".slider-checkbox").checked) {
    document.querySelector(".slider-checkbox").checked = false;
  }

  

});

//const socket = new WebSocket('wss://dry-enough.onrender.com');
const socket = new WebSocket('ws://localhost:5500');

//if there is already a location name in (user went back a page), call submitForm()
if(document.getElementById("location").value != "") {
  socket.addEventListener("open", () => {
    console.log('calling submit form');
    submitForm();
  });
}

let day = 0;

//object for temperature unit toggle
let temperatureData = [
  { day: '0', maxFahrenheit: null, minFahrenheit: null, maxCelsius: null, minCelsius: null },
  { day: '1', maxFahrenheit: null, minFahrenheit: null, maxCelsius: null, minCelsius: null },
  { day: '2', maxFahrenheit: null, minFahrenheit: null, maxCelsius: null, minCelsius: null },
  { day: '3', maxFahrenheit: null, minFahrenheit: null, maxCelsius: null, minCelsius: null },
  { day: '4', maxFahrenheit: null, minFahrenheit: null, maxCelsius: null, minCelsius: null },
  { day: '5', maxFahrenheit: null, minFahrenheit: null, maxCelsius: null, minCelsius: null },
  { day: '6', maxFahrenheit: null, minFahrenheit: null, maxCelsius: null, minCelsius: null },
  { day: '7', maxFahrenheit: null, minFahrenheit: null, maxCelsius: null, minCelsius: null },
  { day: '8', maxFahrenheit: null, minFahrenheit: null, maxCelsius: null, minCelsius: null },
  { day: '9', maxFahrenheit: null, minFahrenheit: null, maxCelsius: null, minCelsius: null },
  { day: '10', maxFahrenheit: null, minFahrenheit: null, maxCelsius: null, minCelsius: null }
];

let percipData = [
  { day: '0', percipInches: null , percipMM: null },
  { day: '1', percipInches: null , percipMM: null },
  { day: '2', percipInches: null , percipMM: null },
  { day: '3', percipInches: null , percipMM: null },
  { day: '4', percipInches: null , percipMM: null },
  { day: '5', percipInches: null , percipMM: null },
  { day: '6', percipInches: null , percipMM: null },
  { day: '7', percipInches: null , percipMM: null },
  { day: '8', percipInches: null , percipMM: null },
  { day: '9', percipInches: null , percipMM: null },
  { day: '10', percipInches: null , percipMM: null },  
]

function showLocation(locationObj) {
    //set results header to show location
    const resultsHeader = document.getElementById("results-header");

    const locationName = locationObj[0].name;
    const locationRegion = locationObj[0].state;
    const locationCountry = locationObj[0].country;

    let headerString = "Weather for ";
    if (locationName) {
        headerString += locationName;
    }
    if (locationRegion) {
        headerString += ", " + locationRegion;
    }
    if (locationCountry) {
        headerString += ", " + locationCountry;
    }
    headerString += ":";
    resultsHeader.innerHTML = headerString    
}

async function displayWeather(data, day) {
  if (day === 11) {
    //stop gradient spin
    //show weather grid
    document.getElementById("weather-grid").style.display = "grid";
    document.getElementById("weather-results").style.display = "flex";
    popLoader();
    return;
  }

  if (day === 3) {
    const currentTemp = document.getElementById("current-temp");
    currentTemp.innerHTML = data.current.temperature_2m;

    setCurrentWeatherStatus(data.current.weather_code);
  }

  const nextDay = day+1;
  const weatherItem = document.getElementById("day" + nextDay);

  //set weather icon emoji
  const weatherIcon = weatherItem.querySelector(".weather-icon");
  setWeatherIcon(data.daily.weather_code[day], weatherIcon);

  //set dates
  const weatherDate = weatherItem.querySelector(".date");
  const formattedDate = formatDate(data.daily.time[day], day);
  weatherDate.innerHTML = formattedDate;

  //set percipitation sum
  const weatherData = weatherItem.querySelector(".weather-data");
  const percipEl = weatherData.querySelector(".percip-data");
  const precipInches = data.daily.precipitation_sum[day];
  percipEl.innerHTML = " " + precipInches + " in.";

  percipData[day].percipInches = precipInches;
  percipData[day].percipMillimeters = (precipInches * 25.4).toFixed(1);

  //set max and min temps
  const maxTempF = weatherData.querySelector(".max-temp");
  const minTempF = weatherData.querySelector(".min-temp");

  const maxF = data.daily.temperature_2m_max[day];
  const minF = data.daily.temperature_2m_min[day];

  //display temp
  maxTempF.innerHTML = maxF;
  minTempF.innerHTML = minF;  

  //put values for max and min celsius and fahrenheit in temperatureData object
  temperatureData[day].maxFahrenheit = maxF;
  temperatureData[day].minFahrenheit = minF;
  temperatureData[day].maxCelsius = ((maxF - 32) / 1.8).toFixed(1);
  temperatureData[day].minCelsius = ((minF - 32) / 1.8).toFixed(1);

  //set card border color
  let percentage = data.daily.precipitation_probability_max[day];
  const percipPercent = weatherItem.querySelector(".percip-percent");

  if(day >= 3) {
    percipPercent.innerHTML = percentage + "%";
  } else {
    if(precipInches === 0) {
      percentage = 0;
    }

  }

  const hue = 240;
  const lightness = 100 - (percentage / 2);
  const saturation = 100;
  const color = 'hsla(' + hue + ', ' + saturation + '%, ' + lightness + '%, .8)';
  weatherItem.style.borderColor = color;
  weatherItem.style.backgroundColor = 'hsla(' + hue + ', ' + saturation + '%, ' + lightness + '%, .15)';

  //call to fill in next days info
  displayWeather(data, day + 1);
  return { error: false }
}

function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

async function popLoader() {
  for (let i = 1; i < 12; i++) {
      await wait(200);
      const el = document.getElementById("day" + i);
      el.style.display = "flex";

      let scale = .3;

        async function transitionFrame() {
          scale += .1;
          await wait(10);
          el.style.scale = scale;

          if (scale < 1) {
            transitionFrame();
          } else {
            await wait(10);

            el.style.scale = (scale-.1);

          }
        }

        transitionFrame()

  }
  formLoaded = true;
}

const weatherItems = document.getElementsByClassName('weather-item');
for (let i = 0; i < weatherItems.length; i++) {
  weatherItems[i].addEventListener('click', () => {
      localStorage.setItem('clickedDay', i);
      window.location.href = 'chart.html';
  });
}

//handle submit button press
async function submitForm() {
  //make sure nothing is already displayed
  document.getElementById("weather-results").style.display = "none";
  document.getElementById("weather-grid").style.display = "none";
  for (let i = 1; i < 12; i++) {
    const el = document.getElementById("day" + i);
    el.style.display = "none";
  }

  //start gradient loading animation
  formLoaded = false;
  gradientBorder();

  const currentTempUnit = document.getElementById("slider-text").innerHTML;

  if(document.querySelector(".slider-checkbox").checked) {
    document.querySelector(".slider-checkbox").checked = false;
    swapTempUnit();
  }

  //send location to server
  const location = document.getElementById('location').value.split(' ').join('+');
  socket.send(location);
}

const daysOfTheWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

//set weather icon based on API calls icon text
function setWeatherIcon(code, weatherIcon) {

  //☀️☁️🌨️⛅❄️⛈️🌫️
  //find the common emoji for the given weather name

  emojiMap = {
    "🌧️": [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82],
    "🌨️": [71, 73, 75, 77, 85, 86],
    "⛈️": [95, 96, 99],
    "🌫️": [45, 48],
    "☀️": [0],
    "⛅": [1, 2],
    "☁️": [3],
  }

  const emoji = Object.keys(emojiMap).find(key => emojiMap[key].includes(code));
  weatherIcon.innerHTML = emoji;
}

function setCurrentWeatherStatus(code) {

  weatherStrings = {
    "Raining": [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82],
    "Snowing": [71, 73, 75, 77, 85, 86],
    "Thunder storm": [95, 96, 99],
    "Foggy": [45, 48],
    "Sunny": [0],
    "Partly cloudy": [1, 2],
    "Cloudy": [3],
  }

  const weatherStatus = Object.keys(weatherStrings).find(key => weatherStrings[key].includes(code));
  const currentWeatherStatus = document.getElementById("current-weather");
  currentWeatherStatus.innerHTML = weatherStatus;
}

//change order of date, not using year value
function formatDate(date, day) {
  const currentDay = new Date().toLocaleString('en-us', {  weekday: 'long' })

  let currentDayIndex;
  for (let i = 6; i < 13; i++) {
    if (daysOfTheWeek[i] === currentDay) {
      currentDayIndex = i;
    }
  }

  const offset = day - 3;
  let dayNameStr = daysOfTheWeek[currentDayIndex + offset];
  dayNameStr = dayNameStr.slice(0,3);

  let undashedDate = date.slice(4).replace(/-/g, "");

  const dayOfMonth = undashedDate.slice(-2); //day
  const dateString = dayOfMonth + "<br>" + dayNameStr;
  return dateString;
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
      "deg,  rgba(0, 0, 161, 0.3) 30%,rgba(255, 255, 255, .6) 40%,rgba(89, 89, 255, 0.8) 60%)";
  }
}

function showError() {
  document.getElementById("results-header").innerHTML = "Error: location not found";
  document.getElementById("results-header").style.display = "block";
  document.getElementById("weather-results").style.display = "flex";
  document.getElementById("weather-grid").style.display = "none";
  formLoaded = true;
}

//websocket functions
socket.onerror = function (event) {
  console.log('Connection error:', event);
}

socket.onopen = function (event) {
  console.log('Connected to server');
}

socket.onclose = function (event) {
  console.log('Connection closed', event);
}

//handle weather data recieved from server
socket.onmessage = function (event) {

  const receivedMsg = event.data;
  if (receivedMsg.includes('location:')) {
    let locationStr = receivedMsg.slice(10);
    locationObj = JSON.parse(locationStr);
    showLocation(locationObj);
  } else {
    //display weather on successful response, ask user to reenter location on bad response
    if (receivedMsg === 'bad response') {
      showError();
    } else {
      localStorage.setItem('apiData', receivedMsg);
      //display weather using JSON data from fruitfull API call
      displayWeather(JSON.parse(receivedMsg), 0);
    }
  }
}

//event listener for temperature toggle switch
const checkboxElement = document.querySelector('.slider-checkbox');
checkboxElement.addEventListener('change', swapTempUnit);

function swapTempUnit() {
  const spanElement = document.getElementById('slider-text');

  //toggle unit shown in temp toggle switch and weather grid
  if (checkboxElement.checked) {
      spanElement.innerHTML = '°C';
      toggleTempUnit();
  } else {
      spanElement.innerHTML = '°F';
      toggleTempUnit('°F');
  }
}

//change temp unit used in weather-grid
function toggleTempUnit(u) {
  for (let i = 0; i < 11; i++) {
    const nextDay = i + 1;
    const weatherItem = document.getElementById("day" + nextDay);
    const weatherData = weatherItem.querySelector(".weather-data");
    const maxTemp = weatherData.querySelector(".max-temp");
    const minTemp = weatherData.querySelector(".min-temp");
    const percipAmount = weatherData.querySelector(".percip-data");
    if (u === '°F') {
      maxTemp.innerHTML = temperatureData[i].maxFahrenheit;
      minTemp.innerHTML = temperatureData[i].minFahrenheit;

      percipAmount.innerHTML = percipData[i].percipInches + " in";
    } else {
      maxTemp.innerHTML = temperatureData[i].maxCelsius;
      minTemp.innerHTML = temperatureData[i].minCelsius;
      
      percipAmount.innerHTML = percipData[i].percipMillimeters + " mm";
    }
  }

  const currentTempEl = document.getElementById("current-temp");
  let currentTemp = parseFloat(currentTempEl.innerHTML);

  if (u === '°F') {
    currentTempEl.innerHTML = ((currentTemp*1.8)+32).toFixed(1);
  } else {
    currentTempEl.innerHTML = ((currentTemp - 32) / 1.8).toFixed(1);
  }
}

