var assert = require('assert');
var Timeperiod = require('../../lib/models/timeperiod');

describe('timeperiod', function () {

  describe("Model", function () {
    it("can create itself from data", function () {
      var data = {
        id:123,
        name:"Business hours"
      };

      var rules = [
        {
          id:1,
          rule:"3,00:00-23:59",
          exclude:0
        },
        {
          id:2,
          rule:"6-7,00:00-23:59",
          exclude:1
        }
      ];

      var tp = new Timeperiod(data, rules);

      assert.equal(tp.id, 123);
      assert.equal(tp.name, "Business hours");

      assert.equal(tp.include_rules[0].id, 1);
      assert.equal(tp.include_rules[0].rule, "3,00:00-23:59");
      assert.equal(tp.exclude_rules[0].id, 2);
      assert.equal(tp.exclude_rules[0].rule, "6-7,00:00-23:59");
    });

    it("knows if a rule is invalid", function() {
      var data = {
        id:123,
        name:"Business hours"
      };

      var rules = [
        {
          id:1,
          rule:",00:00-23:59",
          exclude:0
        }
      ];

      var tp = new Timeperiod(data, rules);

      assert.equal(tp.id, 123);
      assert.equal(tp.name, "Business hours");

      assert.equal(false, tp.valid);
      assert.equal(0, tp.include_rules.length);

    });

    describe("time validation against rules", function() {
      var data = {
        id:123,
        name:"Business hours"
      };

      var rules = [
        {
          id:1,
          rule:"1,00:00-23:59",
          exclude:0
        },
        {
          id:2,
          rule:"2,00:00-23:59",
          exclude:0
        },
        {
          id:3,
          rule:"4-7,00:00-23:59",
          exclude:0
        },
        {
          id:4,
          rule:"6,00:00-23:59",
          exclude:1
        },
        {
          id:5,
          rule:"24.12.",
          exclude:1
        }
      ];

      var tp = new Timeperiod(data, rules);

      it("knows that 2013-09-11T17:00:00 (Wed) is not ok", function() {
        var res = tp.evaluate(new Date("2013-09-11T17:00:00+0300"));
        assert.equal(false, res.valid);
      });

      it("knows that 2013-09-10T17:00:00 (Tue) is ok", function() {
        var res = tp.evaluate(new Date("2013-09-10T17:00:00+0300"));
        assert.equal(true, res.valid);
        assert.equal(2, res.because_of_rule.id);
      });

      it("knows that 2013-09-09T17:00:00 (Mon) is ok", function() {
        var res = tp.evaluate(new Date("2013-09-09T17:00:00+0300"));
        assert.equal(true, res.valid);
        assert.equal(1, res.because_of_rule.id);
      });

      it("knows that 2013-09-12T17:00:00 (Thu) is ok", function() {
        var res = tp.evaluate(new Date("2013-09-12T17:00:00+0300"));
        assert.equal(true, res.valid);
        assert.equal(3, res.because_of_rule.id);
      });

      it("knows that 2013-09-14T17:00:00 (Sat) is not ok", function() {
        var res = tp.evaluate(new Date("2013-09-14T17:00:00+0300"));
        assert.equal(false, res.valid);
        assert.equal(4, res.because_of_rule.id);
      });

      it("knows that 2013-12-24T17:00:00 (xmas eve) is not ok", function() {
        var res = tp.evaluate(new Date("2013-12-24T17:00:00+0300"));
        assert.equal(false, res.valid);
        assert.equal(5, res.because_of_rule.id);
      });


    });
  });

  describe("check_time_period", function () {
    it("knows that 2013-09-11T17:00:00 (Wed) is within 3,00:00-23:59", function () {
      var ts = new Date("2013-09-11T17:00:00+0300");
      assert.ok(Timeperiod.check_time_period(ts, "3,00:00-23:59"));
    });

    it("knows that 2013-09-11T17:00:00 (Wed) is between 1-7,00:00-23:59", function () {
      var ts = new Date("2013-09-11T17:00:00+0300");
      assert.ok(Timeperiod.check_time_period(ts, "1-7,00:00-23:59"));
    });

    it("knows that 2013-09-11T00:00:00 (Wed) is between 3,00:00-23:59", function () {
      var ts = new Date("2013-09-11T00:00:00+0300");
      assert.ok(Timeperiod.check_time_period(ts, "3,00:00-23:59"));
    });

    it("knows that 2013-09-11T23:59:59 (Wed) is between 3,00:00-23:59", function () {
      var ts = new Date("2013-09-11T23:59:59+0300");
      assert.ok(Timeperiod.check_time_period(ts, "3,00:00-23:59"));
    });

    it("knows that 2013-09-11T23:59:59 (Wed) is NOT between 3,00:00-23:58", function () {
      var ts = new Date("2013-09-11T23:59:59+0300");
      assert.equal(false, Timeperiod.check_time_period(ts, "3,00:00-23:58"));
    });

    it("knows that 2013-09-11T23:59:59 (Wed) is between 3,00:00-23:59", function () {
      var ts = new Date("2013-09-11T23:59:59+0300");
      assert.ok(Timeperiod.check_time_period(ts, "3,00:00-23:59"));
    });

    it("knows that 2013-09-09T00:00:00 (Mon) is between 1,00:00-23:58", function () {
      var ts = new Date("2013-09-09T00:00:00+0300");
      assert.ok(Timeperiod.check_time_period(ts, "1,00:00-23:58"));
    });

    it("knows that 2013-09-09T23:59:58 (Mon) is between 1,00:00-23:59", function () {
      var ts = new Date("2013-09-09T00:00:00+0300");
      assert.ok(Timeperiod.check_time_period(ts, "1,00:00-23:59"));
    });

    it("knows that 2013-09-11T00:00:00 (Wed) is NOT between 3,00:01-23:59", function () {
      var ts = new Date("2013-09-11T00:00:00+0300");
      assert.equal(false, Timeperiod.check_time_period(ts, "3,00:01-23:59"));
    });

    it("knows that 2013-09-15T00:00:00 (Sun) is NOT between 6,00:00-23:59", function () {
      var ts = new Date("2013-09-15T00:00:00+0300");
      assert.equal(false, Timeperiod.check_time_period(ts, "6,00:00-23:59"));
    });

    it("knows that 2013-09-09T00:00:00 (Mon) is NOT between 2-7,00:00-23:59", function () {
      var ts = new Date("2013-09-09T00:00:00+0300");
      assert.equal(false, Timeperiod.check_time_period(ts, "2-7,00:00-23:59"));
    });

    it("knows that 2013-12-24T00:00:00 (Mon) is between the days 24.12.-26.12.", function () {
      var ts = new Date("2013-12-24T00:00:00+0200");
      assert.equal(false, Timeperiod.check_time_period(ts, "24.12.-26.12."));
    });

    it("knows that 2013-12-26T23:59:59 (Mon) is the day 24.12.-26.12.", function () {
      var ts = new Date("2013-12-26T23:59:59+0200");
      assert.equal(false, Timeperiod.check_time_period(ts, "24.12.-26.12."));
    });

    it("knows that 2013-12-25T12:05:00 (Mon) is the day 24.12.-26.12.", function () {
      var ts = new Date("2013-12-25T12:05:00+0200");
      assert.equal(false, Timeperiod.check_time_period(ts, "24.12.-26.12."));
    });

    it("knows that 2013-12-24T00:00:00 (Mon) is the day 24.12.", function () {
      var ts = new Date("2013-12-24T00:00:00+0200");
      assert.equal(true, Timeperiod.check_time_period(ts, "24.12."));
    });

    it("knows that 2013-12-24T23:59:59 (Mon) is the day 24.12.", function () {
      var ts = new Date("2013-12-24T23:59:59+0200");
      assert.equal(true, Timeperiod.check_time_period(ts, "24.12."));
    });

    it("knows that 2013-12-24T12:05:00 (Mon) is the day 24.12.", function () {
      var ts = new Date("2013-12-24T12:05:00+0200");
      assert.equal(true, Timeperiod.check_time_period(ts, "24.12."));
    });


    it("knows that 2013-12-23T00:00:00 (Mon) is NOT the day 24.12.", function () {
      var ts = new Date("2013-12-23T00:00:00+0200");
      assert.equal(false, Timeperiod.check_time_period(ts, "24.12."));
    });

    it("knows that 2013-12-25T00:00:00 (Mon) is NOT the day 24.12.", function () {
      var ts = new Date("2013-12-25T00:00:00+0200");
      assert.equal(false, Timeperiod.check_time_period(ts, "24.12."));
    });

    it("knows that 2013-10-21T21:27:00 (Mon) is NOT between 1-5,09:55-21:05", function () {
      var ts = new Date("2013-10-21T21:27:00+0300");
      assert.equal(false, Timeperiod.check_time_period(ts, "1-5,09:55-21:05"));
    });

    it("knows that 2013-10-21T21:00:00 (Mon) is in between 1-5,09:55-21:05", function () {
      var ts = new Date("2013-10-21T21:00:00+0300");
      assert.ok(Timeperiod.check_time_period(ts, "1-5,09:55-21:05"));
    });

    it("knows that 2013-10-21T09:54:00 (Mon) is NOT between 1-5,09:55-21:05", function () {
      var ts = new Date("2013-10-21T09:54:00+0300");
      assert.equal(false, Timeperiod.check_time_period(ts, "1-5,09:55-21:05"));
    });

    it("knows that 2013-10-22T15:00:00 (Tue) is in between 1-5,09:55-21:05", function () {
      var ts = new Date("2013-10-22T15:00:00+0300");
      assert.ok(Timeperiod.check_time_period(ts, "1-5,09:55-21:05"));
    });

    it("knows that 2013-11-10T14:46:54.629Z (Sun) is in between 6-7,11:45-18:05", function () {
      var ts = new Date("2013-11-10T14:46:54.629Z");
      assert.ok(Timeperiod.check_time_period(ts, "6-7,11:45-18:05"));
    });

    it("knows that 2013-11-10T18:46:54.629Z (Sun) is NOT in between 6-7,11:45-18:05", function () {
      var ts = new Date("2013-11-10T18:46:54.629Z");
      assert.equal(false, Timeperiod.check_time_period(ts, "6-7,11:45-18:05"));
    });

    it("knows that 2013-11-10T18:06:00.629Z (Sun) is in between 6-7,11:45-18:05", function () {
      var ts = new Date("2013-11-10T18:06:54.629+0300");
      assert.ok(Timeperiod.check_time_period(ts, "6-7,11:45-18:05"));
    });


  });

  describe("is_rule_day_inclusive", function() {
    it("knows when rule is day inclusive and when it isn't", function() {
        assert.equal(false, Timeperiod.is_rule_day_inclusive("1,00:00-23:59"));
        assert.equal(false, Timeperiod.is_rule_day_inclusive("4-7,00:00-23:59"));
        assert.equal(false, Timeperiod.is_rule_day_inclusive("24.12."));
        assert.equal(false, Timeperiod.is_rule_day_inclusive("24.12.-25.12."));
        assert.ok(Timeperiod.is_rule_day_inclusive("6.1.2014,10:00-14:00"));
        assert.ok(Timeperiod.is_rule_day_inclusive("11.1.2014,10:00-14:00"));
        assert.ok(Timeperiod.is_rule_day_inclusive("6.10.2014,10:00-14:00"));
        assert.ok(Timeperiod.is_rule_day_inclusive("11.11.2014,10:00-14:00"));
      });
  });

  describe("evaluate", function() {
    describe("time validation against rules with special day inclusion", function() {

      var tz = getCurrentTimezone();
      tz = "Z";
      var data = {
        id:123,
        name:"Business hours"
      };

      var rules = [
        {
          id:1,
          rule:"1,00:00-23:59",
          exclude:0
        },
        {
          id:2,
          rule:"2,00:00-23:59",
          exclude:0
        },
        {
          id:3,
          rule:"4-7,00:00-23:59",
          exclude:0
        },
        {
          id:4,
          rule:"6,00:00-23:59",
          exclude:1
        },
        {
          id:5,
          rule:"24.12.",
          exclude:1
        },
        {
          id:6,
          rule:"6.1.2014,10:00-16:00",
          exclude:0
        }
      ];

      var tp = new Timeperiod(data, rules);

      it("knows that 2013-09-11T17:00:00 (Wed) is not ok", function() {
        var res = tp.evaluate(new Date("2013-09-11T17:00:00+0300"));
        assert.equal(false, res.valid);
      });

      it("knows that 2013-09-10T17:00:00 (Tue) is ok", function() {
        var res = tp.evaluate(new Date("2013-09-10T17:00:00+0300"));
        assert.equal(true, res.valid);
        assert.equal(2, res.because_of_rule.id);
      });

      it("knows that 2013-09-09T17:00:00 (Mon) is ok", function() {
        var res = tp.evaluate(new Date("2013-09-09T17:00:00+0300"));
        assert.equal(true, res.valid);
        assert.equal(1, res.because_of_rule.id);
      });

      it("knows that 2013-09-12T17:00:00 (Thu) is ok", function() {
        var res = tp.evaluate(new Date("2013-09-12T17:00:00+0300"));
        assert.equal(true, res.valid);
        assert.equal(3, res.because_of_rule.id);
      });

      it("knows that 2013-09-14T17:00:00 (Sat) is not ok", function() {
        var res = tp.evaluate(new Date("2013-09-14T17:00:00+0300"));
        assert.equal(false, res.valid);
        assert.equal(4, res.because_of_rule.id);
      });

      it("knows that 2013-12-24T17:00:00 (xmas eve) is not ok", function() {
        var res = tp.evaluate(new Date("2013-12-24T17:00:00+0200"));
        assert.equal(false, res.valid);
        assert.equal(5, res.because_of_rule.id);
      });


      it("knows that 2014-01-06T12:00:00 (Epiphany holiday / loppiainen) is ok", function() {
        var res = tp.evaluate(new Date("2014-01-06T12:00:00+0200"));
        assert.equal(true, res.valid);
        assert.equal(6, res.because_of_rule.id);
      });

      it("knows that 2014-01-06T10:00:00 (Epiphany holiday / loppiainen) is ok", function() {
        var res = tp.evaluate(new Date("2014-01-06T10:00:00+0200"));
        assert.equal(true, res.valid);
        assert.equal(6, res.because_of_rule.id);
      });

      it("knows that 2014-01-06T14:00:00 (Epiphany holiday / loppiainen) is ok", function() {
        var res = tp.evaluate(new Date("2014-01-06T14:00:00+0200"));
        assert.equal(true, res.valid);
        assert.equal(6, res.because_of_rule.id);
      });

      it("knows that 2014-01-06T09:59:00 (Epiphany holiday / loppiainen) is not matched by the high priority inclusion rule", function() {
        var res = tp.evaluate(new Date("2014-01-06T09:59:00+0200"));
        assert.ok(res.valid);
        assert.equal(1, res.because_of_rule.id);
      });

      it("knows that 2014-01-06T16:01:00 (Epiphany holiday / loppiainen) is not matched by the high priority inclusion rule", function() {
        var res = tp.evaluate(new Date("2014-01-06T16:01:00+0200"));
        assert.ok(res.valid);
        assert.equal(1, res.because_of_rule.id);
      });
    });

  });
});

