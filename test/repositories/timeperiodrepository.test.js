var assert = require('assert');
var doorserver = require('../../lib/doorserver');

describe('timeperiodRepository', function () {

  it("can load data from mysql by timeperiod_id", function (done) {
    doorserver.repositories.timeperiodRepository.findTimeperiodById(10000, function (err, tp) {

      assert.ifError(err);
      assert.equal("Business hours", tp.name);
      assert.equal(10000, tp.id);
      assert.equal(2, tp.include_rules.length);
      assert.equal(1, tp.exclude_rules.length);
      assert.equal(1, tp.include_rules[0].id);
      assert.equal(10000, tp.include_rules[0].timeperiod_id);
      assert.equal("1-5,08:00-18:00", tp.include_rules[0].rule);
      assert.equal(0, tp.include_rules[0].exclude);

      assert.equal(2, tp.include_rules[1].id);
      assert.equal(10000, tp.include_rules[1].timeperiod_id);
      assert.equal("6-7,10:00-18:00", tp.include_rules[1].rule);
      assert.equal(0, tp.include_rules[1].exclude);


      assert.equal(3, tp.exclude_rules[0].id);
      assert.equal(10000, tp.exclude_rules[0].timeperiod_id);
      assert.equal("24.12.", tp.exclude_rules[0].rule);
      assert.equal(1, tp.exclude_rules[0].exclude);

      done();
    });
  });

});
