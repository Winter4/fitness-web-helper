const express = require('express');
const router = express.Router();
const { log } = require('../logger');

const Report = require('../models/report');
const time = require('../time');

const { getReport } = require('../_commons');

router.get('/calories-got/:user', async (req, res) => {
    try {
        const report = await getReport(req.params, req.query);

        log.info('Response for GET with caloriesGot json OK', { route: req.url });
        res.json({ caloriesGot: report.calories.got });

    } catch (e) {
        log.error({ route: req.url, error: e.message });
        res.statusCode = 500;
        res.send('Возникла непредвиденная ошибка на стороне сервера :(');
    }
});

module.exports = router;