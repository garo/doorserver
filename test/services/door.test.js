var assert = require('assert');
var sinon = require('sinon');
var doorserver = require('../../lib/doorserver');

describe('door service', function () {

  describe("openDoorForAMoment", function () {

    it("should open door according to settings", function (done) {
      var settings_get = sinon.stub(doorserver.settings, 'get', function (key) {
        switch (key) {
          case "doors":
            return {
              "1000":{
                relay_pin:1,
                buzzer_pin:4,
                door_open_time:200,
                buzzer_time:50
              }

            }
        }
      });

      var sequence = [];

      var settimeout = sinon.stub(global, 'setTimeout', function (cb, delay) {
        process.nextTick(function() {
          sequence.push(["delay", delay]);
          cb();
        });
      });

      var piface_on = sinon.stub(doorserver.drivers.piface, 'on', function (pin) {
        sequence.push(["on", pin]);
      });

      var piface_off = sinon.stub(doorserver.drivers.piface, 'off', function (pin) {
        sequence.push(["off", pin]);
      });

      var door_id = 1000;
      doorserver.services.door.openDoorForAMoment(door_id);

      setTimeout(function() {
        //console.log(sequence);

        // We'll build a sequence of events which took place according to
        // our two probes. Notice that the setTimeout callbacks are not executed
        // in the delay order. They are simply postponed until last tick.
        // Thus the sequential event order might change if a big refactor
        // is done.

        assert.deepEqual(sequence[0], ["on", 1]); // First turn relay pin on
        assert.deepEqual(sequence[1], ["on", 4]); // Then turn buzzer pin on
        assert.deepEqual(sequence[2], ["delay", 200]); // Schedule door close delay
        assert.deepEqual(sequence[3], ["off", 1]); // And close the door after delay
        assert.deepEqual(sequence[4], ["delay", 50]); // Schedule buzzer close delay
        assert.deepEqual(sequence[5], ["off", 4]); // And turn buzzer off

        settings_get.restore();
        piface_on.restore();
        piface_off.restore();
        settimeout.restore();
        done();

      }, 250);
    });

  });


});