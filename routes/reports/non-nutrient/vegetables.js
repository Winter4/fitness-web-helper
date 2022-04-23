const express = require('express');
const router = express.Router();

const Report = require('../../../models/report');
const { getReport } = require('../../../_commons');

router.get('/reports/non-nutr/vegetables/:user', async (req, res) => {
	try {

		const report = await getReport(req.params, req.query);
		const veg = report.nonNutrientMeals.vegetables.weight;

		const response = { 
			eatenWeight: veg.eaten,
			toEatWeight: veg.target - veg.eaten,
		};

		res.json(response);
	} catch (e) {
		console.log(e);
        res.statusCode = 502;
        res.send();
	}
});

router.put('/reports/non-nutr/vegetables/:user', async (req, res) => {
    try {

        const report = await getReport(req.params, req.query);

        report.nonNutrientMeals.vegetables.weight.eaten = req.query.veg_weight;
        await report.save();

        res.send();
    } catch (e) {
        console.log(e);
        res.statusCode = 502;
        res.send();
    }
});

module.exports = router;