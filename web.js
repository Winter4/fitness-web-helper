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

app.use(require('./routes/reports/get'));
app.use(require('./routes/reports/post'));
app.use(require('./routes/reports/put'));
app.use(require('./routes/reports/delete'));


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
