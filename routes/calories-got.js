const express = require('express');
const router = express.Router();

const Report = require('../models/report');
const time = require('../time');

router.get('/calories-got/:id/:yesterday', async (req, res) => {
    try {
        let id = req.params.id;
        let yesterday = Boolean(Number(req.params.yesterday));

        let date = !(yesterday) ? time.today.date() : time.yesterday.date();

        let report = await Report.findOne({ user: id, date: date })

        res.json({ caloriesGot: report.calories.got });
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;