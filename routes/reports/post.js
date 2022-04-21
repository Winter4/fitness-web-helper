const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Report = require('../../models/report');
const Meal = require('../../models/meal');

const { getReport, tabAtoi } = require('../../_commons');

router.use(express.urlencoded({ extended: false }));

router.post('/reports/:user/:tab', async (req, res) => {
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
        report.tabs[ tabAtoi[req.params.tab] ].meals.push(newMeal);

        const mealData = await Meal.findById(req.body.meal_id);
        await report.calcToEatWeights(req.params.tab, mealData.group);
        await report.save();

        res.send();
    } catch(e) {
        console.log(e);
    }
});

module.exports = router;