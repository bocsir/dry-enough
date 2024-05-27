document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("weather-results").style.display = "none";

  //ensure checkbox is unchecked after page refresh
  if (document.querySelector(".slider-checkbox").checked) {
    document.querySelector(".slider-checkbox").checked = false;
  }
});

const socket = new WebSocket('wss://dry-enough.onrender.com');
//const socket = new WebSocket("ws://localhost:5500");
let debounceTimeout;
let li;
const suggestionsListEl = document.getElementById('suggestions')
let first = true;
document.getElementById("location").addEventListener("input", async function (event) {

  if(document.getElementById('location').value === '' || suggestionsListEl.innerHTML !== '') {
    suggestionsListEl.style.display = 'none';
  }

  let pause = (first) ? 0 : 500;
  first = false
  clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      const location = 
      document.getElementById("location").value
      .replace(/,/g, '')
      .split(" ")
      .join("+");
      socket.send('search:' + location);  
    }, pause);  
});

let day = 0;

//object for temperature unit toggle
let temperatureData = [
  {
    day: "0",
    maxFahrenheit: null,
    minFahrenheit: null,
    maxCelsius: null,
    minCelsius: null,
  },
  {
    day: "1",
    maxFahrenheit: null,
    minFahrenheit: null,
    maxCelsius: null,
    minCelsius: null,
  },
  {
    day: "2",
    maxFahrenheit: null,
    minFahrenheit: null,
    maxCelsius: null,
    minCelsius: null,
  },
  {
    day: "3",
    maxFahrenheit: null,
    minFahrenheit: null,
    maxCelsius: null,
    minCelsius: null,
  },
  {
    day: "4",
    maxFahrenheit: null,
    minFahrenheit: null,
    maxCelsius: null,
    minCelsius: null,
  },
  {
    day: "5",
    maxFahrenheit: null,
    minFahrenheit: null,
    maxCelsius: null,
    minCelsius: null,
  },
  {
    day: "6",
    maxFahrenheit: null,
    minFahrenheit: null,
    maxCelsius: null,
    minCelsius: null,
  },
  {
    day: "7",
    maxFahrenheit: null,
    minFahrenheit: null,
    maxCelsius: null,
    minCelsius: null,
  },
  {
    day: "8",
    maxFahrenheit: null,
    minFahrenheit: null,
    maxCelsius: null,
    minCelsius: null,
  },
  {
    day: "9",
    maxFahrenheit: null,
    minFahrenheit: null,
    maxCelsius: null,
    minCelsius: null,
  },
  {
    day: "10",
    maxFahrenheit: null,
    minFahrenheit: null,
    maxCelsius: null,
    minCelsius: null,
  },
];

let percipData = [
  { day: "0", percipInches: null, percipMM: null },
  { day: "1", percipInches: null, percipMM: null },
  { day: "2", percipInches: null, percipMM: null },
  { day: "3", percipInches: null, percipMM: null },
  { day: "4", percipInches: null, percipMM: null },
  { day: "5", percipInches: null, percipMM: null },
  { day: "6", percipInches: null, percipMM: null },
  { day: "7", percipInches: null, percipMM: null },
  { day: "8", percipInches: null, percipMM: null },
  { day: "9", percipInches: null, percipMM: null },
  { day: "10", percipInches: null, percipMM: null },
];

function displayMapImg(url) {
  const img = document.getElementById("map");
  img.src = url;
}

function showLocation(locationObj) {
  //set results header to show location name
  const resultsHeader = document.getElementById("results-header");

  //get names
  const locationName = locationObj[0].name + ', ';
  const locationRegion = locationObj[0].state + ', ';
  const locationCountry = locationObj[0].country;

  //use names if theyre there
  let headerString = "Weather for ";
  headerString += (locationName) ? locationName : '';
  headerString += (locationRegion) ? locationRegion : '';
  headerString += (locationCountry) ? locationCountry : '';
  headerString += ':';

  resultsHeader.innerHTML = headerString;
}

