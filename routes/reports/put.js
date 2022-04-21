const express = require('express');
const router = express.Router();

const Report = require('../../models/report');
const { getReport, tabAtoi } = require('../../_commons');

const changeByID = (array, id, newWeight) => {
    for (let item of array) {
        if (id === `${item._id.toString()}`) {
            item.weight.eaten = newWeight;
            break;
        }
    }
};

router.put('/reports/:user/:tab/', async (req, res) => {
    try {

        const report = await getReport(req.params, req.query);

        changeByID(report.tabs[ tabAtoi[req.params.tab] ].meals, req.query.row_id, req.query.row_weight);

        await report.calcToEatWeights(req.params.tab, req.query.nutrient);
        await report.save();

        res.send();
    } catch (e) {
        console.log(e);
        res.statusCode = 502;
        res.send();
    }
});

module.exports = router;