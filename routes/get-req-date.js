const time = require('../time');

module.exports = (queryYesterday) => {
    let yesterday = Boolean(Number(queryYesterday));
    let date = !(yesterday) ? time.today.date() : time.yesterday.date();

    return date;
};