async function displayWeather(data, day) {
  //pop load weather grid and exit function when all days loaded
  if (day === 11) {
    document.getElementById("weather-grid").style.display = "grid";
    document.getElementById("weather-results").style.display = "flex";
    popLoader();
    return;
  }

  //current day stuff
  if (day === 3) {
    const currentTemp = document.getElementById("current-temp");
    currentTemp.innerHTML = data.current.temperature_2m;
    setCurrentWeatherStatus(data.current.weather_code);
  }

  const currentDay = day + 1;
  const weatherItem = document.getElementById("day" + currentDay);

  //set weather icon emoji
  const weatherIcon = weatherItem.querySelector(".weather-icon");
  setWeatherIcon(data.daily.weather_code[day], weatherIcon);

  //set dates
  const weatherDate = weatherItem.querySelector(".date");
  const formattedDate = formatDate(data.daily.time[day], day);
  weatherDate.innerHTML = formattedDate;

  //set precipitation
  const weatherData = weatherItem.querySelector(".weather-data");
  const percipEl = weatherData.querySelector(".percip-data");
  const precipInches = data.daily.precipitation_sum[day];
  percipEl.innerHTML = " " + precipInches + " in.";

  //fill percip arrays for unit toggle
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

  //fill temp arrays for unit toggle
  temperatureData[day].maxFahrenheit = maxF;
  temperatureData[day].minFahrenheit = minF;
  temperatureData[day].maxCelsius = ((maxF - 32) / 1.8).toFixed(1);
  temperatureData[day].minCelsius = ((minF - 32) / 1.8).toFixed(1);

  //set card border color
  let percentage = data.daily.precipitation_probability_max[day];
  const percipPercent = weatherItem.querySelector(".percip-percent");

  //No need for chance on past days
  if (day >= 3) { percipPercent.innerHTML = percentage + "%"; } 

  //set card color between white and blue based on precip
  const hue = 240;
  const saturation = 100;
  const lightness = 100 - percentage / 2;
  const color =
    "hsla(" + hue + ", " + saturation + "%, " + lightness + "%, .8)";
  weatherItem.style.borderColor = color;
  weatherItem.style.backgroundColor =
    "hsla(" + hue + ", " + saturation + "%, " + lightness + "%, .25)";

  //call again for next day
  displayWeather(data, day + 1);
}

//hide / show suggestions list if user clicks in or out of location input
document.addEventListener('click', (e) => {
  const suggestions = document.getElementById("suggestions");
  suggestions.style.display = (e.target.id === 'location' && suggestions.innerHTML !== '') ? 'flex' : 'none';
});

function displaySunData(data) {
  //azimuth
  const sunRiseRad = data.riseAzimuth.azimuth;
  const sunSetRad = data.setAzimuth.azimuth;

  //rotation based on azimuth
  const riseEl = document.getElementById('sunrise-circle');
  riseEl.style.rotate = `${Number(sunRiseRad)}rad`;
  const setEl = document.getElementById('sunset-circle');
  setEl.style.rotate = `${Number(sunSetRad)}rad`;

  //rotate icons back
  const riseIconsEl = riseEl.querySelector('.sun-icons');
  riseIconsEl.style.rotate = `${-1*Number(sunRiseRad)}rad`
  const setIconsEl = setEl.querySelector('.sun-icons');
  setIconsEl.style.rotate = `${-1*Number(sunSetRad)}rad`;
}

function displaySuggestions(suggestionsArr) {
  //reset suggestions
  const suggestionsContainer = document.getElementById("suggestions");
  suggestionsContainer.innerHTML = "";

  //allow for <=5 suggestions
  let len = (suggestionsArr.length < 5) ? suggestionsArr.length : 5;

  for (let i = 0; i < len; i++) {
    //no input value
    if (document.getElementById('location').value === '') {
      suggestionsArr = [];
      suggestionsContainer.innerHTML = "";
      break;
    
    //no results found, show error
    } else if (typeof(suggestionsArr[i]) === "undefined") { 
      const suggestionElement = document.createElement("li");
      suggestionElement.classList.add("suggestion");
      suggestionElement.innerHTML = 'Location not found, check spelling';
      suggestionsContainer.appendChild(suggestionElement);
      suggestionsContainer.style.display = "flex"; 
      break;
    } 
    //create suggestion and append it to list
    const suggestion = suggestionsArr[i];
    const suggestionElement = document.createElement("li");
    suggestionElement.classList.add("suggestion");
    suggestionElement.innerHTML = suggestion.display_name;
    suggestionsContainer.appendChild(suggestionElement);     
    suggestionsContainer.style.display = "flex"; 
  }  
  addEventListeners();
}

//when suggestion clicked, use it as location and submit form
function addEventListeners() {
  document.querySelectorAll('.suggestion').forEach(el => {
    el.addEventListener('click', () => {
      document.getElementById("suggestions").style.display = 'none';
      document.getElementById("location").value = el.innerHTML;
      submitForm();
    });
  });
}

//adjustable pause time
function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

