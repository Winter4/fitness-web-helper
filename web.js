const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config({ path: '../.env' });

// _________________________________________

const time = require('./time');

const Report = require('./models/report');
const Meal = require('./models/meal');
const User = require('./models/user');

const { log } = require('./logger');
const app = express();

// __________________________________________

app.use(express.static(__dirname + "/public"));
app.use(cors());

// __________________________________________

// log all income requests
app.use((req, res, next) => {
    log.info('New Request', { method: req.method, url: req.url, query: req.query });
    next();
});

// get the index.html
app.get('/', async (req, res) => {

    let report, user;

    // if the query is empty, resp with error
    if (req.query.user == undefined || Number(req.query.user) < 1) {
        log.warn('Invalid user query', { user: req.query.user });
        res.statusCode = 400;
        res.send('Запрос содержит недопустимые параметры или не содержит их вовсе.');
    }

    try {
        // get the report
        log.info('Getting report from DB', { route: req.url });
        report = await Report.findOne({ user: req.query.user, date: time.today.date() });
        log.info('Got report from DB', { route: req.url });

        // get the user object
        log.info('Getting user from DB', { route: req.url });
        user = await User.findOne({ _id: req.query.user });
        log.info('Got user from DB', { route: req.url });

    } catch (e) {
        log.error('DB req for report or user failed', { route: req.url, error: e.message });
        res.statusCode = 502;
        res.send('Возникла непредвиденная ошибка на стороне сервера :(');
    }

    try {
        // if there is no report, create a new one
        if (report == null) {

            report = new Report({
                user: user._id,
                tabs: [{}, {}, {}, {}, {}],

                calories: { got: 0, target: user.caloriesToLose, },

                vegetables: {
                    weight: { eaten: 0, },
                }
            });

            // init the tabs
            for (let i in report.tabs) {
                // bf-l2 tabs has the following groups proportions
                if (i == report.tabs.length - 1) {
                    report.tabs[i].nutrients = [
                        { rate: 0.5, calories: { got: 0 } },
                        { rate: 0.25, calories: { got: 0 } },
                        { rate: 0.25, calories: { got: 0 } },
                    ];
                }
                // sup tab has the following groups proporions
                else {
                    report.tabs[i].nutrients = [
                        { rate: 0.35, calories: { got: 0 } },
                        { rate: 0.25, calories: { got: 0 } },
                        { rate: 0.4, calories: { got: 0 } },
                    ];
                }

                // create the field
                report.tabs[i].calories.target = -1;
            }
        }

        // copy the field from user doc to report doc
        report.mealsPerDay = user.mealsPerDay;
        // calc target calories for user
        report.calcTargetCalories();
        await report.save();

        log.info('Response with index.html OK', { route: req.url });
        res.sendFile(__dirname + '/views/index.html');

    } catch (e) {
        log.error({ route: req.url, error: e.message });
        res.statusCode = 500;
        res.send('Возникла непредвиденная ошибка на стороне сервера :(');
    }
});


app.use(require('./routes/data'));
app.use(require('./routes/send-report'));

app.use(require('./routes/tables/tabs').router);

app.use(require('./routes/tables/vegetables'));
app.use(require('./routes/tables/junk').router);

// get the meals from the requested group
app.get('/meals/:group', async (req, res) => {
    try {
        const meals = await Meal.find({ group: req.params.group });
        log.info('Response with meals json OK', { route: req.url });
        res.json(meals);

    } catch (e) {
        log.error({ route: req.url, error: e.message });
        res.statusCode = 502;
        res.send('Возникла непредвиденная ошибка на стороне сервера :(');
    }
});

app.listen(8080, () => {
    mongoose.connect(process.env.MONGO_URL, () => { 
        console.log('Connected to DB'); 
        log.info('Connected to DB'); 
    });

    console.log('Server started at 8080');
    log.info('Server started at 8080');

    console.log('Logging...');
    log.info('Logging...');
});
