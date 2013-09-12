
var assert = require('assert');
var doorserver = require('../../lib/doorserver');

describe('door model', function() {
  it("should read attributes from constructor first argument", function() {

    var door = new doorserver.models.Door({
      id : "id",
      doorname : "doorname"
    });

    assert.equal(door.id, "id");
    assert.equal(door.doorname, "doorname");

  });

});

