const express = require('express');
const router = express.Router();
const { log } = require('../logger');

const Report = require('../models/report');
const User = require('../models/user');
const time = require('../time');

const { getReport, tabAtoi } = require('../_commons');

router.get('/data/:user', async (req, res) => {
    try {
        let report = await getReport(req.params, req.query);
        const user = await User.findById(req.params.user);

        log.info('Response for GET with userData json OK', { route: req.url });
        res.json({ 
            date: {
                today: time.today.date(),
                yesterday: {
                    date: time.yesterday.date(),
                    exists: Boolean(await Report.exists({ user: req.params.user, date: time.yesterday.date() })),
                } 
            },

            userData: {
                name: user.name,
                mealsPerDay: report.mealsPerDay,
            },

            caloriesTarget: {
                common: report.calories.target,
                tabs: {
                    breakfast: report.tabs[0].calories.target,
                    lunch1: report.tabs[1].calories.target,
                    dinner: report.tabs[2].calories.target,
                    lunch2: report.tabs[3].calories.target,
                    supper: report.tabs[4].calories.target,
                },
            }
        });

    } catch (e) {
        log.error({ route: req.url, error: e.message });
        res.statusCode = 500;
        res.send('Возникла непредвиденная ошибка на стороне сервера :(');
    }
});

router.get('/header/calories/got/:user', async (req, res) => {
    try {
        const report = await getReport(req.params, req.query);

        log.info('Response for GET with caloriesGot json OK', { route: req.url });
        res.json({ value: report.calories.got });

    } catch (e) {
        log.error({ route: req.url, error: e.message });
        res.statusCode = 500;
        res.send('Возникла непредвиденная ошибка на стороне сервера :(');
    }
});

router.get('/tab/calories/got/:user/:tab', async (req, res) => {
    try {
        const report = await getReport(req.params, req.query);

        const tabIndex = tabAtoi[req.params.tab];
        const tab = report.tabs[tabIndex];

        const response = {
            tab: tab.calories.got,

            groups: [
                tab.nutrients[0].calories.got,
                tab.nutrients[1].calories.got,
                tab.nutrients[2].calories.got,
            ],
        };

        log.info('Response for GET with tab caloriesGot json OK', { route: req.url });
        res.json(response);

    } catch (e) {
        log.error({ route: req.url, error: e.message });
        res.statusCode = 500;
        res.send('Возникла непредвиденная ошибка на стороне сервера :(');
    }
});

router.get('/tab/calories/target/:user/:tab', async (req, res) => {
    try {
        const report = await getReport(req.params, req.query);

        const tabIndex = tabAtoi[req.params.tab];
        const tab = report.tabs[tabIndex];

        const response = {
            tab: tab.calories.target,

            groups: [
                tab.nutrients[0].calories.target,
                tab.nutrients[1].calories.target,
                tab.nutrients[2].calories.target,
            ],
        };

        log.info('Response for GET with tab caloriesTarget json OK', { route: req.url });
        res.json(response);

    } catch (e) {
        log.error({ route: req.url, error: e.message });
        res.statusCode = 500;
        res.send('Возникла непредвиденная ошибка на стороне сервера :(');
    }
});

module.exports = router;