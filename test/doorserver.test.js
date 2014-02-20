var doorserver = require('../lib/doorserver');
var sinon = require('sinon');
var assert = require('assert');
var EventEmitter = require('events').EventEmitter;


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

      driver.prototype.on = function (cb) {};

      var usbkeyboard = sinon.stub(doorserver.drivers, 'usbkeyboard', driver);

      doorserver.startInputListenDrivers(function (err) {

        assert.ok(usbkeyboard.called);
        settings_get.restore();
        usbkeyboard.restore();
        done();
      });

    });

    it("hooks on 'token' event and passes it to tokenProcessor service", function (done) {
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
      driver.prototype = Object.create(EventEmitter.prototype, {
        constructor:{value:driver}
      });

      driver.prototype.start = function (cb) {
        console.log("start");
        started = true;
        cb();
      };

      var usbkeyboard = sinon.stub(doorserver.drivers, 'usbkeyboard', driver);
      var tokenProcessor = sinon.stub(doorserver.services.securityDoorTokenProcessor, 'onTokenRead', function (token, cb) {
        tokenProcessor.restore();
        cb();
        done();
      });

      doorserver.startInputListenDrivers(function (err) {
        console.log("drivers startd");
        assert.ok(started);
        assert.ok(usbkeyboard.called);
        settings_get.restore();
        usbkeyboard.restore();

        doorserver.startedDrivers[0].emit('token', {
          token : "foo",
          door_id : 1234
        });
      });

    });

  });

});

