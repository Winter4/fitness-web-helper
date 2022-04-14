const moment = require('moment');
const timezone = 'Europe/Moscow';

module.exports.timezone = timezone;

module.exports.today = {
    dayOfWeek: () => moment().day(),

    date: () => {
        let today = moment();
        return parseDate(today);
    },
};

module.exports.yesterday = {
    dayOfWeek: () => moment().subtract(1, 'days').day(),

    date: () => {
        let today = moment().subtract(1, 'days');
        return parseDate(today);
    },
};

const parseDate = date => {

    let day = date.date();
    day = Number(day) < 10 ? '0' + day : day;
    let month = date.month() + 1;
    month = Number(month) < 10 ? '0' + month : month;
    let year  = date.year();

    return `${day}.${month}.${year}`;
};