const time = require('./time');
const Report = require('./models/report');

module.exports.getReport = async (params, query) => {

    const yesterday = Boolean(Number(query.yesterday));
    const date = !(yesterday) ? time.today.date() : time.yesterday.date();

    return await Report.findOne({ user: params.user, date: date });
};

module.exports.tabAtoi = {
    'breakfast': 0,
    'lunch1': 1,
    'dinner': 2,
    'lunch2': 3,
    'supper': 4,
};