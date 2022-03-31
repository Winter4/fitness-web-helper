const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config();

const time = require('./time');
const Report = require('./models/report');
const Meal = require('./models/meal');

// 414894488

const app = express();

app.set('view engine', 'hbs');

app.use(cors());

app.get('/meals', async (req, res) => {
    res.json(await Meal.find({}, { "name": true }));
});

app.get('/meals/:id', async (req, res) => {
    console.log('got req');
    let id = req.params.id;
    res.json(await Meal.findOne({ "_id": mongoose.Types.ObjectId(id) }));
});

app.get('/', async (req, res) => {

    const userID = req.query.user_id;
    let report = [];

    try {
        if (userID) {
            report = await Report.findOne({ userID: userID, dayOfWeek: time.today.dayOfWeek() });

            if (report == null) {
                report = new Report({ userID: userID, dayOfWeek: time.today.dayOfWeek() });
                await report.save();
            }
        } 


        let answer = report;
        res.send(answer);

    } catch (e) {
        res.status(500).send('Oops, something went wrong :(');
        console.log(e.message);
    }
});

app.listen(5500, () => { 
    mongoose.connect(process.env.MONGO_URL, () => console.log('Connected to DB'));
    console.log('Server started at 5500');
});