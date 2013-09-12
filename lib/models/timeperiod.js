var moment = require('moment');

/**
 * Checks if timestamp falls into a time period represented as a string
 *
 * String has the following options for format:
 *  - "1-7,00:00-23:59" means from Mondays (1) to Sundays (7)
 *  - "1,00:00-23:59" means that every Monday (1)
 *
 *
 *
 *
 * @param ts Date
 * @param period String
 */
exports.check_time_period = function (date, period) {

  var m;
  var d1, d2, h1, m1, h2, m2, month1, month2;
  var date1, date2;

  // Iterate thru all different ways to express the date range

  // Start with "1-7,00:00-23:59"
  m = /([0-9])-([0-9]),([0-9]{2}):([0-9]{2})-([0-9]{2}):([0-9]{2})/.exec(period);
  if (m) {
    d1 = Number(m[1]);
    d2 = Number(m[2]);
    h1 = Number(m[3]);
    m1 = Number(m[4]);
    h2 = Number(m[5]);
    m2 = Number(m[6]);
    date1 = moment(date).day(d1).hour(h1).minute(m1).second(0).toDate();
    date2 = moment(date).day(d2).hour(h2).minute(m2).second(59).toDate();
  }

  // If that did not match, try with "1,00:00-23:59"
  if (!m) {
    m = /([0-9]),([0-9]{2}):([0-9]{2})-([0-9]{2}):([0-9]{2})/.exec(period);
    if (m) {
      d1 = Number(m[1]);
      d2 = Number(m[1]);
      h1 = Number(m[2]);
      m1 = Number(m[3]);
      h2 = Number(m[4]);
      m2 = Number(m[5]);
      date1 = moment(date).day(d1).hour(h1).minute(m1).second(0).toDate();
      date2 = moment(date).day(d2).hour(h2).minute(m2).second(59).toDate();
    }
  }

  // If not, try with a day-of-year region
  if (!m) {

    // "24.12.-26.12." (closed on x-mas holidays)
    m = /([0-9]{1,2})\.([0-9]{1,2})\.-([0-9]{1,2})\.([0-9]{1,2})\./.exec(period);
    if (m) {
      d1 = Number(m[1]);
      month1 = Number(m[2]) + 1; // Months start from Jan == 0, so we need to inc that with one
      d2 = Number(m[3]);
      month2 = Number(m[4]) + 1;// Months start from Jan == 0, so we need to inc that with one

      date1 = moment(date).month(month1).date(d1).hour(0).minute(0).second(0).toDate();
      date1 = moment(date).month(month2).date(d2).hour(23).minute(59).second(59).toDate();
    }
  }

  // Then try with a single day-of-year
  if (!m) {
    // "24.12." (closed on x-mas eve)
    m = /([0-9]{1,2})\.([0-9]{1,2})\./.exec(period);
    if (m) {
      d1 = Number(m[1]);
      month1 = Number(m[2]) + 1; // Months start from Jan == 0, so we need to inc that with one

      date1 = moment(date).month(month1).date(d1).hour(0).minute(0).second(0).toDate();
      date1 = moment(date).month(month1).date(d1).hour(23).minute(59).second(59).toDate();
    }
  }



  if (!m) {
    console.warn("Invalid date period string", period);
    return null;
  }


  console.log(date, date1, date2);
  if (date >= date1) {
    console.log("date", date, "is gte", date1);
  }
  if (date <= date2) {
      console.log("date", date, "is lte", date2);
    }


  return (date >= date1 && date <= date2);


};

