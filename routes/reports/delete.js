const express = require('express');
const router = express.Router();

const Report = require('../../models/report');
const getReport = require('../get-report');

const deleteByID = (array, id) => {
    for (i in array) {
        if (id === `${array[i]._id.toString()}`) {
            array.splice(i, 1);
            break;
        }
    }
};

router.delete('/reports/:user/:tab/', async (req, res) => {
    try {
        
        let report = await getReport(req.params, req.query);

        switch (req.params.tab) {
            case 'breakfast': deleteByID(report.breakfast.meals, req.query.row_id);
            break;

            case 'dinner': deleteByID(report.dinner, mealID);
            break;

            case 'supper': deleteByID(report.supper, mealID);
            break;

            case 'lunch1': deleteByID(report.lunch1, mealID);
            break;

            case 'lunch2': deleteByID(report.lunch2, mealID);
            break;
        }

        await report.save();

        res.statusCode = 200;
        res.send();

    } catch (e) {
        console.log(e);
        res.statusCode = 502;
        res.send();
    }
});

module.exports = router;