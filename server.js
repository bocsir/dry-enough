//load fetch module for calling API
const fetch = require('node-fetch'); 
const bodyParser = require('body-parser');

//get API key from .env
require('dotenv').config();
const apiKey = process.env.API_KEY;

//create instance of express app in app object
const express = require('express'); 
const app = express();

//extend express instance with websocket functions
const expressWs = require('express-ws');
expressWs(app);

//handle websocket connections
let socket;
app.ws('/', (ws) => {
    socket = ws;
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log('Received message:', message);
        //start making API calls
        callApi(message);
    })
});

//middleware
//serve static files
app.use(express.static('src'));
app.use(express.static('assets'));
//allow JSON data parsing
app.use(bodyParser.json());

//make API calls, send successful responses immediately to client
async function callApi(location) {
    //making calls for 9 days
    for (let i = 9; i > 0; i--) {
        let callType, unixTime;
        //user forecast if first three days
        if (i <= 3) {
            callType = "https://api.weatherapi.com/v1/forecast.json?key="
            //unix time in ms / 1000 = unix time in s. 86400 = 1 day in s
            unixTime = (Math.floor((Date.now() / 1000)) + (86400 * (4-i)));
        } else {
            callType = "https://api.weatherapi.com/v1/history.json?key="
            //unix time in ms / 1000 = unix time in s. 86400 = 1 day in s
            unixTime = (Math.floor(Date.now() / 1000) - (86400 * (i-4)));
        }

        //build URL
        const weatherApiUrl = callType + apiKey + "&q=" + location + "&unixdt=" + unixTime;

        //make API call
        try {
            const response = await fetch(weatherApiUrl)
            
            //send successful response to client with websocket
            if (!response.ok) {
                console.error("bad response: ", response);
            } else {
                const data = await response.json();
                //send the response
                socket.send(JSON.stringify(data));
            }
        } catch (error) {
            console.error("fetch error: ", error);
            return { error: true }
        }

    }
}

//start express server on port 5500
app.listen(5500, () => {
    console.log(`Server is listening on port ${5500}`);
});