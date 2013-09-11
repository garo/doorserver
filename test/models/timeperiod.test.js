
var assert = require('assert');
var timeperiod = require('../../lib/models/timeperiod');

describe('timeperiod', function() {

  describe("check_time_period", function() {
    it("knows that 2013-09-11T17:00:00 (Wed) is within 3,00:00-23:59", function() {
      var ts = new Date("2013-09-11T17:00:00+0300");
      assert.ok(timeperiod.check_time_period(ts, "3,00:00-23:59"));
    });

    it("knows that 2013-09-11T17:00:00 (Wed) is between 1-7,00:00-23:59", function() {
      var ts = new Date("2013-09-11T17:00:00+0300");
      assert.ok(timeperiod.check_time_period(ts, "1-7,00:00-23:59"));
    });

    it("knows that 2013-09-11T00:00:00 (Wed) is between 3,00:00-23:59", function() {
      var ts = new Date("2013-09-11T00:00:00+0300");
      assert.ok(timeperiod.check_time_period(ts, "3,00:00-23:59"));
    });

    it("knows that 2013-09-11T23:59:59 (Wed) is between 3,00:00-23:59", function() {
      var ts = new Date("2013-09-11T23:59:59+0300");
      assert.ok(timeperiod.check_time_period(ts, "3,00:00-23:59"));
    });

    it("knows that 2013-09-11T23:59:59 (Wed) is NOT between 3,00:00-23:58", function() {
      var ts = new Date("2013-09-11T23:59:59+0300");
      assert.equal(false, timeperiod.check_time_period(ts, "3,00:00-23:58"));
    });

    it("knows that 2013-09-09T00:00:00 (Mon) is between 1,00:00-23:58", function() {
      var ts = new Date("2013-09-09T00:00:00+0300");
      assert.ok(timeperiod.check_time_period(ts, "1,00:00-23:58"));
    });


  });
});

