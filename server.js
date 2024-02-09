require('dotenv').config();

const express = require('express');
const app = express();
const port = 3000;

const apiKey = process.env.API_KEY;