const mongoose = require('mongoose');
require('dotenv').config();

const time = require('../time');
const meal = require('./meal');

const User = require('./user');

const reportSchema = new mongoose.Schema({
    userID: {
        type: Number,
        required: true,
        ref: 'user',
    },
    date: {
        type: String,
        required: true,
        default: () => time.today.date(),
        immutable: true,
    },
    
    breakfast: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        meal: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'meal',
        },
        weight: {
            type: Number,
            min: 0,
        }
    }],
    dinner: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        meal: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'meal',
        },
        weight: {
            type: Number,
            min: 0,
        }
    }],
    supper: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        meal: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'meal',
        },
        weight: {
            type: Number,
            min: 0,
        }
    }],

    calories: Number,

}, { collection: 'reports', versionKey: false });

// calculate calories in the report
reportSchema.pre('save', async function() {
    this.calories = Number(0);

    await this.populate('breakfast.meal');
    for (item of this.breakfast) 
        this.calories += item.meal.getCaloriesByWeight(item.weight);

    await this.populate('dinner.meal');
    for (item of this.dinner) 
        this.calories += item.meal.getCaloriesByWeight(item.weight);

    await this.populate('supper.meal');
    for (item of this.supper) 
        this.calories += item.meal.getCaloriesByWeight(item.weight);
});

module.exports = mongoose.model('report', reportSchema);