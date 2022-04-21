const express = require('express');
const router = express.Router();

const Report = require('../models/report');
const time = require('../time');

const { getReport } = require('../_commons');

router.get('/data/:user', async (req, res) => {
    try {

        let report = await getReport(req.params, req.query);

        res.json({ 
            today: time.today.date(),
            yesterday: time.yesterday.date(), 
            yesterdayExists: await Report.exists({ user: req.params.user, date: time.yesterday.date() }),

            mealsPerDay: report.mealsPerDay,
            caloriesTarget: report.calories.target,
            caloriesPerTabs: {
                breakfast: report.tabs[0].calories.target,
                lunch1: report.tabs[1].calories.target,
                dinner: report.tabs[2].calories.target,
                lunch2: report.tabs[3].calories.target,
                supper: report.tabs[4].calories.target,
            }
        });
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;