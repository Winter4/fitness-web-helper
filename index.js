const express = require('express');
const mongoose = require('mongoose');

require('dotenv').config();

const time = require('./time');
const Report = require('./models/report');
const Meal = require('./models/meal');

// 414894488

const app = express();

app.set('view engine', 'hbs');

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

app.listen(3000, () => { 
    mongoose.connect(process.env.MONGO_URL, () => console.log('Connected to DB'));
    console.log('Server started at 3000');
});