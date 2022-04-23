const express = require('express');
const router = express.Router();

const Report = require('../../../../models/report');
const { getReport } = require('../../../../_commons');

const { deleteByID } = require('../../nutrient/delete');

router.delete('/reports/non-nutr/junk/:user', async (req, res) => {
    try {
        
        let report = await getReport(req.params, req.query);

        deleteByID(report.nonNutrientMeals.junk, req.query.row_id);

        await report.save();

        res.send();
    } catch (e) {
        console.log(e);
        res.statusCode = 502;
        res.send();
    }
});

module.exports = router;