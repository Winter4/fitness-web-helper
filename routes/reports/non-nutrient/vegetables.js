const express = require('express');
const router = express.Router();
const { log } = require('../../../logger');

const Report = require('../../../models/report');
const { getReport } = require('../../../_commons');

router.get('/reports/vegetables/:user', async (req, res) => {
	try {
		const report = await getReport(req.params, req.query);
		const veg = report.vegetables.weight;

		const response = { 
			eatenWeight: veg.eaten,
			toEatWeight: veg.target - veg.eaten,
		};

		log.info('Response for GET with vegetables row json OK', { route: req.url });
		res.json(response);

	} catch (e) {
		log.error({ route: req.url, error: e.message });
        res.statusCode = 500;
        res.send('Возникла непредвиденная ошибка на стороне сервера :(');
	}
});

router.put('/reports/vegetables/:user', async (req, res) => {
    try {
        const report = await getReport(req.params, req.query);

        console.log(req.query);
        report.vegetables.weight.eaten = req.query.weight;
        await report.save();

        log.info('Response for PUT with OK', { route: req.url });
        res.send();

    } catch (e) {
        log.error({ route: req.url, error: e.message });
        res.statusCode = 500;
        res.send('Возникла непредвиденная ошибка на стороне сервера :(');
    }
});

module.exports = router;