const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Report = require('../../../models/report');
const Meal = require('../../../models/meal');

const { getReport, tabAtoi } = require('../../../_commons');

router.use(express.urlencoded({ extended: false }));

const pushByID  = (array, mealObject) => {
    for (let item of array) {
        if (mealObject.food == `${item.food.toString()}`) {
            item.weight.eaten += Number(mealObject.weight.eaten);
            return;
        }
    }

    array.push(mealObject);
};
module.exports.pushByID = pushByID;

router.post('/reports/nutr/:user/:tab', async (req, res) => {
    try {

        let newMeal = { 
            _id: new mongoose.Types.ObjectId, 
            food: mongoose.Types.ObjectId(req.body.meal_id), 
            weight: {
                eaten: req.body.meal_weight,
                toEat: -1,
            }
        };

        let report = await getReport(req.params, req.query);
        pushByID(report.tabs[ tabAtoi[req.params.tab] ].meals, newMeal);

        const mealData = await Meal.findById(req.body.meal_id);
        await report.calcToEatWeights(req.params.tab, mealData.group);
        await report.save();

        res.send();
    } catch(e) {
        console.log(e);
    }
});

module.exports.router = router;