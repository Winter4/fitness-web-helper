const express = require('express');
const router = express.Router();

const Report = require('../models/report');
const time = require('../time');

router.get('/data/:id', async (req, res) => {
    try {
        let id = req.params.id;

        let report = await Report.findOne({ user: id, date: time.today.date() });
        await report.populate('user');
        report.calcTargetCalories();
        report.save();

        res.json({ 
            today: time.today.date(),
            yesterday: time.yesterday.date(), 
            yesterdayExists: await Report.exists({ user: id, date: time.yesterday.date() }),

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