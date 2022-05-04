const express = require('express');
const router = express.Router();
const { log } = require('../../../logger');

const mongoose = require('mongoose');

const Report = require('../../../models/report');
const Meal = require('../../../models/meal');

const { getReport, tabAtoi } = require('../../../_commons');

// ___________________________________________________________________

router.get('/reports/tabs/:user/:tab/:nutrient', async (req, res) => {
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
                    title: meal.food.title,
                });
            }
        }

        log.info('Response for GET with tabs rows json OK', { route: req.url });
        res.json({ data: response });

    } catch (e) {
        log.error({ route: req.url, error: e.message });
        res.statusCode = 500;
        res.send('Возникла непредвиденная ошибка на стороне сервера :(');
    }
});

// __________________________________________________________________________

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

router.post('/reports/tabs/:user/:tab', async (req, res) => {
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

        log.info('Response for POST with OK', { route: req.url });
        res.send();

    } catch(e) {
        log.error({ route: req.url, error: e.message });
        res.statusCode = 500;
        res.send('Возникла непредвиденная ошибка на стороне сервера :(');
    }
});

// _______________________________________________________________________

const changeByID = (array, id, newWeight) => {
    for (let item of array) {
        if (id === `${item._id.toString()}`) {
            item.weight.eaten = newWeight;
            break;
        }
    }
};
module.exports.changeByID = changeByID;

router.put('/reports/tabs/:user/:tab/:nutrient', async (req, res) => {
    try {
        const report = await getReport(req.params, req.query);

        changeByID(report.tabs[ tabAtoi[req.params.tab] ].meals, req.query.row_id, req.query.row_weight);

        await report.calcToEatWeights(req.params.tab, req.params.nutrient);
        await report.save();

        log.info('Response for PUT with OK', { route: req.url });
        res.send();

    } catch (e) {
        log.error({ route: req.url, error: e.message });
        res.statusCode = 500;
        res.send('Возникла непредвиденная ошибка на стороне сервера :(');
    }
});

// ______________________________________________________________________

const deleteByID = (array, id) => {
    for (let i in array) {
        if (id === `${array[i]._id.toString()}`) {
            array.splice(i, 1);
            break;
        }
    }
};
module.exports.deleteByID = deleteByID;

router.delete('/reports/tabs/:user/:tab/:nutrient', async (req, res) => {
    try {
        let report = await getReport(req.params, req.query);

        deleteByID(report.tabs[ tabAtoi[req.params.tab] ].meals, req.query.row_id);

        await report.calcToEatWeights(req.params.tab, req.params.nutrient);
        await report.save();

        log.info('Response for DELETE with OK', { route: req.url });
        res.send();

    } catch (e) {
        log.error({ route: req.url, error: e.message });
        res.statusCode = 500;
        res.send('Возникла непредвиденная ошибка на стороне сервера :(');
    }
});

module.exports.router = router;