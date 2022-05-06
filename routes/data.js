const express = require('express');
const router = express.Router();
const { log } = require('../logger');

const Report = require('../models/report');
const User = require('../models/user');
const time = require('../time');

const { getReport, tabAtoi } = require('../_commons');

// get the user date (for header)
router.get('/data/:user', async (req, res) => {
    try {
        // report for user and date
        let report = await getReport(req.params, req.query);
        // user object
        const user = await User.findById(req.params.user);

        log.info('Response for GET with userData json OK', { route: req.url });
        res.json({ 
            // dates DD-MM-YYYY
            date: {
                today: time.today.date(),
                yesterday: {
                    date: time.yesterday.date(),
                    // if the report for yesterday exists
                    exists: Boolean(await Report.exists({ user: req.params.user, date: time.yesterday.date() })),
                } 
            },

            // user data from bot
            userData: {
                name: user.name,
                mealsPerDay: report.mealsPerDay,
            },

            // calories target for whole report and per each tab
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

// ______________________________________________________________

// get the calories got in common
router.get('/header/calories/got/:user', async (req, res) => {
    try {
        // report for user and date
        const report = await getReport(req.params, req.query);

        log.info('Response for GET with caloriesGot json OK', { route: req.url });
        res.json({ value: report.calories.got });

    } catch (e) {
        log.error({ route: req.url, error: e.message });
        res.statusCode = 500;
        res.send('Возникла непредвиденная ошибка на стороне сервера :(');
    }
});

// _______________________________________________________________

// get the calories got for tab
router.get('/tabs/calories/got/:user/:tab', async (req, res) => {
    try {
        // report for user and date
        const report = await getReport(req.params, req.query);

        // tab index up to request 
        const tabIndex = tabAtoi[req.params.tab];
        // tab object from the report
        const tab = report.tabs[tabIndex];

        // response with tab calories got in common
        // and per each group
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

// get the calories target for tab
router.get('/tabs/calories/target/:user/:tab', async (req, res) => {
    try {
        // report for user and date
        const report = await getReport(req.params, req.query);

        // tab index up to reqeust
        const tabIndex = tabAtoi[req.params.tab];
        // tab object from the report
        const tab = report.tabs[tabIndex];

        // response with tab calories target in common
        // and per each group
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

// _________________________________________________________

// get the calories got for junkfood
router.get('/junk/calories/got/:user', async (req, res) => {
    try {
        // report for user and date
        const report = await getReport(req.params, req.query);

        // response with the calories got value
        const response = { value: report.junk.calories.got };

        log.info('Response for GET with junk caloriesGot json OK', { route: req.url });
        res.json(response);
    } catch (e) {
        log.error({ route: req.url, error: e.message });
        res.statusCode = 500;
        res.send('Возникла непредвиденная ошибка на стороне сервера :(');
    }
});

module.exports = router;