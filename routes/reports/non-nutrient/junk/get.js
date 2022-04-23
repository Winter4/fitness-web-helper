const express = require('express');
const router = express.Router();

const Report = require('../../../../models/report');
const { getReport } = require('../../../../_commons');

router.get('/reports/non-nutr/junk/:user', async (req, res) => {
	try {

		const report = await getReport(req.params, req.query);

		await report.nonNutrientMeals.populate('junk.food');

		const junkGroups = ['alcohol', 'soda', 'sweets'];

		let response = [];
        for (let meal of report.nonNutrientMeals.junk) {
            if (junkGroups.includes(meal.food.group)) {
                response.push({ 
                    _id: meal._id,
                    name: meal.food.name,
                    weight: meal.weight,
                });
            }
        }

        res.json({ data: response });
	} catch (e) {
		console.log(e);
        res.statusCode = 502;
        res.send();
	}
});

module.exports = router;