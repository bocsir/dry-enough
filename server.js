//load modules:
//require searches for specefied module in node_modules or Node.js core module
const express = require('express'); //web framework for node with routing, middleware, ...
const app = express(); //create instance of express.js application
const fetch = require('node-fetch'); //node module for making http requests
const path = require('path'); //node module for file path stuff
const WebSocket = require('ws'); //web socket library for communication between client and server
const bodyParser = require('body-parser');

//CORS headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5500');
    res.header('Access-Control-Allow-Origin', 'http://localhost:5500/submit');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

//headless websocket server
const wss = new WebSocket.Server( {noServer: true} );
const connectedSockets = {};

//event listener for client connection to server
wss.on('connection', (socket) => {
    console.log('Client connected');

    const clientId =  Date.now().toString();
    connectedSockets[clientId] = socket;
    //send test object to client on connection
    // const testObj = {
    //     message : 'hello client',
    //     ok: true
    // };  
    // socket.send(JSON.stringify(testObj));

    socket.on('close', () => {
        console.log('Client disconnected');
        //remove the socket from the connectedSockets object when it's closed
        delete connectedSockets[clientId];
    });
});

wss.on('error', console.error);

app.use(express.static(path.join(__dirname, 'src')));
app.use(express.static(path.join(__dirname, 'assets')));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//get API key from .env
require('dotenv').config();
const apiKey = process.env.API_KEY;

app.post('/submit', async (req, res) => {

    console.log('form submitted');
    
    for (const clientId in connectedSockets) {
        const socket = connectedSockets[clientId];
        const location = req.body.location;
        // make API calls for last 6 days
        for (let i = 1; i <= 6; i++) {
            const weatherApiUrl =
            "http://api.weatherapi.com/v1/history.json?key=" +
            apiKey +
            "&q=" +
            location +
            "&unixdt=" +
            (Math.floor(Date.now() / 1000) - 86400 * i);
    
            //make calls to weather api each iteration
            try {
                const response = await fetch(weatherApiUrl)
                
                if (!response.ok) {
                    console.error("bad response: ", response);
                    socket.send('bad response');
                } else {
                    const data = await response.json();
                    //send the response to client
                    socket.send(JSON.stringify(data));
                }
    
            } catch (error) {
                console.error("fetch error: ", error);
                return { error: true }
            }

        }
    }
})

// Define a route to handle the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/index.html'));
});


const port = 5500;
//start express server
const server = app.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
});

//handle client request to upgrade to websocket
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, socket => {
      wss.emit('connection', socket, request);
    });
});
