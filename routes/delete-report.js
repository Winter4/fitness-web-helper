const express = require("express");
const router = express.Router();
const { log } = require("../logger");

const Report = require("../models/report");
const time = require("../time");

router.delete("/delete-report/:user", async (req, res) => {
  try {
    // delete today and yesterday's reports
    await Report.deleteOne({ date: time.today.date(), user: req.params.user });
    await Report.deleteOne({
      date: time.yesterday.date(),
      user: req.params.user,
    });

    log.info("Deleted user reports", { user: req.params.user });

    log.info("Response for DELETE with OK", { route: req.url });
    res.send();
  } catch (e) {
    log.error({ route: req.url, error: e.message });
    res.statusCode = 500;
    res.send("Возникла непредвиденная ошибка на стороне сервера :(");
  }
});

module.exports = router;
