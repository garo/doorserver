var doorserver = require('../doorserver');
var mysql = require('mysql');

var handle = null;

exports.fetchHandle = function(cb) {
  if (handle) {
    cb(null, handle);
    return;
  }

  handle = mysql.createClient(doorserver.settings.get("mysql"));
  handle.query("SELECT 1", function (err, response) {
    if (err) {
      console.error("Error on obtaining mysql connection", err);
      return;
    }

    cb(null, handle);
  });
};

