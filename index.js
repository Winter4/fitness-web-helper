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
    try {
        let id = req.query.id;

        let exists = Boolean(await Report.exists({ userID: id, date: time.today.date() }));
        if (!(exists)) {
            let report = new Report({ userID: id });
            await report.save();
        }

        res.sendFile(__dirname + '/views/index.html');
    } catch (e) {
        console.log(e);
    }
});

// header AJAX
app.get('/header/calories/:id/:yesterday', async (req, res) => {
    try {
        let id = req.params.id;
        let yesterday = Boolean(Number(req.params.yesterday));

        let date = !(yesterday) ? time.today.date() : time.yesterday.date();

        let report = await Report.findOne({ userID: id, date: date })
        await report.populate('userID');

        let answer = {
            caloriesEaten: report.calories,
            caloriesToEat: report.userID.caloriesToLose,
        };

        res.json(answer);
    } catch (e) {
        console.log(e);
    }
});

app.get('/header/date/:id', async (req, res) => {
    try {
        let id = req.params.id;

        let report = await Report.findOne({ userID: id, date: time.today.date() });
        await report.populate('userID');

        res.json({ 
            today: time.today.date(),
            yesterday: time.yesterday.date(), 
            yesterdayExists: await Report.exists({ userID: id, date: time.yesterday.date() }),
            mealsPerDay: report.userID.mealsPerDay,
        });
    } catch (e) {
        console.log(e);
    }
});

// datatables AJAX
app.get('/api/reports/get/:id/:feeding', async (req, res) => {
    try {
        let id = req.params.id;
        let feeding = req.params.feeding;
        
        let yesterday = Boolean(Number(req.query.yesterday));
        let date = !(yesterday) ? time.today.date() : time.yesterday.date();

        let report = {};

        report = await Report.findOne({ userID: id, date: date });

        let feedingList = [];
        await report.populate(`${feeding}.meal`);
        switch (feeding) {
            case 'breakfast': feedingList = report.breakfast;
            break;

            case 'dinner': feedingList = report.dinner;
            break;

            case 'supper': feedingList = report.supper;
            break;

            case 'lunch1': feedingList = report.lunch1;
            break;

            case 'lunch2': feedingList = report.lunch2;
            break;
        }
        

        let answer = [];

        for (i in feedingList) {
            let weight = feedingList[i].weight;
            let meal = feedingList[i].meal;
            let id = feedingList[i]._id;

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

            case 'lunch1': report.lunch1.push({ _id: new mongoose.Types.ObjectId, meal: mongoose.Types.ObjectId(mealID), weight: mealWeight });
            break;

            case 'lunch2': report.lunch2.push({ _id: new mongoose.Types.ObjectId, meal: mongoose.Types.ObjectId(mealID), weight: mealWeight });
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

            case 'lunch1': changeByID(report.lunch1, mealID, mealWeight);
            break;

            case 'lunch2': changeByID(report.lunch2, mealID, mealWeight);
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
    try {
        let answer = await Meal.find({}, { "name": true });
        res.json(answer);
    } catch (e) {
        console.log(e);
    }
});

app.get('/api/meals/:id', async (req, res) => {
    try {
        let id = req.params.id;
        res.json(await Meal.findOne({ "_id": mongoose.Types.ObjectId(id) }));
    } catch (e) {
        console.log(e);
    }
});

app.listen(5500, () => {
    mongoose.connect(process.env.MONGO_URL, () => console.log('Connected to DB'));
    console.log('Server started at 5500');
});
