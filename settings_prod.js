var settings = {};

settings.mysql = {
  data:{
    host:"localhost",
    user:"doorserver",
    password:"doorserver",
    database:"doorserver_data"
  },
  logs:{
    host:"localhost",
    user:"doorserver",
    password:"doorserver",
    database:"doorserver_logs"
  }
};

settings.inputdrivers = [
  {
    driver:"usbkeyboard",
    device:"/dev/input/by-path/platform-bcm2708_usb-usb-0:1.2:1.0-event-kbd",
    door_id:1
  }
];

settings.doors = {
  "1":{
    relay_pin:1,
    buzzer_pin:4,
    door_open_time:2000,
    buzzer_time:2000
  }
};

exports.get = function (key) {
  return settings[key];
};
