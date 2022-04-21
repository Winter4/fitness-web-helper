const time = require('./time');
const Report = require('./models/report');

// change the both report.calcToEatWeights & this
// if needed; requiring in the models/report caused errors
module.exports.tabAtoi = {
    'breakfast': 0,
    'lunch1': 1,
    'dinner': 2,
    'lunch2': 3,
    'supper': 4,
};

module.exports.getReport = async (params, query) => {

    const yesterday = Boolean(Number(query.yesterday));
    const date = !(yesterday) ? time.today.date() : time.yesterday.date();

    return await Report.findOne({ user: params.user, date: date });
};