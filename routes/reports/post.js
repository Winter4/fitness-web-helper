const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Report = require('../../models/report');
const Meal = require('../../models/meal');
const getReport = require('../get-report');

router.use(express.urlencoded({ extended: false }));

router.post('/reports/:user/:tab', async (req, res) => {
    try {

        let report = await getReport(req.params, req.query);

        let mealObject = { 
            _id: new mongoose.Types.ObjectId, 
            food: mongoose.Types.ObjectId(req.body.id), 
            weight: {
                eaten: req.body.weight,
                toEat: -1,
            }
        };
        switch (req.params.tab) {
            case 'breakfast': report.breakfast.meals.push(mealObject);
            break;

            case 'dinner': report.dinner.push(mealObject);
            break;

            case 'supper': report.supper.push(mealObject);
            break;

            case 'lunch1': report.lunch1.push(mealObject);
            break;

            case 'lunch2': report.lunch2.push(mealObject);
            break;
        }

        console.log(req.body.id);
        const mealData = await Meal.findById(req.body.id);
        await report.calcToEatWeights(req.params.tab, mealData.group);
        await report.save();

        res.send();
    } catch(e) {
        console.log(e);
    }
});

module.exports = router;