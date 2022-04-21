const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// _________________________________________

const time = require('./time');

const Report = require('./models/report');
const Meal = require('./models/meal');
const User = require('./models/user');

const app = express();

// __________________________________________

app.use(express.static(__dirname + "/public"));
app.use(cors());

// __________________________________________

app.get('/', async (req, res) => {
    try {

        const exists = Boolean(await Report.exists({ user: req.query.user, date: time.today.date() }));
        if (!(exists)) {

            const user = await User.findOne({ _id: req.query.user });

            const report = new Report({ 
                user: user._id,
                tabs: [{}, {}, {}, {}, {}],

                calories: { 
                    got: 0, 
                    target: user.caloriesToLose, 
                },
                mealsPerDay: user.mealsPerDay,
            });

            // init the tabs
            for (let i in report.tabs) {

                // fill the nutrient rates
                if (i == report.tabs.length - 1) {
                    report.tabs[i].nutrientRates = {
                        'proteins': 0.5,
                        'fats': 0.25,
                        'carbons': 0.25,
                    }
                }
                else {
                     report.tabs[i].nutrientRates = {
                        'proteins': 0.35,
                        'fats': 0.25,
                        'carbons': 0.4,
                    }
                }

                // create the field
                report.tabs[i].calories.target = -1;
            }

            report.calcTargetCalories();
            await report.save();
        }

        res.sendFile(__dirname + '/views/index.html');
    } catch (e) {
        console.error(e);
    }
});


app.use(require('./routes/data'));
app.use(require('./routes/calories-got'));

app.use(require('./routes/reports/get'));
app.use(require('./routes/reports/post'));
app.use(require('./routes/reports/put'));
app.use(require('./routes/reports/delete'));

app.get('/meals/:nutrient', async (req, res) => {
    try {
        const meals = await Meal.find({ group: req.params.nutrient });
        res.json(meals);
    } catch (e) {
        console.log(e);
    }
});

app.listen(8080, () => {
    mongoose.connect(require('./env').MONGO_URL, () => console.log('Connected to DB'));
    console.log('Server started at 8080');
});
