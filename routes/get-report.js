const time = require('../time');
const Report = require('../models/report');

module.exports = async (params, query) => {

    const yesterday = Boolean(Number(query.yesterday));
    const date = !(yesterday) ? time.today.date() : time.yesterday.date();

    return await Report.findOne({ user: params.user, date: date });
};