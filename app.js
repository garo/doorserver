var connect = require('connect');
var express = require('express');

var app = express.createServer();

// Setup routes
app.get('/users', require('./controllers/users.get'));


app.listen(8);
