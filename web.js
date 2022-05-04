const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config({ path: 'C:/Users/Vladimir/Desktop/calories-app/.env' });

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

// logger
app.use((req, res, next) => {
    log.info('New Request', { method: req.method, url: req.url, query: req.query });
    next();
});

app.get('/', async (req, res) => {

    let report, user;

    if (req.query.user == undefined || Number(req.query.user) < 1) {
        log.warn('Invalid user query', { user: req.query.user });
        res.statusCode = 400;
        res.send('Запрос содержит недопустимые параметры или не содержит их вовсе.');
    }

    try {

        log.info('Getting report from DB', { route: req.url });
        report = await Report.findOne({ user: req.query.user, date: time.today.date() });
        log.info('Got report from DB', { route: req.url });

        log.info('Getting user from DB', { route: req.url });
        user = await User.findOne({ _id: req.query.user });
        log.info('Got user from DB', { route: req.url });

    } catch (e) {
        log.error('DB req for report or user failed', { route: req.url, error: e.message });
        res.statusCode = 502;
        res.send('Возникла непредвиденная ошибка на стороне сервера :(');
    }

    try {
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
                if (i == report.tabs.length - 1) {
                    report.tabs[i].nutrients = [
                        { rate: 0.5, calories: { got: 0 } },
                        { rate: 0.25, calories: { got: 0 } },
                        { rate: 0.25, calories: { got: 0 } },
                    ];
                }
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

        report.mealsPerDay = user.mealsPerDay;
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

app.use(require('./routes/reports/nutrient/nutrient').router);

app.use(require('./routes/reports/non-nutrient/vegetables'));
app.use(require('./routes/reports/non-nutrient/junk').router);


app.get('/meals/:nutrient', async (req, res) => {
    try {

        const meals = await Meal.find({ group: req.params.nutrient });
        log.info('Response with meals json OK', { route: req.url });
        res.json(meals);

    } catch (e) {
        log.error({ route: req.url, error: e.message });
        res.statusCode = 502;
        res.send('Возникла непредвиденная ошибка на стороне сервера :(');
    }
});

app.listen(8080, () => {
    mongoose.connect(process.env.MONGO_URL, () => log.info('Connected to DB'));
    log.info('Server started at 8080');
});
