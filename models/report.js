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
        meal: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'meal',
        },
        weight: {
            type: Number,
            min: 0,
        }
    }],

}, { collection: 'reports', versionKey: false });

module.exports = mongoose.model('report', reportSchema);