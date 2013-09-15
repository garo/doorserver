#!/opt/node/bin/node

var doorserver = require('./lib/doorserver');

doorserver.start(function (err) {
  console.log("Doorserver started");
});