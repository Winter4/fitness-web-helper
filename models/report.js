const mongoose = require('mongoose');
require('dotenv').config();

const time = require('../time');

const reportSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true,
    },
    dayOfWeek: {
        type: String,
        required: true,
        immutable: true,
        default: () => time.today.dayOfWeek(),
    },
}, { collection: 'reports', versionKey: false });

module.exports = new mongoose.model('reports', reportSchema);