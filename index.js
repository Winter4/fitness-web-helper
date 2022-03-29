const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const time = require('./time');
const Report = require('./models/report');

// 414894488

const app = express();

app.get('/', async (req, res) => {

    const userID = req.query.user_id;
    let answer = [];

    try {
        if (userID) {
            answer = await Report.find({ userID: userID, dayOfWeek: time.today.dayOfWeek() });
            console.log(answer);

            if (answer.length == 0) {
                answer = new Report({ userID: userID, dayOfWeek: time.today.dayOfWeek() });
                await answer.save();
            }
        } 
        else {
            answer = ('No user ID quered :\\');
        }

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