var doorserver = require('../lib/doorserver');
var sinon = require('sinon');
var assert = require('assert');


describe("doorserver", function() {

  describe("startInputListenDrivers", function() {
    it("reads list of driver properties from settings", function (done) {
      var settings_get = sinon.stub(doorserver.settings, 'get', function(key) {
        switch (key) {
          case "inputdrivers":
            return [
              {
                driver : "usbkeyboard",
                device : "/dev/input/by-path/platform-bcm2708_usb-usb-0:1.2:1.0-event-kbd",
                door_id : 1000
              }
            ];
        }
      });
      var started = false;
      console.log("drivers", doorserver.drivers);
      var driver = function() {
        console.log("test driver created");
      };
      driver.prototype.start = function (cb) {
        started = true;
        cb();
      };

      var usbkeyboard = sinon.stub(doorserver.drivers, 'usbkeyboard', driver);

      doorserver.startInputListenDrivers(function (err) {

        assert.ok(usbkeyboard.called);
        settings_get.restore();
        usbkeyboard.restore();
        done();
      });

    });
  });

});

