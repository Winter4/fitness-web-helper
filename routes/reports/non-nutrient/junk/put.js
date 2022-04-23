const express = require('express');
const router = express.Router();

const Report = require('../../../../models/report');
const { getReport } = require('../../../../_commons');

const { changeByID } = require('../../nutrient/put');

router.put('/reports/non-nutr/junk/:user', async (req, res) => {
    try {

        const report = await getReport(req.params, req.query);

        changeByID(report.nonNutrientMeals.junk, req.query.row_id, req.query.row_weight);

        await report.save();

        res.send();
    } catch (e) {
        console.log(e);
        res.statusCode = 502;
        res.send();
    }
});

module.exports = router;