//load fetch module for calling API
const fetch = require('node-fetch'); 
const bodyParser = require('body-parser');
const sunCalc = require('suncalc');
const tzlookup = require("@photostructure/tz-lookup");

//get API key from .env
require('dotenv').config();
const reverseGeoKey = process.env.REVERSE_GEO_KEY;
const forwardGeoKey = process.env.FORWARD_GEO_KEY;

//create instance of express app in app object
const express = require('express'); 
const app = express();

//extend express instance with websocket functions
const expressWs = require('express-ws');
expressWs(app);

//handle websocket connections
let sockets = [];
//let socket;
app.ws('/', (ws) => {
    //socket = ws;
    sockets.push(ws);
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
        if(message.includes("search:")) {
            msg = message.slice(7);
            getSearchSuggestions(msg, ws);
        }else if (message.includes('date:')){
            message = message.slice(5);
            getSunData(message, ws);
        } else {
            //start geo and weather API calls
            callApi(message, ws);
        }
    });

    ws.on('close', () => {
        const index = sockets.indexOf(ws);
        if(index > -1) {
            sockets.splice(index, 1);
            console.log('Client disconnected');
        }
    });
});

//middleware
//serve static files
app.use(express.static('src'));
app.use(express.static('assets'));
//allow JSON data parsing
app.use(bodyParser.json());

async function getSearchSuggestions(location,  ws) {
    try {
        const loc = location.split("+").join("%20");
        const coordsResponse = await fetch("https://us1.locationiq.com/v1/search?key=" + forwardGeoKey + "&q=" + loc + "&format=json&");
        const coordsData = await coordsResponse.json();
    
        ws.send('suggestions:' + JSON.stringify(coordsData));
    } catch(error) {
        console.error("error: ", error);
        ws.send("bad response");
        return { error: true }
    }
}

function getSunData(dateStr, ws) {
    const dateObj = new Date(dateStr);
    const times = sunCalc.getTimes(dateObj, lat, lon);
    const sunRiseAzimuth = sunCalc.getPosition(times.sunrise, lat, lon);
    const sunSetAzimuth = sunCalc.getPosition(times.sunset, lat, lon);

    const sunData = {
        riseAzimuth: sunRiseAzimuth,
        setAzimuth: sunSetAzimuth,
    };
    
    ws.send('sun data:' + JSON.stringify(sunData))
}


//make API calls, send successful responses immediately to client
async function callApi(location, ws) {

        //get lat and lon from location with API call and build URL
        let weatherApiUrl;
        try {
            //get lat and lon from geocoding API
            const loc = location.split("+").join("%20");
            const coordsResponse = await fetch("https://us1.locationiq.com/v1/search?key=" + forwardGeoKey + "&q=" + loc + "&format=json&");
            const coordsData = await coordsResponse.json();
            lat = coordsData[0].lat;
            lon = coordsData[0].lon;

            const mapUrl = 'https://maps.locationiq.com/v3/staticmap?key=' + forwardGeoKey + '&center=' + lat + ',' + lon + '&zoom='+'10' +'&size=550x325&format=png&maptype=street';
            const mapData = await fetch(mapUrl);
            // const coordsResponse = await fetch("https://geocoding-api.open-meteo.com/v1/search?name=" + location);
            // const coordsData = await coordsResponse.json();
            //get nice readable loaction name from openweather API
            const reverseGeoUrl = "http://api.openweathermap.org/geo/1.0/reverse?lat=" + lat + "&lon=" + lon + "&limit=1&appid=" + reverseGeoKey;
            const locationResponse = await fetch(reverseGeoUrl);

            if(!locationResponse.ok) {
                console.error("bad response: ", locationResponse);
            } else {
                const locationData = await locationResponse.json();
                ws.send("location:" + JSON.stringify(locationData));
            }

            if(!mapData.ok) {
                console.error("bad response: ", mapData);
            } else {
                ws.send('img:' + mapData.url);
            }
            const tz = tzlookup(lat, lon);
            weatherApiUrl = "https://api.open-meteo.com/v1/forecast?latitude=" + lat + 
                "&longitude=" + lon + 
                "&current=temperature_2m,relative_humidity_2m,is_day,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m&hourly=precipitation_probability,temperature_2m,relative_humidity_2m,precipitation,cloud_cover,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,precipitation_probability_max,sunset,precipitation_sum&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&past_days=3&forecast_days=8" +
                "&timezone=" + tz;
        } catch(error) {
            console.error("error: ", error);
            ws.send("bad response");
            return { error: true }
        }

        //weather API call
        try {
            const response = await fetch(weatherApiUrl)
            
            //send successful response to client with websocket
            if (!response.ok) {
                console.error("bad response: ", response);
            } else {
                const data = await response.json();
                //send the response
                ws.send(JSON.stringify(data));
            }
        } catch (error) {
            console.error("fetch error: ", error);
            return { error: true }
        }

    // }
}

//start express server on port 5500
app.listen(5500, () => {
    console.log(`Server is listening on port ${5500}`);
});
