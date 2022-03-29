const express = require('express');
const mongoose = require('mongoose');

require('dotenv').config();

const time = require('./time');
const Report = require('./models/report');

// 414894488

const app = express();

app.set('view engine', 'hbs');

app.get('/', async (req, res) => {

    const userID = req.query.user_id;
    let report = [];

    try {
        if (userID) {
            report = await Report.find({ userID: userID, dayOfWeek: time.today.dayOfWeek() });

            if (report.length == 0) {
                report = new Report({ userID: userID, dayOfWeek: time.today.dayOfWeek() });
                await report.save();
            }
        } 

        res.render('report.hbs', {
            day: 'сегодня',
            date: time.today.date(),
            calories: 2700,
            toEat: 200,
        });

    } catch (e) {
        res.status(500).send('Oops, something went wrong :(');
        console.log(e.message);
    }
});

app.listen(3000, () => { 
    mongoose.connect(process.env.MONGO_URL, () => console.log('Connected to DB'));
    console.log('Server started at 3000');
});