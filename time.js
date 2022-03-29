const moment = require('moment-timezone');
const timezone = 'Europe/Moscow';

module.exports.timezone = timezone;

module.exports.today = {
    dayOfWeek: () => moment.tz(this.timezone).format('E'),
};