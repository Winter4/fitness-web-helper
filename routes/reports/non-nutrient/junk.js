const express = require('express');
const router = express.Router();
const { log } = require('../../../logger');

const mongoose = require('mongoose');

const Report = require('../../../models/report');
const { getReport } = require('../../../_commons');


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

        log.info('Response for GET with junk rows json OK', { route: req.url });
        res.json({ data: response });

    } catch (e) {
        log.error({ route: req.url, error: e.message });
        res.statusCode = 500;
        res.send('Возникла непредвиденная ошибка на стороне сервера :(');
    }
});


router.use(express.urlencoded({ extended: false }));
const { pushByID } = require('../nutrient/nutrient');

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

        log.info('Response for POST with OK', { route: req.url });
        res.send();

    } catch(e) {
        log.error({ route: req.url, error: e.message });
        res.statusCode = 500;
        res.send('Возникла непредвиденная ошибка на стороне сервера :(');
    }
});


const { changeByID } = require('../nutrient/nutrient');

router.put('/reports/non-nutr/junk/:user', async (req, res) => {
    try {
        const report = await getReport(req.params, req.query);

        changeByID(report.nonNutrientMeals.junk, req.query.row_id, req.query.row_weight);

        await report.save();

        log.info('Reponse for PUT with OK', { route: req.url });
        res.send();

    } catch (e) {
        log.error({ route: req.url, error: e.message });
        res.statusCode = 500;
        res.send('Возникла непредвиденная ошибка на стороне сервера :(');
    }
});


const { deleteByID } = require('../nutrient/nutrient');

router.delete('/reports/non-nutr/junk/:user', async (req, res) => {
    try {
        let report = await getReport(req.params, req.query);

        deleteByID(report.nonNutrientMeals.junk, req.query.row_id);

        await report.save();

        log.info('Reponse for DELETE with OK', { route: req.url });
        res.send();

    } catch (e) {
        log.error({ route: req.url, error: e.message });
        res.statusCode = 500;
        res.send('Возникла непредвиденная ошибка на стороне сервера :(');
    }
});

module.exports.router = router;