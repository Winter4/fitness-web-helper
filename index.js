const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config();

// _________________________________________

const time = require('./time');
const Report = require('./models/report');
const Meal = require('./models/meal');

// 414894488

const app = express();

app.use(express.static(__dirname + "/public"));
app.use(cors());

// __________________________________________

app.get('/', async (req, res) => {

    let id = req.query.id;

    let exists = Boolean(await Report.exists({ userID: id, date: time.today.date() }));
    if (!(exists)) {
        let report = new Report({ userID: id });
        await report.save();
    }

    res.sendFile(__dirname + '/views/index.html');
});

// header AJAX
app.get('/header/report-data/:id/:yesterday', async (req, res) => {

    let id = req.params.id;
    let yesterday = Boolean(Number(req.params.yesterday));

    let date = !(yesterday) ? time.today.date() : time.yesterday.date();

    let report = await Report.findOne({ userID: id, date: date })

    let answer = {
        date: report.date,

    };

    res.send();
});

// datatables AJAX
app.get('/api/reports/get/:id/:feeding', async (req, res) => {

    let id = req.params.id;
    let feeding = req.params.feeding;
    
    let yesterday = Boolean(Number(req.query.yesterday));
    let date = !(yesterday) ? time.today.date() : time.yesterday.date();

    let report = {};

    try {
        report = await Report.findOne({ userID: id, date: date });

        await report.populate(`${feeding}.meal`);
        switch (feeding) {
            case 'breakfast': report = report.breakfast;
            break;

            case 'dinner': report = report.dinner;
            break;

            case 'supper': report = report.supper;
            break;
        }
        

        let answer = [];

        for (i in report) {
            let weight = report[i].weight;
            let meal = report[i].meal;
            let id = report[i]._id;

            answer.push({
                _id: id,

                meal: meal.calcByWeight(weight),
                weight: weight
            })
        }
        res.json({ data: answer });

    } catch (e) {
        res.status(500).send('Oops, something went wrong :(');
        console.log(e);
    }
});

app.get('/api/reports/set/:id/:feeding', async (req, res) => {

    try {
        let userID = req.params.id;
        let feeding = req.params.feeding;

        let mealID = req.query.meal_id;
        let mealWeight = req.query.weight;

        let yesterday = Boolean(Number(req.query.yesterday));
        let date = !(yesterday) ? time.today.date() : time.yesterday.date();


        let report = await Report.findOne({ userID: userID, date: date });

        switch (feeding) {
            case 'breakfast': report.breakfast.push({ _id: new mongoose.Types.ObjectId, meal: mongoose.Types.ObjectId(mealID), weight: mealWeight });
            break;

            case 'dinner': report.dinner.push({ _id: new mongoose.Types.ObjectId, meal: mongoose.Types.ObjectId(mealID), weight: mealWeight });
            break;

            case 'supper': report.supper.push({ _id: new mongoose.Types.ObjectId, meal: mongoose.Types.ObjectId(mealID), weight: mealWeight });
            break;
        }

        await report.save();
        res.statusCode = 200;
        res.send();
    } catch(e) {
        console.log(e);
    }
});

app.get('/api/reports/del/:id/:feeding', async (req, res) => {

    try {
        let mealID = req.query.row_id;

        let userID = req.params.id;
        let feeding = req.params.feeding;

        let yesterday = Boolean(Number(req.query.yesterday));
        let date = !(yesterday) ? time.today.date() : time.yesterday.date();
        
        let report = await Report.findOne({ userID: userID, date: date });

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

        let userID = req.params.id;
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

        let report = await Report.findOne({ userID: userID, date: date });

        switch (feeding) {
            case 'breakfast': changeByID(report.breakfast, mealID, mealWeight);
            break;

            case 'dinner': changeByID(report.dinner, mealID, mealWeight);
            break;

            case 'supper': changeByID(report.supper, mealID, mealWeight);
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

app.get('/api/meals', async (req, res) => {
    let answer = await Meal.find({}, { "name": true });
    res.json(answer);
});

app.get('/api/meals/:id', async (req, res) => {
    let id = req.params.id;
    res.json(await Meal.findOne({ "_id": mongoose.Types.ObjectId(id) }));
});

app.listen(5500, () => {
    mongoose.connect(process.env.MONGO_URL, () => console.log('Connected to DB'));
    console.log('Server started at 5500');
});
