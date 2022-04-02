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

app.get('/:id', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.get('/api/reports/get/:id/:feeding', async (req, res) => {

    let meal = req.params.feeding;
    
    let projection = {};

    try {
        switch (meal) {
            case 'breakfast': projection = { breakfast: true, _id: false };
            break;

            case 'dinner': projection = { dinner: true, _id: false };
            break;

            case 'supper': projection = { supper: true, _id: false };
            break;

            default: throw new Error('Empty meal param');
        }
    } catch (e) {
        res.status(404).send(e);
        console.log(e);
    }

    let id = req.params.id;
    let report = {};

    try {
        report = await Report.findOne({ userID: id, dayOfWeek: time.today.dayOfWeek() }, projection);

        if (report == null) {
            report = new Report({ userID: id, dayOfWeek: time.today.dayOfWeek() });
            await report.save();
        }

        await report.populate('breakfast.meal');
        report = report.breakfast;

        let answer = [];

        for (let i = 0; i < report.length; i++) {
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

        let report = await Report.findOne({ userID: userID, dayOfWeek: time.today.dayOfWeek() });

        switch (feeding) {
            case 'breakfast': report.breakfast.push({ _id: new mongoose.Types.ObjectId, meal: mongoose.Types.ObjectId(mealID), weight: mealWeight });
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

        let report = await Report.findOne({ userID: userID, dayOfWeek: time.today.dayOfWeek() });

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
