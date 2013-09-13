
var assert = require('assert');
var doorserver = require('../../lib/doorserver');

describe('door model', function() {
  it("should read attributes from constructor first argument", function() {

    var door = new doorserver.models.Door({
      id : "id",
      doorname : "doorname",
      timeperiod_id : 12
    });

    assert.equal(door.id, "id");
    assert.equal(door.doorname, "doorname");
    assert.equal(door.timeperiod_id, 12);

  });

  it("should read attributes from constructor first argument and set defaults", function() {

    var door = new doorserver.models.Door({
      id : "id",
      doorname : "doorname"
    });

    assert.equal(door.id, "id");
    assert.equal(door.doorname, "doorname");
    assert.equal(door.timeperiod_id, null);

  });

});

