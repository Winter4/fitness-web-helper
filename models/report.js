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
    breakfast: [{
        _id: { 
            type: String, 
            ref: 'meal',
            required: true, 
        },
        weight: {
            type: Number,
            required: true,
            min: 0,
        }
    }],

}, { collection: 'reports', versionKey: false });

module.exports = mongoose.model('report', reportSchema);