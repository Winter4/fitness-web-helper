const moment = require('moment-timezone');
const timezone = 'Europe/Moscow';

module.exports.timezone = timezone;

module.exports.today = {
    dayOfWeek: () => moment.tz(this.timezone).format('E'),
    date: () => {

        day   = moment.tz(this.timezone).format('D');
        month = moment.tz(this.timezone).format('M');
        month = month.length == 2 ? month : '0' + month;
        year  = moment.tz(this.timezone).format('y');

        return `${day}.${month}.${year}`;
    },
};