//use scale and wait() to pop load each card in succession
async function popLoader() {
  for (let i = 1; i < 12; i++) {
    document.getElementById("suggestions").style.display = 'none';
    const card = document.getElementById("day" + i);
    card.style.display = "flex";

    //scale from .3 to 1 every .01 second with .1 increments
    for (let i = .3; i < 1; i+=.1) {
      await wait(10);
      card.style.scale = i;
    }

    await wait(10);
    card.style.scale = 1;
  }
  formLoaded = true;
}

//handle submit button press
async function submitForm() {
  //make sure nothing is already displayed
  document.getElementById("weather-results").style.display = "none";
  document.getElementById("weather-grid").style.display = "none";
  document.getElementById("chart-map-desc-container").style.display = "none";
  document.getElementById('suggestions').style.display = 'none';

  //create directions link
  const directionsLink = document.getElementById("directions-link");
  directionsLink.href = 'https://www.google.com/maps/place/' + document.getElementById("location").value;

  //default hourly dropdown value
  const dropDownVal = document.querySelector('.chart-dropdown');
  dropDownVal.value = '1';

  //reset hourly chart
  if (myChart) {
    myChart.destroy();
    lastDataType = 'Temperature';
  }
  
  //reset day cards
  for (let i = 1; i < 12; i++) {
    const el = document.getElementById("day" + i);
    el.style.display = "none";
  }

  //start gradient loading animation
  formLoaded = false;
  gradientBorder();

  //reset temp unit
  if (document.querySelector(".slider-checkbox").checked) {
    document.querySelector(".slider-checkbox").checked = false;
    swapTempUnit();
  }

  //send location to server for geocoding
  const location = document
    .getElementById("location").value
    .replace(/,/g, '')
    .split(" ")
    .join("+");
  socket.send(location);
}

const daysOfTheWeek = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday",];

//set weather icon based on API calls icon text
function setWeatherIcon(code, weatherIcon) {
  //☀️☁️🌨️⛅❄️⛈️🌫️
  //find emoji based on weather code
  emojiMap = {
    "🌧️": [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82],
    "🌨️": [71, 73, 75, 77, 85, 86],
    "⛈️": [95, 96, 99],
    "🌫️": [45, 48],
    "☀️": [0],
    "⛅": [1, 2],
    "☁️": [3],
  };

  //magic
  const emoji = Object.keys(emojiMap).find((key) =>
    emojiMap[key].includes(code)
  );
  weatherIcon.innerHTML = emoji;
}

function setCurrentWeatherStatus(code) {
  weatherStrings = {
    Raining: [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82],
    Snowing: [71, 73, 75, 77, 85, 86],
    "Thunder storm": [95, 96, 99],
    Foggy: [45, 48],
    Sunny: [0],
    "Partly cloudy": [1, 2],
    Cloudy: [3],
  };

  const weatherStatus = Object.keys(weatherStrings).find((key) =>
    weatherStrings[key].includes(code)
  );

  const currentWeatherStatus = document.getElementById("current-weather");
  currentWeatherStatus.innerHTML = weatherStatus;
}

//change order of date, not using year value
function formatDate(date, day) {
  const currentDay = new Date().toLocaleString("en-us", { weekday: "long" });

  let currentDayIndex;
  for (let i = 6; i < 13; i++) {
    if (daysOfTheWeek[i] === currentDay) {
      currentDayIndex = i;
    }
  }
  const offset = day - 3;
  let dayNameStr = daysOfTheWeek[currentDayIndex + offset];
  dayNameStr = dayNameStr.slice(0, 3);
  let undashedDate = date.slice(4).replace(/-/g, "");
  const dayOfMonth = undashedDate.slice(-2); //day
  const dateString = dayOfMonth + "<br>" + dayNameStr;
  return dateString;
}


//spin linear gradient until form is loaded
async function gradientBorder() {
  let borderElement = document.getElementById("form-border");

  for (let i = 1; !formLoaded; i++) {
    await wait(10);

    const speedMultiplier = 5;
    let deg = 30 + i * speedMultiplier;

    borderElement.style.background =
      "linear-gradient(" + deg + "deg, rgb(217, 219, 221) 40%, rgb(91, 0, 227) 60%";
  }
  //when the form is loaded
  updateChart("Temperature", true);
  getDate(true);
}

function showError() {
  document.getElementById("results-header").innerHTML =
    "Error: location not found";
  document.getElementById("results-header").style.display = "block";
  document.getElementById("weather-results").style.display = "flex";
  document.getElementById("weather-grid").style.display = "none";
  document.getElementById("chart-map-desc-container").style.display = "none";
  formLoaded = true;
}

