var moment = require('moment');

/**
 * Checks if timestamp falls into a time period represented as a string
 *
 * String has the following options for format:
 *  - "1-7,00:00-23:59" means from mondays (1) to sundays (7)
 *  - "1,00:00-23:59" means that every monday
 *
 *
 * TODO:
 *  We might want to redo this with moment. example:
 *
 *
 * function isBetween(date, day1, day2) {
 *  return (date > moment(date).day(day1).toDate() && date < moment(date).day(day2).toDate());
 * }
 *
 * console.log(isBetween(new Date(), "Monday", "Friday"));
 *
 * console.log(isBetween(new Date(), "Monday", "Tuesday"));
 *
 *
 * @param ts Date
 * @param period String
 */
exports.check_time_period = function (ts, period) {

  // Sunday is 0, Monday is 1, and so on, so we shift sunday to be the 7th day,
  // thus getting correct day numbering which starts from Monday (1) and ends to Sunday (7)
  var day = (0 === ts.getDay()) ? 7 : ts.getDay();

  var sec = 3600 * ts.getHours() + 60 * ts.getMinutes() + ts.getSeconds();

  var m;
  var d1, d2, h1, m1, h2, m2;
  m = /([0-9]+)-([0-9]+),([0-9]+):([0-9]+)-([0-9]+):([0-9]+)/.exec(period);
  if (m) {
    d1 = Number(m[1]);
    d2 = Number(m[2]);
    h1 = Number(m[3]);
    m1 = Number(m[4]);
    h2 = Number(m[5]);
    m2 = Number(m[6]);
  }

  if (!m) {
    m = /([0-9]+),([0-9]+):([0-9]+)-([0-9]+):([0-9]+)/.exec(period);
    if (m) {
      d1 = Number(m[1]);
      d2 = Number(m[1]);
      h1 = Number(m[2]);
      m1 = Number(m[3]);
      h2 = Number(m[4]);
      m2 = Number(m[5]);
    }
  }

  if (!m) {
    console.warn("Invalid date period string", period);
    return null;
  }

  var secs1 = (3600 * h1 + 60 * m1);
  var secs2 = (3600 * h2 + 60 * m2);

  // Special case. If we're testing against 23:59 as the end-of-day, then we need to add 59 seconds
  // so that the real time 23:59:59 matches this)
  if (h2 == 23 && m2 == 59) {
    secs2 += 59;
  }

  if ((day >= d1) && (day <= d2) &&
      (sec >= secs1) &&
      (sec <= secs2)) {
        return true;
  } else {
    return false;
  }
};

