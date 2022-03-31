const mongoose = require('mongoose');
require('dotenv').config();

const time = require('../time');

const mealSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },
    calories: {
        type: Number,
        required: true,
    },
    proteins: {
        type: Number,
        required: true,
    },
    fats: {
        type: Number,
        required: true,
    },
    carbons: {
        type: Number,
        required: true,
    },
}, { collection: 'meals', versionKey: false });

module.exports = mongoose.model('meals', mealSchema);