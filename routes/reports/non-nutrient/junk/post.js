const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const Report = require('../../../../models/report');
const { getReport } = require('../../../../_commons');

router.use(express.urlencoded({ extended: false }));
const { pushByID } = require('../../nutrient/post');

router.post('/reports/non-nutr/junk/:user', async (req, res) => {
    try {

        const newMeal = { 
            _id: new mongoose.Types.ObjectId, 
            food: mongoose.Types.ObjectId(req.body.meal_id), 
            weight: {
                eaten: req.body.meal_weight,
            }
        };

        const report = await getReport(req.params, req.query);
        pushByID(report.nonNutrientMeals.junk, newMeal);

        await report.save();

        res.send();
    } catch(e) {
        console.log(e);
    }
});

module.exports = router;