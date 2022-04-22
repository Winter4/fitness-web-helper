const express = require('express');
const router = express.Router();

const Report = require('../models/report');
const time = require('../time');

const { getReport } = require('../_commons');

router.get('/calories-got/:user', async (req, res) => {
    try {
        
        let report = await getReport(req.params, req.query);

        res.json({ caloriesGot: report.calories.got });
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;