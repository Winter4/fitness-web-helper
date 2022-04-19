const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Report = require('../../models/report');
const Meal = require('../../models/meal');
const getReqDate = require('../get-req-date');

router.use(express.urlencoded({ extended: false }));

router.post('/reports/:id/:tab', async (req, res) => {
    try {
        let user = req.params.id;
        let tab = req.params.tab;

        let newMeal = req.body;

        let date = getReqDate(req.query.yesterday);

        let report = await Report.findOne({ user: user, date: date });

        let mealObject = { 
            _id: new mongoose.Types.ObjectId, 
            food: mongoose.Types.ObjectId(newMeal.id), 
            weight: {
                eaten: newMeal.weight,
                toEat: -1,
            }
        };
        switch (tab) {
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

        const mealData = await Meal.findOne({ _id: newMeal.id });
        report.calcToEatWeights(tab, mealData.group);
        await report.save();

        res.send();
    } catch(e) {
        console.log(e);
    }
});

module.exports = router;