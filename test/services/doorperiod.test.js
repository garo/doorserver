var assert = require('assert');
var sinon = require('sinon');
var doorserver = require('../../lib/doorserver');

describe('doorperiod service', function () {

  describe("checkAllDoors", function () {
    it("will check each door", function (done) {
      var settings_get = sinon.stub(doorserver.settings, 'get', function (key) {
        switch (key) {
          case "doors":
            return {
              "1000":{

              },
              "1001":{

              }
            }
        }
      });

      var sequence = [];

      var shouldDoorBeOpen = sinon.stub(doorserver.services.doorperiod, "shouldDoorBeOpen", function (ts, door_id, cb) {
        sequence.push([ts, door_id]);
        cb();
      });

      var ts = new Date();
      doorserver.services.doorperiod.checkAllDoors(ts, function (err) {
        assert.ifError(err);

        // The iteration pattern starts from end, so first call should be to last entry in settings
        assert.equal(ts, sequence[0][0]);
        assert.equal(1001, sequence[0][1]);
        assert.equal(ts, sequence[1][0]);
        assert.equal(1000, sequence[1][1]);
        shouldDoorBeOpen.restore();
        settings_get.restore();
        done();
      });
    });
  });

  describe("checkSingleDoor", function() {
    it("should call shouldDoorBeOpen", function (done) {
      var ts = new Date();

      var shouldDoorBeOpen = sinon.stub(doorserver.services.doorperiod, "shouldDoorBeOpen", function (_ts, door_id, cb) {
        assert.equal(1000, door_id);
        assert.equal(ts, _ts);
        cb(null, true, { id : 1, role : "da role", exclude : 0});
      });

      doorserver.services.doorperiod.checkSingleDoor(ts, 1000, function (err, shouldBeOpen, because_of_rule) {

        assert.ok(shouldDoorBeOpen.called);
        shouldDoorBeOpen.restore();
        done();
      });
    });

    it("should open door if shouldDoorBeOpen said yes", function (done) {
      var ts = new Date();

      var shouldDoorBeOpen = sinon.stub(doorserver.services.doorperiod, "shouldDoorBeOpen", function (_ts, door_id, cb) {
        cb(null, true, { id : 1, role : "da role", exclude : 0});
      });

      var openDoor = sinon.stub(doorserver.services.door, "openDoor", function (door_id, cb) {
        assert.equal(1000, door_id);
        cb();
      });

      var closeDoor = sinon.stub(doorserver.services.door, "closeDoor", function (door_id, cb) {
        assert.fail("closeDoor should not be called");
        cb();
      });

      doorserver.services.doorperiod.checkSingleDoor(ts, 1000, function (err, shouldBeOpen, because_of_rule) {
        assert.ok(shouldDoorBeOpen.called);
        assert.ok(openDoor.called);
        assert.equal(false, closeDoor.called);
        shouldDoorBeOpen.restore();
        openDoor.restore();
        closeDoor.restore();
        done();
      });
    });

    it("should close door if shouldDoorBeOpen said no", function (done) {
      var ts = new Date();

      var shouldDoorBeOpen = sinon.stub(doorserver.services.doorperiod, "shouldDoorBeOpen", function (_ts, door_id, cb) {
        cb(null, false, { id : 1, role : "da role", exclude : 0});
      });

      var openDoor = sinon.stub(doorserver.services.door, "openDoor", function (door_id, cb) {
        assert.fail("openDoor should not be called!");
        cb();
      });

      var closeDoor = sinon.stub(doorserver.services.door, "closeDoor", function (door_id, cb) {
        assert.equal(1000, door_id);
        cb();
      });

      doorserver.services.doorperiod.checkSingleDoor(ts, 1000, function (err, shouldBeOpen, because_of_rule) {
        assert.ok(shouldDoorBeOpen.called);
        assert.equal(false, openDoor.called);
        assert.ok(closeDoor.called);
        shouldDoorBeOpen.restore();
        openDoor.restore();
        closeDoor.restore();
        done();
      });
    });
  });

  describe("shouldDoorBeOpened", function () {
    it("should not open door if there's no timeperiod set", function (done) {

      var evaluated_called = false;
      var ts = new Date("2012-10-20");

      var findDoorById = sinon.stub(doorserver.repositories.doorRepository, "findDoorById", function (door_id, cb) {
        var data = {
          id:1000,
          name:"Front door"
        };
        cb(null, new doorserver.models.Door(data));
      });


      doorserver.services.doorperiod.shouldDoorBeOpen(ts, 1000, function (err, shouldBeOpen) {
        assert.ifError(err);
        assert.equal(false, shouldBeOpen);
        assert.ok(findDoorById.called);
        findDoorById.restore();
        done();
      });

    });

    it("should open door if timeperiod says so", function (done) {

      var ts = new Date("2012-10-20");

      var findDoorById = sinon.stub(doorserver.repositories.doorRepository, "findDoorById", function (door_id, cb) {
        var data = {
          id:1000,
          name:"Front door",
          timeperiod_id:10000
        };
        cb(null, new doorserver.models.Door(data));
      });

      var evaluateTimeperiod = sinon.stub(doorserver.services.timeperiod, "evaluateTimeperiod", function (ts, timeperiod_id, cb) {
        cb(null, true, { id:1, rule:"1-5,08:00-18:00", exclude:0});
      });

      doorserver.services.doorperiod.shouldDoorBeOpen(ts, 1000, function (err, shouldBeOpen) {
        assert.ifError(err);
        assert.ok(shouldBeOpen);
        assert.ok(findDoorById.called);
        assert.ok(evaluateTimeperiod.called);
        findDoorById.restore();
        evaluateTimeperiod.restore();
        done();
      });
    });

    it("should not open door if timperiod says so", function (done) {

      var ts = new Date("2012-10-20");

      var findDoorById = sinon.stub(doorserver.repositories.doorRepository, "findDoorById", function (door_id, cb) {
        var data = {
          id:1000,
          name:"Front door",
          timeperiod_id:10000
        };
        cb(null, new doorserver.models.Door(data));
      });

      var evaluateTimeperiod = sinon.stub(doorserver.services.timeperiod, "evaluateTimeperiod", function (ts, timeperiod_id, cb) {
        cb(null, false, { id:1, rule:"1-5,08:00-18:00", exclude:0});
      });

      doorserver.services.doorperiod.shouldDoorBeOpen(ts, 1000, function (err, shouldBeOpen) {
        assert.ifError(err);
        assert.equal(false, shouldBeOpen);
        assert.ok(findDoorById.called);
        assert.ok(evaluateTimeperiod.called);
        findDoorById.restore();
        evaluateTimeperiod.restore();
        done();
      });

    });
  });


});