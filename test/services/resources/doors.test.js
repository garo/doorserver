var assert = require('assert');
var sinon = require('sinon');
var doorserver = require('../../../lib/doorserver');

describe('resource:doors', function () {
  describe("index", function () {
    it("should have .index function", function () {
      assert.ok(doorserver.services.resources.doors.index);
    });

    it("should return all doors in json", function (done) {
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

      var findDoorById = sinon.stub(doorserver.repositories.doorRepository, 'findDoorById', function (door_id, cb) {
        cb(null, new doorserver.models.Door({ id:door_id, doorname:"Door #" + door_id, timeperiod_id:null}));
      });


      var req = {};
      var res = {
        send:function (data) {
          console.log("ASDF", data);
          var expect = {
            doors:[
              {
                id:1001,
                doorname:"Door #1001",
                timeperiod_id:null
              },
              {
                id:1000,
                doorname:"Door #1000",
                timeperiod_id:null
              }
            ]
          };
          assert.deepEqual(expect, data);

          assert.ok(findDoorById.called);
          findDoorById.restore();
          settings_get.restore();
          done();

        }
      };

      doorserver.services.resources.doors.index(req, res);

    });

  });
});
