const express = require('express');
const router = express.Router();
const { log } = require('../../logger');

const mongoose = require('mongoose');

const Report = require('../../models/report');
const { getReport } = require('../../_commons');

// get the data for junks table
router.get('/reports/junk/:user/:group', async (req, res) => {
    try {
        // get the report depending on user and date
        const report = await getReport(req.params, req.query);
        await report.populate('junk.meals.food');

        // reponse with all the meals of
        // requested group
        let response = [];
        for (let meal of report.junk.meals) {
            if (meal.food.group == req.params.group) {
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
const { pushByID } = require('./tabs');

// add new row to the junk table
router.post('/reports/junk/:user', async (req, res) => {
    try {
        const newMeal = { 
            _id: new mongoose.Types.ObjectId, 
            food: mongoose.Types.ObjectId(req.body.meal_id), 
            weight: {
                eaten: req.body.meal_weight,
            }
        };

        // get the report for req user and req date
        const report = await getReport(req.params, req.query);
        pushByID(report.junk.meals, newMeal);

        await report.save();

        log.info('Response for POST with OK', { route: req.url });
        res.send();

    } catch(e) {
        log.error({ route: req.url, error: e.message });
        res.statusCode = 500;
        res.send('Возникла непредвиденная ошибка на стороне сервера :(');
    }
});


const { changeByID } = require('./tabs');

// change table row
router.put('/reports/junk/:user', async (req, res) => {
    try {
        // get report for the req user and req date
        const report = await getReport(req.params, req.query);

        changeByID(report.junk.meals, req.query.row_id, req.query.row_weight);

        await report.save();

        log.info('Reponse for PUT with OK', { route: req.url });
        res.send();

    } catch (e) {
        log.error({ route: req.url, error: e.message });
        res.statusCode = 500;
        res.send('Возникла непредвиденная ошибка на стороне сервера :(');
    }
});


const { deleteByID } = require('./tabs');

// delete table row
router.delete('/reports/junk/:user', async (req, res) => {
    try {
        // get report for the req user and req date
        let report = await getReport(req.params, req.query);

        deleteByID(report.junk.meals, req.query.row_id);

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