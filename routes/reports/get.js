const express = require('express');
const router = express.Router();

const Report = require('../../models/report');
const getReqDate = require('../get-req-date');

router.get('/reports/:id/:tab/:nutrient', async (req, res) => {
    try {
        const id = req.params.id;
        const tab = req.params.tab;
        const nutrient = req.params.nutrient;
        
        let date = getReqDate(req.query.yesterday);

        report = await Report.findOne({ user: id, date: date });

        await report.populate(`${tab}.meals.food`);
        switch (tab) {
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
            if (item.food.group == nutrient) {
                response.push({ 
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