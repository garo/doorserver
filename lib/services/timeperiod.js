
var doorserver = require('../doorserver');

/**
 * Evaluates a date against a timeperiod set. This will fetch the timeperiod from database
 * by it's timeperiod_id and evaluates it according to the rules.
 *
 * If the timeperiod can't be found the function will return false as allowedByPeriod
 * (think this as an DEFAULT DENY master rule)
 *
 * Other callback parameters:
 *  - because_of_rule : <Object> Rule object which caused the final result
 *
 * @param ts Date object
 * @param timeperiod_id Number
 * @param cb function(err, allowedByPeriod, because_of_rule_id, because_of_rule)
 */
exports.evaluateTimeperiod = function(ts, timeperiod_id, cb) {
  doorserver.repositories.timeperiodRepository.findTimeperiodById(timeperiod_id, function (err, tp) {
    if (err) {
      cb(err, false);
      return;
    }

    if (!tp) {
      console.error("Could not find timeperiod", timeperiod_id, "from database but it should be there according to schema!");
      cb(null, false);
      return;
    }

    var results = tp.evaluate(ts);
    if (results.valid) {
      cb(null, true, results.because_of_rule);
    } else {
      cb(null, false, results.because_of_rule);
    }
  });

};
