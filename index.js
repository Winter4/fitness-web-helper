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

app.get('/api/reports/:id/:feeding', async (req, res) => {
    
    console.log(':id/:feeding');

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

        res.json({ data: report });

    } catch (e) {
        res.status(500).send('Oops, something went wrong :(');
        console.log(e);
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
