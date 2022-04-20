const express = require('express');
const router = express.Router();

const Report = require('../../models/report');
const getReport = require('../get-report');

router.get('/reports/:user/:tab/:nutrient', async (req, res) => {
    try {

        let report = await getReport(req.params, req.query);

        await report.populate(`${req.params.tab}.meals.food`);
        switch (req.params.tab) {
            case 'breakfast': report = report.breakfast;
            break;

            case 'dinner': report = report.dinner;
            break;

            case 'supper': report = report.supper;
            break;

            case 'lunch1': report = report.lunch1;
            break;

            case 'lunch2': report = report.lunch2;
            break;
        }
        
        await report.populate('meals.food');

        let response = [];
        for (item of report.meals) {
            if (item.food.group == req.params.nutrient) {
                response.push({ 
                    _id: item._id,
                    name: item.food.name,
                    weight: item.weight,
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