//websocket functions
socket.onerror = function (event) {
  console.log("Connection error:", event);
};

socket.onopen = function (event) {
  console.log("Connected to server");
};

socket.onclose = function (event) {
  console.log("Connection closed", event);
};

//handle weather data recieved from server
socket.onmessage = function (event) {
  const receivedMsg = event.data;
  if (receivedMsg.includes("location:")) {
    const locationStr = receivedMsg.slice(9);
    locationObj = JSON.parse(locationStr);
    showLocation(locationObj);
  } else if (receivedMsg.includes("img:")) {
    const imgUrl = receivedMsg.slice(4);
    displayMapImg(imgUrl);
  }else if(receivedMsg.includes("suggestions:")) {
    const suggestions = receivedMsg.slice(12);
    displaySuggestions(JSON.parse(suggestions));
  } else if(receivedMsg.includes("sun data:")) {
    const data = receivedMsg.substring("sun data:".length);
    displaySunData(JSON.parse(data));
  } else {
    //display weather on successful response, ask user to reenter location on bad response
    if (receivedMsg === "bad response") {
      document.getElementById("chart-map-desc-container").style.display = "none";
      showError();
    } else {
      localStorage.setItem("apiData", receivedMsg);
      //display weather using JSON data from fruitfull API call
      displayWeather(JSON.parse(receivedMsg), 0);
    }
  }
};

//event listener for temperature toggle switch
const checkboxElement = document.querySelector(".slider-checkbox");
checkboxElement.addEventListener("change", swapTempUnit);

