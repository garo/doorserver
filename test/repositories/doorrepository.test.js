var assert = require('assert');
var sinon = require('sinon');
var doorserver = require('../../lib/doorserver');

describe('door repository', function () {
  describe("findDoorById", function () {
    it("should find door by its id", function (done) {

      doorserver.repositories.doorRepository.findDoorById(1000, function (err, door) {
        assert.ifError(err);
        assert.equal(door.id, 1000);
        assert.equal(door.doorname, "Etuovi");

        done();
      });

    });
  });


});