const express = require('express');
const router = express.Router();

const Report = require('../models/report');
const time = require('../time');

const getReport = require('./get-report');

router.get('/data/:user', async (req, res) => {
    try {

        let report = await getReport(req.params, req.query);
        await report.populate('user');
        report.calcTargetCalories();
        report.save();

        res.json({ 
            today: time.today.date(),
            yesterday: time.yesterday.date(), 
            yesterdayExists: await Report.exists({ user: req.params.user, date: time.yesterday.date() }),

            mealsPerDay: report.user.mealsPerDay,
            caloriesTarget: report.user.caloriesToLose,
            caloriesPerTabs: {
                breakfast: report.breakfast.caloriesTarget,
                lunch1: report.lunch1.caloriesTarget,
                dinner: report.dinner.caloriesTarget,
                lunch2: report.lunch2.caloriesTarget,
                supper: report.supper.caloriesTarget,
            }
        });
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;