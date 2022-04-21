const express = require('express');
const router = express.Router();

const Report = require('../../models/report');

const { getReport, tabAtoi } = require('../../_commons');

router.get('/reports/:user/:tab/:nutrient', async (req, res) => {
    try {

        let report = await getReport(req.params, req.query);

        const tabIndex = tabAtoi[req.params.tab];
        await report.populate(`tabs.${tabIndex}.meals.food`);

        const tab = report.tabs[tabIndex];

        let response = [];
        for (let meal of tab.meals) {
            if (meal.food.group == req.params.nutrient) {
                response.push({ 
                    _id: meal._id,
                    name: meal.food.name,
                    weight: meal.weight,
                });
            }
        }

        res.json({ data: response });

    } catch (e) {
        res.status(500).send('Oops, something went wrong :(');
        console.log(e);
    }
});

module.exports = router;