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

        let report = await Report.findOne({ user: req.query.user, date: time.today.date() });
        const user = await User.findOne({ _id: req.query.user });

        if (report == null) {

            report = new Report({ 
                user: user._id,
                tabs: [{}, {}, {}, {}, {}],

                calories: { got: 0, target: user.caloriesToLose, },

                nonNutrientMeals: {
                    vegetables: { 
                        weight: { eaten: 0, },
                    }
                }
            });

            // init the tabs
            for (let i in report.tabs) {

                report.tabs[i].nutrientRates = i == report.tabs.length - 1 ?
                    {
                        'proteins': 0.5,
                        'fats': 0.25,
                        'carbons': 0.25,
                    } :
                    {
                        'proteins': 0.35,
                        'fats': 0.25,
                        'carbons': 0.4,
                    }

                // create the field
                report.tabs[i].calories.target = -1;
            }  
        }

        report.mealsPerDay = user.mealsPerDay;
        report.calcTargetCalories();
        await report.save();

        res.sendFile(__dirname + '/views/index.html');
    } catch (e) {
        console.error(e);
    }
});


app.use(require('./routes/data'));
app.use(require('./routes/calories-got'));

app.use(require('./routes/reports/nutrient/get'));
app.use(require('./routes/reports/nutrient/post'));
app.use(require('./routes/reports/nutrient/put').router);
app.use(require('./routes/reports/nutrient/delete').router);

app.use(require('./routes/reports/non-nutrient/vegetables'));

app.use(require('./routes/reports/non-nutrient/junk/get'));
app.use(require('./routes/reports/non-nutrient/junk/post'));
app.use(require('./routes/reports/non-nutrient/junk/put'));
app.use(require('./routes/reports/non-nutrient/junk/delete'));

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
