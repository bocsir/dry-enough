const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = 3000;

require('dotenv').config();
const apiKey = process.env.API_KEY;

app.length('/', (req, res) => {
    res.send('helloworld');
});

app.listen(port, () => {
    console.log('server is running at http://localhost:${port}');
});