function swapTempUnit() {
  updateChart();
  document.getElementById('suggestions').style.display = none;
  const spanElement = document.getElementById("slider-text");

  //toggle unit shown in temp toggle switch and weather grid
  if (checkboxElement.checked) {
    spanElement.innerHTML = "°C";
    toggleTempUnit();
  } else {
    spanElement.innerHTML = "°F";
    toggleTempUnit("°F");
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
    if (u === "°F") {
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

  if (u === "°F") {
    currentTempEl.innerHTML = (currentTemp * 1.8 + 32).toFixed(1);
  } else {
    currentTempEl.innerHTML = ((currentTemp - 32) / 1.8).toFixed(1);
  }
}

document.getElementById("logo").addEventListener("click", () => {
  window.location.href = "index.html";
});

const weatherItems = document.getElementsByClassName("weather-item");
for (let i = 0; i < weatherItems.length; i++) {
  weatherItems[i].addEventListener("click", () => {
    localStorage.setItem("clickedDay", i);
    updateChart();
    getDate(false);
  });
}

function chartsDescription(dayEl, clickedDay) {
  let dateString = dayEl.querySelector(".inline-span").querySelector(".date").innerHTML.replace("<br>", " ");
  let parts = dateString.split(" ");
  dateString = parts[1] + " " + parts[0];

  let descriptionStr =  "Data for " + dateString + ":"

  if(clickedDay === 4) {
    descriptionStr = "Data for today, " + dateString + ":"
  }

  document.getElementById("charts-description").innerHTML = descriptionStr;
}

//conversion functions
const fahrenheitToCelsius = (f) => {
  return ((f - 32) * 5 / 9).toFixed(1);
}

const inchesToMillimeters = (i) => {
  return (i * 25.4).toFixed(1);
}

let myChart;
let lastDataType = "Temperature";

function updateChart(dataType, showToday) {

  //if function is called from clicking a day, use last datatype
  if (!dataType) {
     dataType = lastDataType;
  } else {
    lastDataType = dataType;
  }

  //destroy chart if it exists so that a new one can replace it
  if(document.querySelector("#chart-map-desc-container").style.display === "flex") {
    myChart.destroy();
  }

  let clickedDay;
  if(showToday) {
    clickedDay = 3;
  } else {
    clickedDay = localStorage.getItem("clickedDay");
  }

  const dayEl = document.getElementById("day" + ++clickedDay);
  chartsDescription(dayEl, clickedDay);

  const dataMapping = {
    "Temperature": { jsonObjName: "temperature_2m", unit: "°F" },
    "Precipitation": { jsonObjName: "precipitation", unit: "in." },
    "Humidity": { jsonObjName: "relative_humidity_2m", unit: "%" },
    "Cloud Cover": { jsonObjName: "cloud_cover", unit: "%" },
    "Wind Speed": { jsonObjName: "wind_speed_10m", unit: "mph" },
    "Precipitation Chance": { jsonObjName: "precipitation_probability", unit: "%" }
  };
  
  // Provide a default value if dataType is not found
  const defaultType = { jsonObjName: "temperature_2m", unit: "°F" };

  if (typeof dataType === 'undefined') { dataType = "Temperature"; }
  
  let { jsonObjName, unit } = dataMapping[dataType] || defaultType;

  clickedDay--;
  const apiData = JSON.parse(localStorage.getItem("apiData"));

  let hourlyData = [];
  //get percip data for every other hour in the day based on jsonObjName from switch statement
  for (let i = 0; i < 24; i += 2) {
    let hourOfDay = i + clickedDay * 24;
    hourlyData.push(apiData.hourly[jsonObjName][hourOfDay]);
  }
  
  if(document.querySelector('.slider-checkbox').checked) {
    if(dataType === "Temperature") {
      hourlyData = hourlyData.map((val) => { return fahrenheitToCelsius(val); });
      unit = "°C";
    } else if(dataType === "Precipitation") {
      hourlyData = hourlyData.map((val) => { return inchesToMillimeters(val); });
      unit = "mm";
    }
  }

  const ctx = document.getElementById("myChart").getContext("2d");

  //create background gradient
  let gradient2 = ctx.createLinearGradient(0, 0, 0, 400);
  gradient2.addColorStop(1, "rgba(118,119,148, .4)");
  gradient2.addColorStop(0, "rgba(0, 0, 161, 0.3)");

  //x-axis (time)
  const labels = [
    "12 AM",
    "2 AM",
    "4 AM",
    "6 AM",
    "8 AM",
    "10 AM",
    "12 PM",
    "2 PM",
    "4 PM",
    "6 PM",
    "8 PM",
    "10 PM",
  ];

  const data = {
    labels: labels,
    datasets: [
      {
        data: hourlyData,
        borderWidth: 2,
        borderColor: "rgba(255, 255, 255, 0.8)",
        pointBackgroundColor: "rgba(255, 255, 255, 0.8S)",
        hoverRadius: 12,
        hitRadius: 30,
        fill: true,
        tension: 0.3,
        yAxisID: 'y',
      }
    ]
  };

  let delayed;
  const config = {
    type: "line",
    data: data,
    options: {
      layout: {
        padding: {
          top: 40,
        },
      },
      plugins: {
        title:  {
          display: false,
        },
        legend: {
          display: false,
        }
      },
      scales: {
        y: {
          grid: {
            color: 'rgba(200, 200, 200, 0.2)',
            lineWidth: 1,
          },
          beginAtZero: true,
          ticks: {
            color: 'white',
            callback: function (value) {
              return value + unit;
            },
          },
        },
        x: {
          grid: {
            color: 'rgba(200, 200, 200, 0.2)',
            lineWidth: 1,
          },
          ticks: {
            color: 'white',
          }
        }
      },
      responsive: true,
      animation: {
        onComplete: () => {
          delayed = true;
        },
        delay: (context) => {
          let delay = 0;
          if (
            context.type === "data" &&
            context.mode === "default" &&
            !delayed
          ) {
            delay = context.dataIndex * 100 + context.datasetIndex * 50;
          }
          return delay;
        },
      },
    },
  };
  
  //create chart
  myChart = new Chart(ctx, config);
  document.querySelector("#chart-map-desc-container").style.display = "flex";
}

document.getElementById("logo").addEventListener("click", () => {
  window.location.href = "index.html";
});

//Sunrise and set stuff
async function getDate(today) {

  //get current or clicked day from apidata
  const dayIndex = (today) ? 3 : localStorage.getItem('clickedDay');
  const data = JSON.parse(localStorage.getItem('apiData'));

  document.getElementById('rise-time').innerHTML = formatTime(data.daily.sunrise[dayIndex]);
  document.getElementById('set-time').innerHTML = formatTime(data.daily.sunset[dayIndex]);

  //make Date object
  const dateNum = data.daily.time[dayIndex];
  const dateObj = new Date(dateNum);

  //make a string to create future Date obj
  let dateStr = JSON.stringify(dateObj);
  dateStr = dateStr.slice(1);
  dateStr = dateStr.substring(0, dateStr.length-2);

  socket.send(`date:${dateStr}`);
}

function formatTime(timeString) {
  let [hourString, minute] = timeString.split(":");
  hourString = hourString.substring(11);

  //take off leading 0 if there is one
  let hour = +hourString < 10 ? (hourString.substring(1)) : hourString;
  hour = (+hour > 12) ? +hour - 12 : hour;
  //if divisible, return modulus, :, minute, ternary for AM / PM
  return hour + ":" + minute + (+hourString < 12 ? "AM" : "PM");
}
