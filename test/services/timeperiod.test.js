var assert = require('assert');
var sinon = require('sinon');
var doorserver = require('../../lib/doorserver');

describe('timeperiod service', function () {
  describe("evaluateTimeperiod", function () {
    it("should open if timeperiod.evaluate returns valid : true", function (done) {

      var evaluated_called = false;
      var ts = new Date("2012-10-20");

      var findTimeperiodById = sinon.stub(doorserver.repositories.timeperiodRepository, "findTimeperiodById", function (timeperiod_id, cb) {
        assert.equal(10000, timeperiod_id);
        var TP = function() {

        };

        TP.prototype.evaluate = function (_ts) {
          assert.equal(ts, _ts);
          evaluated_called = true;
          return {
            valid : true,
            because_of_rule : {
              id : 12,
              rule : "da rule",
              exclude : 0
            }
          };
        };

        cb(null, new TP());
      });

      doorserver.services.timeperiod.evaluateTimeperiod(ts, 10000, function (err, allowedByPeriod, because_of_rule) {
        assert.ifError(err);
        assert.ok(evaluated_called);
        assert.equal(true, allowedByPeriod);
        assert.equal(12, because_of_rule.id);
        assert.equal("da rule", because_of_rule.rule);
        assert.equal(0, because_of_rule.exclude);
        assert.ok(findTimeperiodById.called);
        findTimeperiodById.restore();
        done();
      });

    });

    it("should not open if timeperiod.evaluate returns valid : false", function (done) {

      var evaluated_called = false;
      var ts = new Date("2012-10-20");

      var findTimeperiodById = sinon.stub(doorserver.repositories.timeperiodRepository, "findTimeperiodById", function (timeperiod_id, cb) {
        assert.equal(10000, timeperiod_id);
        var TP = function() {

        };

        TP.prototype.evaluate = function (_ts) {
          assert.equal(ts, _ts);
          evaluated_called = true;
          return {
            valid : false,
            because_of_rule : {
              id : 12,
              rule : "da rule",
              exclude : 0
            }
          };
        };

        cb(null, new TP());
      });

      doorserver.services.timeperiod.evaluateTimeperiod(ts, 10000, function (err, allowedByPeriod, because_of_rule) {
        assert.ifError(err);
        assert.ok(evaluated_called);
        assert.equal(false, allowedByPeriod);
        assert.equal(12, because_of_rule.id);
        assert.equal("da rule", because_of_rule.rule);
        assert.equal(0, because_of_rule.exclude);
        assert.ok(findTimeperiodById.called);
        findTimeperiodById.restore();
        done();
      });

    });

    it("should not open timeperiod was not found", function (done) {

      var ts = new Date("2012-10-20");

      var findTimeperiodById = sinon.stub(doorserver.repositories.timeperiodRepository, "findTimeperiodById", function (timeperiod_id, cb) {
        cb(null, null);
      });

      doorserver.services.timeperiod.evaluateTimeperiod(ts, 10000, function (err, allowedByPeriod, because_of_rule_id, because_of_rule) {
        assert.ifError(err);
        assert.equal(false, allowedByPeriod);
        assert.ok(findTimeperiodById.called);
        findTimeperiodById.restore();
        done();
      });

    });

  });
});