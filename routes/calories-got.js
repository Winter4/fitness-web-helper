const express = require('express');
const router = express.Router();

const Report = require('../models/report');
const time = require('../time');

const getReport = require('./get-report');

router.get('/calories-got/:user/:yesterday', async (req, res) => {
    try {

        let report = await getReport(req.params, req.query);

        res.json({ caloriesGot: report.calories.got });
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;