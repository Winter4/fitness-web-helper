const express = require('express');
const router = express.Router();

const Report = require('../../../models/report');

const { getReport, tabAtoi } = require('../../../_commons');

const deleteByID = (array, id) => {
    for (let i in array) {
        if (id === `${array[i]._id.toString()}`) {
            array.splice(i, 1);
            break;
        }
    }
};
module.exports.deleteByID = deleteByID;

router.delete('/reports/nutr/:user/:tab/:nutrient', async (req, res) => {
    try {
        
        let report = await getReport(req.params, req.query);

        deleteByID(report.tabs[ tabAtoi[req.params.tab] ].meals, req.query.row_id);

        await report.calcToEatWeights(req.params.tab, req.params.nutrient);
        await report.save();

        res.send();
    } catch (e) {
        console.log(e);
        res.statusCode = 502;
        res.send();
    }
});

module.exports.router = router;