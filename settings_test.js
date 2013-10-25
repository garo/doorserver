var settings = {};

settings.mysql = {
  data:{
    host:"localhost",
    user:"doorserver",
    password:"doorserver",
    database:"doorserver_test_data"
  },
  logs:{
    host:"localhost",
    user:"doorserver",
    password:"doorserver",
    database:"doorserver_test_logs"
  }
};


settings.inputdrivers = [
  {
    driver:"usbkeyboard",
    device:"/dev/input/by-path/platform-bcm2708_usb-usb-0:1.2:1.0-event-kbd",
    door_id:1000
  }
];


settings.doors = {
  "1000":{
    relay_pin:1,
    buzzer_pin:4,
    door_open_time:5000,
    buzzer_time:2000
  }
};

exports.get = function (key) {
  return settings[key];
};
