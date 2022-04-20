const express = require('express');
const router = express.Router();

const Report = require('../../models/report');
const getReport = require('../get-report');

const changeByID = (array, id, newWeight) => {
    for (item of array) {
        if (id === `${item._id.toString()}`) {
            item.weight.eaten = newWeight;
            break;
        }
    }
};

router.put('/reports/:user/:tab/', async (req, res) => {
    try {

        const report = await getReport(req.params, req.query);

        switch (req.params.tab) {
            case 'breakfast': changeByID(report.breakfast.meals, req.query.row_id, req.query.row_weight);
            break;

            case 'dinner': changeByID(report.dinner, mealID, mealWeight);
            break;

            case 'supper': changeByID(report.supper, mealID, mealWeight);
            break;

            case 'lunch1': changeByID(report.lunch1, mealID, mealWeight);
            break;

            case 'lunch2': changeByID(report.lunch2, mealID, mealWeight);
            break;
        }

        await report.calcToEatWeights(req.params.tab, req.query.nutrient);
        await report.save();

        res.send();

    } catch (e) {
        console.log(e);
        res.statusCode = 502;
        res.send();
    }
});

module.exports = router;