const express = require('express');
const router = express.Router();

const Report = require('../../../models/report');
const { getReport, tabAtoi } = require('../../../_commons');

router.put('/reports/non-nutr/vegetables/:user', async (req, res) => {
    try {

        const report = await getReport(req.params, req.query);

        report.nonNutrientMealsWeights.vegetables.got = req.query.veg_weight;
        await report.save();

        res.send();
    } catch (e) {
        console.log(e);
        res.statusCode = 502;
        res.send();
    }
});

router.get('/reports/non-nutr/vegetables/:user', async (req, res) => {
	try {

		const report = await getReport(req.params, req.query);
		const veg = report.nonNutrientMealsWeights.vegetables;

		res.json({ 
			eatenWeight: veg.got,
			toEatWeight: veg.target - veg.got,
		});
	} catch (e) {
		console.log(e);
        res.statusCode = 502;
        res.send();
	}
});

module.exports = router;