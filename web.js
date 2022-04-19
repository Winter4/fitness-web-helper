const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// _________________________________________

const time = require('./time');
const Report = require('./models/report');
const Meal = require('./models/meal');

const app = express();

// __________________________________________

app.use(express.static(__dirname + "/public"));
app.use(cors());

// __________________________________________

app.get('/', async (req, res) => {
    try {
        let id = req.query.id;

        let exists = Boolean(await Report.exists({ user: id, date: time.today.date() }));
        if (!(exists)) {
            let report = new Report({ user: id });
            await report.save();
        }

        res.sendFile(__dirname + '/views/index.html');
    } catch (e) {
        console.log(e);
    }
});


app.use(require('./routes/data'));
app.use(require('./routes/calories-got'));

app.use(require('./routes/reports/get.js'));
app.use(require('./routes/reports/post.js'));

app.get('/api/reports/del/:id/:feeding', async (req, res) => {
    try {
        let mealID = req.query.row_id;

        let user = req.params.id;
        let feeding = req.params.feeding;

        let yesterday = Boolean(Number(req.query.yesterday));
        let date = !(yesterday) ? time.today.date() : time.yesterday.date();
        
        let report = await Report.findOne({ user: user, date: date });

        const deleteByID = (array, id) => {
            for (i in array) {
                if (id === `'${array[i]._id.toString()}'`) {
                    array.splice(i, 1);
                    break;
                }
            }
        };

        switch (feeding) {
            case 'breakfast': deleteByID(report.breakfast, mealID);
            break;

            case 'dinner': deleteByID(report.dinner, mealID);
            break;

            case 'supper': deleteByID(report.supper, mealID);
            break;

            case 'lunch1': deleteByID(report.lunch1, mealID);
            break;

            case 'lunch2': deleteByID(report.lunch2, mealID);
            break;
        }

        await report.save();

        res.statusCode = 200;
        res.send();

    } catch (e) {
        console.log(e);
        res.statusCode = 502;
        res.send();
    }
});

app.get('/api/reports/put/:id/:feeding', async (req, res) => {
    try {
        let mealID = req.query.row_id;
        let mealWeight = req.query.row_weight

        let user = req.params.id;
        let feeding = req.params.feeding;

        let yesterday = Boolean(Number(req.query.yesterday));
        let date = !(yesterday) ? time.today.date() : time.yesterday.date();

        const changeByID = (array, id, newWeight) => {
            for (i in array) {
                if (id === `'${array[i]._id.toString()}'`) {
                    array[i].weight = newWeight;
                    break;
                }
            }
        };

        let report = await Report.findOne({ user: user, date: date });

        switch (feeding) {
            case 'breakfast': changeByID(report.breakfast, mealID, mealWeight);
            break;

            case 'dinner': changeByID(report.dinner, mealID, mealWeight);
            break;

            case 'supper': changeByID(report.supper, mealID, mealWeight);
            break;

            case 'lunch1': changeByID(report.lunch1, mealID, mealWeight);
            break;

            case 'lunch2': changeByID(report.lunch2, mealID, mealWeight);
            break;
        }

        console.log(report);
        await report.save();

        res.statusCode = 200;
        res.send();

    } catch (e) {
        console.log(e);
        res.statusCode = 502;
        res.send();
    }
});

app.get('/meals', async (req, res) => {
    try {
        let answer = await Meal.find({}, { _id: true, name: true, group: true });
        res.json(answer);
    } catch (e) {
        console.log(e);
    }
});

app.get('/meals/:id', async (req, res) => {
    try {
        let id = req.params.id;
        res.json({ data: await Meal.findOne({ _id: mongoose.Types.ObjectId(id) }) });
    } catch (e) {
        console.log(e);
    }
});

app.listen(8080, () => {
    mongoose.connect(require('./env').MONGO_URL, () => console.log('Connected to DB'));
    console.log('Server started at 8080');
});
