
var settings = {};

settings.mysql = {
  host : "localhost",
  user : "doorserver",
  password : "doorserver",
  database : "doorserver_test"
};

settings.inputdrivers = [
		{
				driver : "usbkeyboard",
        device : "/dev/input/by-path/platform-bcm2708_usb-usb-0:1.2:1.0-event-kbd",
        door_id : 1000
		}
];

exports.get = function(key) {
  return settings[key];
};
