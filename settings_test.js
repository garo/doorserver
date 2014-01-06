var settings = {};

// This opens a cruel restful http api which contains a backdoor for opening any
// door with a simple http request. This is no means yet fully done and it's subject
// to heavy changes in the future.
settings.restful_backdoor = true;

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

/**
 * This feature maps all unknown users to some pre-defined user.
 * After this all normal user privilege features work, such as
 * this unknown user can belong to a group which allows him to open
 * a specific door.
*/
// settings.unknownuserid = 12345;

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
